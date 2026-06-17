import Submission from '../models/submission.js';
import Problem from '../models/problem.js';
import submitService from '../services/submitService.js';
import User from '../models/user.js';

export const createSubmission = async (req, res) => {
  try {
    const { problemNumber, code, language } = req.body;
    const userId = req.user._id;

    if (!problemNumber || !code || !language) {
      return res.status(400).json({ 
        success: false, 
        message: 'Problem number, code, and language are required' 
      });
    }

    // Get the problem
    const problem = await Problem.findOne({ problemNumber });
    if (!problem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Problem not found' 
      });
    }

    // Use the same validation logic as run/submit
    const result = await submitService.validateSubmission(problemNumber, code, language);

    // Create submission record
    const submission = await Submission.create({
      user: userId,
      problem: problem._id,
      problemNumber,
      code,
      language,
      status: result.status,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      executionTime: result.executionTime,
      testResults: result.testResults,
      message: result.message
    });

    // Return the same format as run/submit but with submission info
    const responseData = {
      result: result.status,
      message: result.message,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      executionTime: result.executionTime,
      testResults: result.testResults,
      submissionId: submission._id,
      createdAt: submission.createdAt
    };

    // Add failedTestCases for wrong answers
    if (result.status === 'Wrong Answer') {
      responseData.failedTestCases = result.testResults.filter(test => !test.passed);
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Submission creation error:', error);
    
    // Return error in the same format as run/submit
    res.status(500).json({ 
      error: error.message,
      result: 'Error',
      message: 'Compilation or runtime error occurred'
    });
  }
};

export const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, problemNumber } = req.query;

    const query = { user: userId };
    if (problemNumber) {
      query.problemNumber = parseInt(problemNumber);
    }

    const submissions = await Submission.find(query)
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Submission.countDocuments(query);

    res.status(200).json({
      success: true,
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get submissions',
      error: error.message 
    });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findOne({ _id: submissionId, user: userId })
      .populate('problem', 'title difficulty description');

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    res.status(200).json({
      success: true,
      submission
    });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get submission',
      error: error.message 
    });
  }
}; 

export const getLeaderboard = async (req, res) => {
  try {
    // Aggregate unique accepted problems per user
    const solved = await Submission.aggregate([
      { $match: { status: 'Accepted' } },
      { $group: { _id: { user: '$user', problemNumber: '$problemNumber' } } },
      { $group: { _id: '$_id.user', solvedCount: { $sum: 1 } } },
      { $sort: { solvedCount: -1 } },
      { $limit: 50 }
    ]);

    // Get user details
    const userIds = solved.map(s => s._id);
    const users = await User.find({ _id: { $in: userIds } }, 'username firstName lastName');
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    const leaderboard = solved.map(s => ({
      userId: s._id,
      username: userMap[s._id]?.username || 'Unknown',
      firstName: userMap[s._id]?.firstName || '',
      lastName: userMap[s._id]?.lastName || '',
      solvedCount: s.solvedCount
    }));

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}; 