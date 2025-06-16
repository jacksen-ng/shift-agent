import React, { useState } from 'react';
import CrewNavbar from '../../../Components/CrewNavbar';
import axios from 'axios';

const ShiftSubmit = () => {
  const [form, setForm] = useState({
    user_id: 1, // 仮ユーザー
    company_id: 1, // 仮会社ID
    day: '',
    start_time: '',
    finish_time: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:8000/submitted-shift', form, {
        headers: {
          Authorization: 'Bearer dummy_token',
        },
      });
      alert('シフト提出が完了しました');
      console.log(res.data);
    } catch (error) {
      alert('提出に失敗しました');
      console.error(error);
    }
  };

  return (
    <>
      <CrewNavbar />
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">シフト提出</h1>

        <div className="space-y-2">
          <label className="block font-semibold">日付（YYYY-MM-DD）</label>
          <input
            type="text"
            name="day"
            className="border rounded px-3 py-2 w-full"
            value={form.day}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-semibold">開始時間（例: 09:00）</label>
          <input
            type="text"
            name="start_time"
            className="border rounded px-3 py-2 w-full"
            value={form.start_time}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-semibold">終了時間（例: 17:00）</label>
          <input
            type="text"
            name="finish_time"
            className="border rounded px-3 py-2 w-full"
            value={form.finish_time}
            onChange={handleChange}
          />
        </div>

        <button
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSubmit}
        >
          提出する
        </button>
      </div>
    </>
  );
};

export default ShiftSubmit;