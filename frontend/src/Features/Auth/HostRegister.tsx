
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
    role: 'owner' as 'owner' | 'crew',
    company_id: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      // クルーの場合はcompany_idが必要
      if (formData.role === 'crew' && !formData.company_id) {
        setErrorMessage('会社IDを入力してください');
        return;
      }

      await registerHost({
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: formData.role,
        ...(formData.role === 'crew' && { company_id: formData.company_id })
      });
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
        <h2 className="text-2xl font-bold text-center">新規登録</h2>

        <div>
          <label className="block font-semibold mb-1">役割</label>
          <select
            name="role"
            className="w-full border rounded px-3 py-2"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="owner">オーナー（店舗管理者）</option>
            <option value="crew">クルー（従業員）</option>
          </select>
        </div>

        {formData.role === 'crew' && (
          <div>
            <label className="block font-semibold mb-1">会社ID</label>
            <input
              type="number"
              name="company_id"
              className="w-full border rounded px-3 py-2"
              value={formData.company_id}
              onChange={handleChange}
              placeholder="所属する会社のIDを入力"
              required={formData.role === 'crew'}
            />
            <p className="text-xs text-gray-500 mt-1">
              ※会社IDは管理者から教えてもらってください
            </p>
          </div>
        )}

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
          {formData.role === 'owner' 
            ? '登録後、店舗情報の設定画面に移動します'
            : '登録後、ログイン画面に移動します'
          }
        </p>
      </form>
    </div>
  );
};

export default HostRegister;