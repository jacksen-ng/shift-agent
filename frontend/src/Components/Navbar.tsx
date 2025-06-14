import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-gray-100 px-6 py-3 flex justify-between items-center shadow">
      <div className="text-xl font-bold">ShiftGemini</div>
      <div className="space-x-4">
        <button className="text-gray-700 hover:text-mint" onClick={() => navigate('/host/home')}>
          Home
        </button>
        <button className="text-gray-700 hover:text-mint" onClick={() => navigate('/host/store-info')}>
          店舗情報
        </button>
        <button className="text-gray-700 hover:text-mint" onClick={() => navigate('/host/crew-info')}>
          従業員情報
        </button>
        <button className="text-gray-700 hover:text-mint" onClick={() => navigate('/host/shift-submit')}>
          シフト
        </button>
      </div>
    </nav>
  );
};

export default Navbar;