import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../../api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard()
      .then(data => {
        setLeaderboard(data || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load leaderboard');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-800">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center flex items-center justify-center gap-2">
        <span className="text-yellow-400">&#11088;</span> Leaderboard <span className="text-yellow-400">&#11088;</span>
      </h2>
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <span className="loader border-2 border-t-2 border-t-yellow-400 border-gray-700 rounded-full w-8 h-8 animate-spin"></span>
          <span className="ml-3 text-lg text-gray-300">Loading leaderboard...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-6">{error}</div>
      ) : (
        <table className="w-full text-left border-collapse bg-gray-800 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-700 text-yellow-300">
              <th className="py-2 px-3 rounded-tl-lg">Rank</th>
              <th className="py-2 px-3">Username</th>
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3 rounded-tr-lg">Solved</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 && (
              <tr><td colSpan={4} className="text-center py-6 text-gray-500">No data yet.</td></tr>
            )}
            {leaderboard.map((user, idx) => (
              <tr key={user.userId} className={
                idx === 0 ? 'bg-yellow-900/60 text-yellow-300 font-extrabold' :
                idx === 1 ? 'bg-gray-700/80 text-gray-200 font-bold' :
                idx === 2 ? 'bg-yellow-800/60 text-yellow-200 font-bold' :
                'hover:bg-gray-700/60 transition-colors text-gray-200'
              }>
                <td className="py-2 px-3 text-center">{idx + 1}</td>
                <td className="py-2 px-3">{user.username}</td>
                <td className="py-2 px-3">{user.firstName} {user.lastName}</td>
                <td className="py-2 px-3 text-center">{user.solvedCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-6 text-center text-sm text-gray-500">Top 50 users by unique problems solved</div>
    </div>
  );
};

export default Leaderboard; 