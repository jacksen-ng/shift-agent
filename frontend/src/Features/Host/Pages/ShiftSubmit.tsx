import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CrewNavbar from '../../../Components/CrewNavbar';

const ShiftSubmit = () => {
  const navigate = useNavigate();
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [finishTime, setFinishTime] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8000/submitted-shift', {
        user_id: 1,
        company_id: 1,
        day,
        start_time: startTime,
        finish_time: finishTime,
      }, {
        headers: {
          Authorization: 'Bearer dummy_token',
        }
      });

      alert('シフトを提出しました');
      navigate('/crew/home');
    } catch (error) {
      alert('提出に失敗しました');
      console.error(error);
    }
  };

  return (
    <>
      <CrewNavbar />
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">シフト提出</h1>
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">日付（例：2025-06-17）</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">開始時間（例：09:00）</label>
            <input
              type="time"
              className="w-full border rounded px-3 py-2"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">終了時間（例：18:00）</label>
            <input
              type="time"
              className="w-full border rounded px-3 py-2"
              value={finishTime}
              onChange={(e) => setFinishTime(e.target.value)}
            />
          </div>
          <button
            className="w-full py-2 bg-mint text-white font-semibold rounded hover:opacity-90"
            onClick={handleSubmit}
          >
            提出する
          </button>
        </div>
      </div>
    </>
  );
};

export default ShiftSubmit;