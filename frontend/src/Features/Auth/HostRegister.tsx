// src/Features/Auth/Pages/HostRegister.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../Services/apiClient';

const HostRegister: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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
    console.log("送信データ:", formData); // ★ここで確認！
    const response = await apiClient.post("/host/register", formData);
    alert("登録が完了しました");
    navigate("/login");
  } catch (error) {
    alert("登録に失敗しました");
    console.error("エラー内容:", error);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">オーナー登録</h2>

        <div>
          <label className="block font-semibold mb-1">名前</label>
          <input
            type="text"
            name="name"
            className="w-full border rounded px-3 py-2"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">メールアドレス</label>
          <input
            type="email"
            name="email"
            className="w-full border rounded px-3 py-2"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">パスワード</label>
          <input
            type="password"
            name="password"
            className="w-full border rounded px-3 py-2"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          登録する
        </button>
      </form>
    </div>
  );
};

export default HostRegister;