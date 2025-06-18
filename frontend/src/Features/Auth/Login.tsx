import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../Services/AuthService'; // Service を使う想定

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(formData.email, formData.password) as {
        user_id: string;
        company_id: string;
        role: 'host' | 'crew';
        message: string;
      };

      localStorage.setItem('user_id', response.user_id);
      localStorage.setItem('company_id', response.company_id);
      localStorage.setItem('role', response.role);

      if (response.role === 'host') {
        navigate('/host/home');
      } else if (response.role === 'crew') {
        navigate('/crew/home');
      } else {
        alert('不明なユーザータイプです');
      }
    } catch (error) {
      alert('ログインに失敗しました');
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">ログイン</h2>
        <input
          type="email"
          name="email"
          className="w-full border px-3 py-2 mb-4"
          placeholder="メールアドレス"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          className="w-full border px-3 py-2 mb-6"
          placeholder="パスワード"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          ログイン
        </button>
        <div className="text-center mt-4">
          <a href="/register/host" className="text-blue-500 hover:underline">
            オーナー新規登録はこちら
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;