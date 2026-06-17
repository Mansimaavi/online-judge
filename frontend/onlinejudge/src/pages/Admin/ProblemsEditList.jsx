import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProblems } from '../../api';

const ProblemsEditList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchProblems()
      .then(data => {
        if (Array.isArray(data)) {
          setProblems(data);
        } else if (data.error) {
          setError(data.error);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="loader border-2 border-t-2 border-t-indigo-500 border-indigo-200 rounded-full w-8 h-8 animate-spin"></span>
        <span className="ml-3 text-lg text-gray-600">Loading problems...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 mt-10">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Manage & Edit Problems</h2>
      <ul className="divide-y divide-gray-200">
        {problems.map(p => (
          <li key={p.problemNumber} className="py-4 flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-800">{p.title}</span>
              <span className="ml-2 text-xs text-gray-400">#{p.problemNumber}</span>
            </div>
            <button
              className="ml-4 bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded px-4 py-2 cursor-pointer transition-colors"
              onClick={() => navigate(`/admin/panel/edit/${p.problemNumber}`)}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProblemsEditList; 