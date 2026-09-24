import User from '../models/user.js';
import Problem from '../models/problem.js';
import Submission from '../models/submission.js';
import mongoose from 'mongoose';

// GET /api/admin/users?page=1&limit=20&search=foo
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const search = (req.query.search || '').trim();

    const filter = search
      ? {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// PATCH /api/admin/users/:id/role  { role: 'admin' | 'user' }
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "role must be 'user' or 'admin'" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    // An admin demoting themselves would be a confusing way to lock
    // yourself out (or, on a single-admin system, lock everyone out of
    // admin entirely) - block it rather than silently allowing it.
    if (String(req.user._id) === String(id) && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot remove your own admin role' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};

// GET /api/admin/statistics
export const getSystemStatistics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProblems,
      totalSubmissions,
      statusBreakdown,
      languageBreakdown,
      recentSubmissions,
    ] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments(),
      Submission.countDocuments(),
      Submission.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Submission.aggregate([
        { $group: { _id: '$language', count: { $sum: 1 } } },
      ]),
      Submission.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'username')
        .select('problemNumber language status createdAt user'),
    ]);

    const statusCounts = Object.fromEntries(statusBreakdown.map(s => [s._id, s.count]));
    const acceptedCount = statusCounts['Accepted'] || 0;

    res.status(200).json({
      success: true,
      statistics: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        acceptedSubmissions: acceptedCount,
        failedSubmissions: totalSubmissions - acceptedCount,
        statusBreakdown: statusCounts,
        languageBreakdown: Object.fromEntries(languageBreakdown.map(l => [l._id, l.count])),
        recentActivity: recentSubmissions.map(s => ({
          problemNumber: s.problemNumber,
          language: s.language,
          status: s.status,
          username: s.user?.username || 'Unknown',
          createdAt: s.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

// GET /api/admin/submissions?status=&language=&problemNumber=&page=&limit=
export const getAllSubmissions = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.language) filter.language = req.query.language;
    if (req.query.problemNumber) filter.problemNumber = parseInt(req.query.problemNumber);

    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'username')
        .select('-code -testResults'),
      Submission.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      submissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
  }
};
