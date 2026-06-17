import { useState, useEffect } from 'react';
import { fetchSubmissions } from '../../api';
import { FaCheck, FaTimes, FaClock, FaCode, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Submissions = ({ user }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProblem, setSelectedProblem] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }
    loadSubmissions();
  }, [currentPage, selectedProblem, user, navigate]);

  const loadSubmissions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await fetchSubmissions();
      if (data.success) {
        setSubmissions(data.submissions || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(parseInt(data.currentPage) || 1);
      } else {
        setError(data.message || 'Failed to load submissions');
      }
    } catch (err) {
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-500 bg-green-500/20 border-green-500/30';
      case 'Wrong Answer':
        return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'Compilation Error':
        return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'Runtime Error':
        return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      case 'Time Limit Exceeded':
        return 'text-purple-500 bg-purple-500/20 border-purple-500/30';
      default:
        return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return <FaCheck className="text-green-500" />;
      case 'Wrong Answer':
        return <FaTimes className="text-red-500" />;
      case 'Compilation Error':
      case 'Runtime Error':
      case 'Time Limit Exceeded':
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaCode className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // If not logged in, show loading (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading && submissions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            My Submissions
          </h1>
          <p className="text-gray-400">Track your coding progress and submission history</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <h2 className="text-xl font-semibold">Submission History</h2>
              <div className="flex gap-2">
                <select
                  value={selectedProblem}
                  onChange={(e) => setSelectedProblem(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Problems</option>
                  {/* We can add problem filtering later */}
                </select>
              </div>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center">
              <FaCode className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No submissions yet</h3>
              <p className="text-gray-500">Start solving problems to see your submission history here.</p>
              <button
                onClick={() => navigate('/problems')}
                className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition"
              >
                Browse Problems
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Problem</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Language</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Tests</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                          {getStatusIcon(submission.status)}
                          {submission.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">
                            Problem {submission.problemNumber}
                          </div>
                          {submission.problem?.title && (
                            <div className="text-sm text-gray-400">{submission.problem.title}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {submission.language.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="text-green-400">{submission.passedTests}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-white">{submission.totalTests}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          {submission.executionTime}ms
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400">
                          {formatDate(submission.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="inline-flex items-center gap-2 px-3 py-1 rounded text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors"
                          onClick={() => navigate(`/problems/${submission.problemNumber}`)}
                        >
                          <FaEye size={14} />
                          View Problem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Submissions; 