import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../Services/apiClient';
import { logout } from '../../../Services/AuthService';
import { getErrorMessage, logError } from '../../../Utils/errorHandler';
import ErrorToast from '../../../Components/ErrorToast';

interface CrewFormData {
  name: string;
  email: string;
  age: number;
  phone: string;
  position: string;
  evaluate: number;
  experience: 'beginner' | 'veteran';
  join_company_day: string;
  hour_pay: number;
  post: string;
}

const CrewCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CrewFormData>({
    name: '',
    email: '',
    age: 20,
    phone: '',
    position: '',
    evaluate: 3,
    experience: 'beginner',
    join_company_day: new Date().toISOString().split('T')[0],
    hour_pay: 1000,
    post: 'part_timer',
  });
  const [saving, setSaving] = useState(false);
  const [positions, setPositions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 評価を星で表示
  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => interactive && handleChange({ target: { name: 'evaluate', value: String(i + 1) } } as any)}
        className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        disabled={!interactive}
      >
        <svg
          className={`w-6 h-6 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} ${
            interactive ? 'hover:text-yellow-300' : ''
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ));
  };

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const companyId = localStorage.getItem('company_id') || '1';
        
        interface StoreResponse {
          company_name: string;
          store_locate: string;
          open_time: string;
          close_time: string;
          target_sales: number;
          labor_cost: number;
          rest_day: string[];
          position_name: string[];
        }
        
        const storeResponse = await apiClient.get<StoreResponse>('/company-info', {
          params: { company_id: parseInt(companyId) },
        });
        setPositions(storeResponse.data.position_name || []);
      } catch (error) {
        logError(error, 'CrewCreate.fetchPositions');
        setErrorMessage(getErrorMessage(error));
      }
    };

    fetchPositions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'age' || name === 'evaluate' || name === 'hour_pay') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const companyId = localStorage.getItem('company_id') || '1';
      
      // APIに準拠したリクエスト
      const requestData = {
        company_id: parseInt(companyId),
        email: formData.email,
        auth0_id: `auth0|${Date.now()}`, // Mock用の仮ID
        name: formData.name,
        age: formData.age,
        phone: formData.phone,
        position: formData.position,
        evaluate: formData.evaluate,
        experience: formData.experience,
        join_company_day: formData.join_company_day,
        hour_pay: formData.hour_pay,
        post: formData.post
      };

      await apiClient.post('/crew-info', requestData);
      
      alert('従業員を追加しました');
      navigate('/host/crew-info');
    } catch (error) {
      logError(error, 'CrewCreate.handleSubmit');
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* エラー表示 */}
      {errorMessage && (
        <ErrorToast
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/host/crew-info')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">従業員追加</h1>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ログアウト
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              基本情報
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">氏名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">年齢 <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="99"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電話番号 <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="090-1234-5678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">入社日 <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="join_company_day"
                  value={formData.join_company_day}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* 勤務情報 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              勤務情報
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ポジション <span className="text-red-500">*</span></label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">選択してください</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">雇用形態 <span className="text-red-500">*</span></label>
                <select
                  name="post"
                  value={formData.post}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="part_timer">アルバイト</option>
                  <option value="employee">社員</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">時給 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                  <input
                    type="number"
                    name="hour_pay"
                    value={formData.hour_pay}
                    onChange={handleChange}
                    min="0"
                    step="10"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">初期評価</label>
                <div className="flex items-center gap-2">
                  {renderStars(formData.evaluate, true)}
                  <span className="text-sm text-gray-600 ml-2">({formData.evaluate}/5)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">経験レベル <span className="text-red-500">*</span></label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="beginner">初心者</option>
                  <option value="veteran">ベテラン</option>
                </select>
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">登録時の注意事項</p>
                <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                  <li>従業員は自分で新規登録画面からアカウントを作成する必要があります</li>
                  <li>登録時には会社IDが必要となります</li>
                  <li>登録後の情報変更は編集画面から行えます</li>
                </ul>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/host/crew-info')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  登録中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  登録する
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrewCreate;