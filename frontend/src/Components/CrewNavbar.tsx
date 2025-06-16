import React from 'react';
import { useNavigate } from 'react-router-dom';

const CrewNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-gray-100 px-6 py-3 flex justify-between items-center shadow">
      <div className="text-xl font-bold">ShiftGemini</div>
      <div className="space-x-4">
        <button className="text-gray-700 hover:text-mint" onClick={() => navigate('/crew/home')}>
          ホーム
        </button>
        <button className="text-gray-700 hover:text-mint" onClick={() => navigate('/crew/shift-submit')}>
          シフト提出
        </button>
      </div>
    </nav>
  );
};

export default CrewNavbar;