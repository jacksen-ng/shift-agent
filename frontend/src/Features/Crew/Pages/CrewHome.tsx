import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CrewNavbar from '../../../Components/CrewNavbar';

interface ShiftData {
  day: string;
  start_time: string;
  finish_time: string;
}

const CrewHome = () => {
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDates = ['2025-06-16', '2025-06-17', '2025-06-18', '2025-06-19', '2025-06-20', '2025-06-21', '2025-06-22'];

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await axios.get<ShiftData[]>('http://localhost:8000/submitted-shift', {
          params: { company_id: 1, user_id: 1 },
          headers: { Authorization: 'Bearer dummy_token' },
        });
        setShifts(response.data);
      } catch (err) {
        console.error('シフト情報の取得に失敗しました', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  const getShiftText = (date: string) => {
    const shift = shifts.find((s) => s.day === date);
    return shift ? `${shift.start_time}~${shift.finish_time}` : '-';
  };

  if (loading) return <div className="p-6">読み込み中...</div>;

  return (
    <>
      <CrewNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">シフト確認（クルー）</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-center">
            <thead>
              <tr>
                <th className="border px-4 py-2">名前</th>
                {weekDates.map((date, index) => (
                  <th key={index} className="border px-4 py-2">{date.slice(5)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">自分</td>
                {weekDates.map((date, index) => (
                  <td key={index} className="border px-4 py-2">
                    {getShiftText(date)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CrewHome;