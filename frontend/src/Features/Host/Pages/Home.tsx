// src/Features/Host/Pages/Home.tsx

import React from 'react';
import Navbar from '../../../Components/Navbar';
import { useNavigate } from 'react-router-dom';

const HostHome: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-between px-8 pt-24">
        {/* 左スペース（仮スペース） */}
        <div className="w-2/3 pr-8">
          {/* 今後のコンテンツ追加用 */}
        </div>

        {/* 右側のボタン一覧 */}
        <div className="w-1/3 flex flex-col space-y-6">
          <button
            onClick={() => handleNavigate('/host/store-info')}
            className="py-6 px-4 text-lg font-semibold text-black bg-white border border-gray-300 rounded-xl shadow-md hover:bg-gray-100 transition duration-200"
          >
            店舗情報
          </button>
          <button
            onClick={() => handleNavigate('/host/crew-info')}
            className="py-6 px-4 text-lg font-semibold text-black bg-white border border-gray-300 rounded-xl shadow-md hover:bg-gray-100 transition duration-200"
          >
            従業員情報
          </button>
          <button
            onClick={() => handleNavigate('/host/shift-submit')}
            className="py-6 px-4 text-lg font-semibold text-black bg-white border border-gray-300 rounded-xl shadow-md hover:bg-gray-100 transition duration-200"
          >
            シフト
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostHome;