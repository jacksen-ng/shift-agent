// src/Features/Host/Pages/Home.tsx
import React from 'react';

const Home = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">オーナー用ホーム</h1>
      <ul className="space-y-2">
        <li className="border p-4 rounded shadow">📅 シフト作成</li>
        <li className="border p-4 rounded shadow">🏪 店舗情報編集</li>
        <li className="border p-4 rounded shadow">👥 従業員管理</li>
        <li className="border p-4 rounded shadow">🤖 Gemini で相談</li>
      </ul>
    </div>
  );
};

export default Home;

export {}; // モジュール化のためのダミーエクスポート
