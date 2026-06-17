import React, { useEffect, useState } from 'react';
import { fetchUserCount } from '../../api';
import { useNavigate } from 'react-router-dom';

const AdminView = () => {
  const [userCount, setUserCount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserCount().then(count => setUserCount(count));
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="flex-1 bg-gray-100 rounded-xl p-8 text-center shadow-md min-h-[120px] flex flex-col justify-center">
          <h2 className="text-2xl mb-3 font-semibold text-gray-700">Total Users</h2>
          <div className="text-5xl font-bold text-indigo-500">{userCount ?? <span className="animate-pulse">...</span>}</div>
        </div>
        <div
          className="flex-1 bg-gray-100 rounded-xl p-8 text-center shadow-md min-h-[120px] flex flex-col justify-center cursor-pointer hover:bg-indigo-50 transition-colors"
          onClick={() => navigate('/admin/panel/problems')}
        >
          <h2 className="text-2xl mb-3 font-semibold text-gray-700">Edit Problems</h2>
          <div className="text-5xl font-bold text-indigo-500">&#9998;</div>
          <div className="mt-2 text-sm text-gray-500">Click to manage and edit problems</div>
        </div>
      </div>
    </div>
  );
};

export default AdminView; 