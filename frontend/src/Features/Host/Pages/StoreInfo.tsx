import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../Services/apiClient';
import { logout } from '../../../Services/AuthService';
import { getErrorMessage, logError } from '../../../Utils/errorHandler';
import ErrorToast from '../../../Components/ErrorToast';
import { formatTimeToISO, formatTimeDisplay, formatTimeForInput } from '../../../Utils/FormatDate';
import Calendar from '../../../Components/Calendar';

interface StoreData {
  company_name: string;
  store_locate: string;
  open_time: string;
  close_time: string;
  target_sales: number;
  labor_cost: number;
  rest_days: string[]; // 日付の配列 (YYYY-MM-DD形式)
  position_names: string[];
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
    rest_days: [],
    position_names: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newPosition, setNewPosition] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [showRestDayType, setShowRestDayType] = useState<'calendar' | 'weekly'>('calendar');

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        const companyId = localStorage.getItem('company_id') || '1';
        
        const response = await apiClient.get('/company-info', {
          params: { company_id: parseInt(companyId) },
        });

        console.log('Raw company info from API:', response.data);

        // データがnullの場合も考慮し、安全なデフォルト値で正規化
        const data = response.data || {};
        const sanitizedData = {
          company_name: data.company_name || '',
          store_locate: data.store_locate || '',
          open_time: formatTimeToISO(data.open_time || ''),
          close_time: formatTimeToISO(data.close_time || ''),
          target_sales: data.target_sales || 0,
          labor_cost: data.labor_cost || 0,
          rest_days: data.rest_days || [],
          position_names: data.position_names || []
        };
        
        setStoreData(sanitizedData);
        setFormData(sanitizedData);
        
        // 時間形式が正しくない場合は自動的に修正して保存
        if ((data.open_time && !data.open_time.includes(':00:00') && data.open_time.match(/^\d{2}:\d{2}$/)) ||
            (data.close_time && !data.close_time.includes(':00:00') && data.close_time.match(/^\d{2}:\d{2}$/))) {
          console.log('Detected old time format, auto-updating...');
          setErrorMessage('営業時間の形式を自動的に更新しています...');
          
          // 自動的に正しい形式で保存
          const autoUpdateData = {
            company_info: {
              company_id: parseInt(companyId),
              company_name: sanitizedData.company_name,
              store_locate: sanitizedData.store_locate,
              open_time: sanitizedData.open_time, // 既にformatTimeToISOで変換済み
              close_time: sanitizedData.close_time, // 既にformatTimeToISOで変換済み
              target_sales: sanitizedData.target_sales,
              labor_cost: sanitizedData.labor_cost
            },
            rest_day: sanitizedData.rest_days,
            position: sanitizedData.position_names
          };
          
          try {
            await apiClient.post('/company-info-edit', autoUpdateData);
            setErrorMessage('営業時間の形式を自動的に更新しました。');
            // 更新後のデータを再取得
            setTimeout(() => fetchStoreData(), 1000);
          } catch (error) {
            console.error('Failed to auto-update time format:', error);
            setErrorMessage('営業時間の形式を更新できませんでした。「編集する」→「保存する」を手動で実行してください。');
          }
        }
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

  const handleRestDayToggle = (date: string) => {
    if (formData.rest_days.includes(date)) {
      setFormData({
        ...formData,
        rest_days: formData.rest_days.filter(d => d !== date)
      });
    } else {
      setFormData({
        ...formData,
        rest_days: [...formData.rest_days, date]
      });
    }
  };

  const handleAddPosition = () => {
    if (newPosition && !formData.position_names.includes(newPosition)) {
      setFormData({
        ...formData,
        position_names: [...formData.position_names, newPosition]
      });
      setNewPosition('');
    }
  };

  const handleRemovePosition = (position: string) => {
    setFormData({
      ...formData,
      position_names: formData.position_names.filter(p => p !== position)
    });
  };

  const handleCopyCompanyId = () => {
    const companyId = localStorage.getItem('company_id');
    if (companyId) {
      navigator.clipboard.writeText(companyId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSave = async () => {
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
      rest_day: formData.rest_days,
      position: formData.position_names
    };

    try {
      setIsSaving(true);
      console.log('Sending request data:', requestData);
      
      await apiClient.post('/company-info-edit', requestData);

      setIsEditing(false);
      alert('保存が完了しました');
    } catch (error: any) {
      logError(error, 'StoreInfo.handleSave');
      console.error('Request data:', requestData);
      console.error('Error response:', error.response?.data);
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
        {/* 会社ID表示 */}
        <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">会社ID</p>
                <p className="text-lg font-bold text-gray-900">{localStorage.getItem('company_id') || '未設定'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-600 max-w-xs">
                <p>このIDは従業員がアカウント作成時に必要です</p>
              </div>
              <button
                onClick={handleCopyCompanyId}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {copySuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    コピー済み
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    コピー
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

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
                      value={formatTimeForInput(formData.open_time)}
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
                      value={formatTimeForInput(formData.close_time)}
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

          {/* 休業日設定 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">休業日設定</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                店舗の休業日
              </div>
            </div>

            <Calendar
              selectedDates={formData.rest_days}
              onDateToggle={handleRestDayToggle}
              disabled={!isEditing}
            />
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
              {formData.position_names.length > 0 ? (
                formData.position_names.map((position, index) => (
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