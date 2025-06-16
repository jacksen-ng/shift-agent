// src/Features/Host/Pages/Home.tsx
import React, { useEffect, useState } from 'react';
import Navbar from '../../../Components/Navbar';
import { useNavigate } from 'react-router-dom';
import { fetchDecisionShift } from '../../../Services/ShiftService';

interface Shift {
  name: string;
  position: string;
  post: string;
  day: string;
  start_time: string;
  finish_time: string;
}

const HostHome: React.FC = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [restDays, setRestDays] = useState<string[]>([]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchDecisionShift('dummy_company');
        setShifts(res.shifts || []);
        setRestDays(res.rest_day || []);
      } catch (e) {
        console.error('シフト取得に失敗しました', e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-between px-8 pt-24">
        {/* 左：シフト情報表示 */}
        <div className="w-2/3 pr-8">
          <h2 className="text-xl font-semibold mb-4">確定シフト一覧</h2>
          <ul className="space-y-2">
            {shifts.map((shift, index) => (
              <li key={index} className="bg-white p-4 shadow rounded border">
                <p><strong>{shift.day}</strong>：{shift.name}（{shift.position}/{shift.post}）{shift.start_time}〜{shift.finish_time}</p>
              </li>
            ))}
            {restDays.length > 0 && (
              <li className="mt-4">
                <strong>休業日：</strong>{restDays.join('、')}
              </li>
            )}
          </ul>
        </div>

        {/* 右：ナビゲーションボタン */}
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