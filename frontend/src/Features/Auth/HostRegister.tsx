// src/Features/Auth/Pages/HostRegister.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage, logError } from '../../Utils/errorHandler';
import ErrorToast from '../../Components/ErrorToast';
import { registerHost } from '../../Services/AuthService';

const HostRegister: React.FC = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // パスワード確認
    if (formData.password !== formData.confirm_password) {
      setErrorMessage('パスワードが一致しません');
      return;
    }

    try {
      await registerHost(formData);
      alert('登録が完了しました');
      navigate('/login');
    } catch (error) {
      logError(error, 'HostRegister.handleSubmit');
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* エラー表示 */}
      {errorMessage && (
        <ErrorToast
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">オーナー登録</h2>

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
            minLength={6}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">パスワード確認</label>
          <input
            type="password"
            name="confirm_password"
            className="w-full border rounded px-3 py-2"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#2563EB] text-white py-2 rounded hover:bg-blue-600 transition"
        >
          登録する
        </button>

        <p className="text-sm text-gray-600 text-center">
          登録後、店舗情報や個人情報の設定画面に移動します
        </p>
      </form>
    </div>
  );
};

export default HostRegister;