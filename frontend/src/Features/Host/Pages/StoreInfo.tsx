// src/Features/Host/Pages/StoreInfo.tsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const StoreInfo = () => {
  const location = useLocation();
  const [storeData, setStoreData] = useState<any>(null);

  useEffect(() => {
    if (location.state?.storeData) {
      setStoreData(location.state.storeData);
    }
  }, [location.state]);

  if (!storeData) {
    return <div className="p-4">店舗情報を読み込み中...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">店舗情報</h1>
      <ul className="space-y-2">
        <li><strong>会社名：</strong>{storeData.company_name}</li>
        <li><strong>所在地：</strong>{storeData.store_locate}</li>
        <li><strong>営業時間：</strong>{storeData.open_time} 〜 {storeData.close_time}</li>
        <li><strong>売上目標：</strong>{storeData.target_sales}円</li>
        <li><strong>人件費：</strong>{storeData.labor_cost}円</li>
        <li><strong>定休日：</strong>{storeData.rest_day.join(', ')}</li>
        <li><strong>ポジション：</strong>{storeData.position_name.join(', ')}</li>
      </ul>
    </div>
  );
};

export default StoreInfo;