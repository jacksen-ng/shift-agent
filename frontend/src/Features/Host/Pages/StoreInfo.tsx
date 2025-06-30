import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../Services/apiClient';
import { logout } from '../../../Services/AuthService';
import { getErrorMessage, logError } from '../../../Utils/errorHandler';
import ErrorToast from '../../../Components/ErrorToast';
import { formatTimeToISO, formatTimeDisplay } from '../../../Utils/FormatDate';

interface StoreData {
  company_name: string;
  store_locate: string;
  open_time: string;
  close_time: string;
  target_sales: number;
  labor_cost: number;
  rest_day: string[];
  position_name: string[];
}

const StoreInfo = () => {
  const navigate = useNavigate();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StoreData>({
    company_name: '',
    store_locate: '',
    open_time: '',
    close_time: '',
    target_sales: 0,
    labor_cost: 0,
    rest_day: [],
    position_name: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newPosition, setNewPosition] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const weekDays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        const companyId = localStorage.getItem('company_id') || '1';
        
        const response = await apiClient.get<StoreData>('/company-info', {
          params: { company_id: parseInt(companyId) },
        });
        setStoreData(response.data);
        setFormData(response.data);
      } catch (error) {
        logError(error, 'StoreInfo.fetchStoreData');
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'target_sales' || name === 'labor_cost') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRestDayToggle = (day: string) => {
    if (formData.rest_day.includes(day)) {
      setFormData({
        ...formData,
        rest_day: formData.rest_day.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        rest_day: [...formData.rest_day, day]
      });
    }
  };

  const handleAddPosition = () => {
    if (newPosition && !formData.position_name.includes(newPosition)) {
      setFormData({
        ...formData,
        position_name: [...formData.position_name, newPosition]
      });
      setNewPosition('');
    }
  };

  const handleRemovePosition = (position: string) => {
    setFormData({
      ...formData,
      position_name: formData.position_name.filter(p => p !== position)
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const companyId = localStorage.getItem('company_id') || '1';
      
      // API設計に準拠したリクエスト形式
      const requestData = {
        company_info: {
          company_id: parseInt(companyId),
          company_name: formData.company_name,
          store_locate: formData.store_locate,
          open_time: formatTimeToISO(formData.open_time),
          close_time: formatTimeToISO(formData.close_time),
          target_sales: formData.target_sales,
          labor_cost: formData.labor_cost
        },
        rest_day: formData.rest_day.map(day => ({ rest_day: day })),
        position: formData.position_name.map(pos => ({ position_name: pos }))
      };

      await apiClient.post('/company-info-edit', requestData);

      setIsEditing(false);
      alert('保存が完了しました');
    } catch (error) {
      logError(error, 'StoreInfo.handleSave');
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">店舗情報が見つかりません</div>
      </div>
    );
  }

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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/host/home')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">店舗情報管理</h1>
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

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 基本情報 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">基本情報</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                店舗基本情報
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">会社名</label>
                <input
                  name="company_name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                  value={formData.company_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">所在地</label>
                <input
                  name="store_locate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                  value={formData.store_locate}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">営業時間</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">開店時間</label>
                    <input
                      name="open_time"
                      type="time"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                      value={formatTimeDisplay(formData.open_time)}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">閉店時間</label>
                    <input
                      name="close_time"
                      type="time"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                      value={formatTimeDisplay(formData.close_time)}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 経営情報 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">経営情報</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                売上・コスト管理
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">月間売上目標</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                  <input
                    name="target_sales"
                    type="number"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                    value={formData.target_sales}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">月間の売上目標金額を設定します</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">月間人件費予算</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                  <input
                    name="labor_cost"
                    type="number"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                    value={formData.labor_cost}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">月間の人件費予算を設定します</p>
              </div>

              {/* 人件費率 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">人件費率</span>
                  <span className="text-lg font-bold text-purple-600">
                    {formData.target_sales > 0 
                      ? `${((formData.labor_cost / formData.target_sales) * 100).toFixed(1)}%`
                      : '---%'
                    }
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">目標値: 30%以下</p>
              </div>
            </div>
          </div>

          {/* 定休日設定 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">定休日設定</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                週間定休日
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {weekDays.map((day) => (
                <button
                  key={day}
                  onClick={() => isEditing && handleRestDayToggle(day)}
                  disabled={!isEditing}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    formData.rest_day.includes(day)
                      ? 'bg-red-100 text-red-700 border-2 border-red-300'
                      : 'bg-gray-50 text-gray-600 border-2 border-gray-200'
                  } ${
                    isEditing 
                      ? 'hover:border-red-300 cursor-pointer' 
                      : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {formData.rest_day.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  定休日: {formData.rest_day.join('、')}
                </p>
              </div>
            )}
          </div>

          {/* ポジション管理 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">ポジション管理</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                業務ポジション
              </div>
            </div>

            {isEditing && (
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="新しいポジション名"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPosition()}
                  />
                  <button
                    onClick={handleAddPosition}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    追加
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {formData.position_name.length > 0 ? (
                formData.position_name.map((position, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-700">{position}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemovePosition(position)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">ポジションが登録されていません</p>
              )}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-6 flex justify-end gap-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              編集する
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(storeData);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    保存中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    保存する
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreInfo;