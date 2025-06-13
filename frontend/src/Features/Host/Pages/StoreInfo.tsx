// src/Features/Host/Pages/StoreInfo.tsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../../Components/Navbar';

const StoreInfo: React.FC = () => {
  const location = useLocation();
  const [storeData, setStoreData] = useState<any>(null);

  useEffect(() => {
    if (location.state?.storeData) {
      setStoreData(location.state.storeData);
    }
  }, [location.state]);

  if (!storeData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Navbar />
        <p className="text-lg">店舗情報を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Navbar />

      <h1 className="text-2xl font-bold mb-6">店舗情報管理</h1>

      <div className="flex gap-8">
        {/* 左半分：営業情報 */}
        <div className="w-1/2 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">営業日情報</h2>
            <p className="mb-2">🕘 <strong>営業時間：</strong>{storeData.open_time} 〜 {storeData.close_time}</p>
            <p className="mb-2">📅 <strong>定休日：</strong>{storeData.rest_day.join(', ')}</p>
            <p className="mb-2">👥 <strong>ポジション：</strong>{storeData.position_name.join(', ')}</p>
          </div>
        </div>

        {/* 右半分：金銭情報 */}
        <div className="w-1/2 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">金銭情報</h2>
            <p className="mb-2">💰 <strong>売上目標：</strong>{storeData.target_sales.toLocaleString()}円</p>
            <p className="mb-2">🧾 <strong>人件費：</strong>{storeData.labor_cost.toLocaleString()}円</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreInfo;