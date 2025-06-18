import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CrewCreate: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    position: '',
    evaluate: '',
    join_company_day: '',
    hour_pay: '',
    post: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8000/crew-info',
        {
          ...formData,
          age: Number(formData.age),
          phone: Number(formData.phone),
          evaluate: Number(formData.evaluate),
          hour_pay: Number(formData.hour_pay),
        },
        {
          headers: {
            Authorization: 'Bearer dummy_token',
          },
        }
      );
      alert('従業員を登録しました');
      navigate('/host/crew-info');
    } catch (error) {
      alert('登録に失敗しました');
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">新しい従業員を登録</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          ['名前', 'name'],
          ['年齢', 'age'],
          ['電話番号', 'phone'],
          ['ポジション', 'position'],
          ['評価', 'evaluate'],
          ['入社日 (YYYY-MM-DD)', 'join_company_day'],
          ['時給', 'hour_pay'],
          ['雇用形態', 'post'],
        ].map(([label, key]) => (
          <div key={key}>
            <label className="block font-semibold mb-1">{label}</label>
            <input
              type="text"
              name={key}
              className="w-full border rounded px-3 py-2"
              value={(formData as any)[key]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          登録
        </button>
      </form>
    </div>
  );
};

export default CrewCreate;