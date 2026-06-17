import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProblemByNumber } from '../../api';
import EditProblem from './EditProblem';

const EditProblemPage = () => {
  const { problemNumber } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchProblemByNumber(problemNumber)
      .then(data => {
        if (data && !data.error) {
          setProblem(data);
        } else {
          setError(data.error || 'Problem not found');
        }
      })
      .finally(() => setLoading(false));
  }, [problemNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="loader border-2 border-t-2 border-t-indigo-500 border-indigo-200 rounded-full w-8 h-8 animate-spin"></span>
        <span className="ml-3 text-lg text-gray-600">Loading problem...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 mt-10">{error}</div>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-2xl h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-gray-100 p-2 bg-white rounded-xl shadow-lg">
        <EditProblem
          problem={problem}
          onClose={() => navigate('/admin/panel', { state: { message: 'Problem updated successfully!' } })}
        />
      </div>
    </div>
  );
};

export default EditProblemPage; 