import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface CrewProfile {
  name: string;
  age: number;
  phone: number;
  position: string;
  evaluate: number;
  join_company_day: string;
  hour_pay: number;
  post: string;
}

const CrewEdit = () => {
  const { name } = useParams<{ name: string }>();
  const [formData, setFormData] = useState<CrewProfile>({
    name: '',
    age: 0,
    phone: 0,
    position: '',
    evaluate: 1,
    join_company_day: '',
    hour_pay: 0,
    post: '',
  });

  useEffect(() => {
    axios.get<CrewProfile[]>('http://localhost:8000/crew-info', {
      params: { company_id: 'dummy_company' },
      headers: { Authorization: 'Bearer dummy_token' },
    }).then((res) => {
      const crew = res.data.find((c) => c.name === name);
      if (crew) setFormData(crew);
    });
  }, [name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'age' || name === 'phone' || name === 'evaluate' || name === 'hour_pay' ? Number(value) : value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`http://localhost:8000/crew-info/${name}`, formData, {
        headers: { Authorization: 'Bearer dummy_token' },
      });
      alert('更新しました');
    } catch (error) {
      alert('更新に失敗しました');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">従業員情報編集</h1>
      <input type="text" name="name" value={formData.name} onChange={handleChange} className="border p-2 mb-2 w-full" />
      <input type="number" name="age" value={formData.age} onChange={handleChange} className="border p-2 mb-2 w-full" />
      <input type="number" name="phone" value={formData.phone} onChange={handleChange} className="border p-2 mb-2 w-full" />
      <input type="text" name="position" value={formData.position} onChange={handleChange} className="border p-2 mb-2 w-full" />
      <input type="number" name="evaluate" value={formData.evaluate} onChange={handleChange} className="border p-2 mb-2 w-full" />
      <input type="text" name="join_company_day" value={formData.join_company_day} onChange={handleChange} className="border p-2 mb-2 w-full" />
      <input type="number" name="hour_pay" value={formData.hour_pay} onChange={handleChange} className="border p-2 mb-2 w-full" />
      <input type="text" name="post" value={formData.post} onChange={handleChange} className="border p-2 mb-4 w-full" />
      <button onClick={handleSubmit} className="bg-mint text-black px-4 py-2 rounded">保存</button>
    </div>
  );
};

export default CrewEdit;