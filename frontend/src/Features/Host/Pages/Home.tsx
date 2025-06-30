// src/Features/Host/Pages/Home.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDecisionShift } from '../../../Services/ShiftService';
import { logout } from '../../../Services/AuthService';
import { getErrorMessage, logError } from '../../../Utils/errorHandler';
import ErrorToast from '../../../Components/ErrorToast';

interface Shift {
  name: string;
  position: string;
  post: string;
  day: string;
  start_time: string;
  finish_time: string;
}

const HostHome: React.FC = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [restDays, setRestDays] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 週の開始日（月曜日）を取得
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // 週番号を取得
  const getWeekNumber = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const weekStart = getWeekStart(date);
    return Math.ceil((weekStart.getDate() + firstDayOfMonth.getDay() - 1) / 7);
  };

  // 週を変更
  const changeWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const companyIdString = localStorage.getItem('company_id');
        if (!companyIdString) {
          throw new Error('会社IDが見つかりません。再度ログインしてください。');
        }
        const companyId = parseInt(companyIdString, 10);
        const res = await fetchDecisionShift(companyId);
        setShifts(res.decision_shift || []);
        setRestDays(res.rest_day || []);
      } catch (error) {
        logError(error, 'HostHome.fetchData');
        const message = getErrorMessage(error);
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Shift Agent</h1>
            <span className="text-sm text-gray-500">オーナー管理画面</span>
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左側：シフト概要とクイックアクション */}
          <div className="lg:col-span-2 space-y-6">
            {/* 今週のシフト概要 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => changeWeek('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold text-gray-800">
                  {currentWeek.getFullYear()}年{currentWeek.getMonth() + 1}月第{getWeekNumber(currentWeek)}週
                </h2>
                <button
                  onClick={() => changeWeek('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* シフトサマリー */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">今週の稼働人数</p>
                  <p className="text-2xl font-bold text-[#2563EB]">
                    {(() => {
                      const weekStart = getWeekStart(currentWeek);
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekEnd.getDate() + 6);
                      
                      const weekShifts = shifts.filter(shift => {
                        const shiftDate = new Date(shift.day);
                        return shiftDate >= weekStart && shiftDate <= weekEnd;
                      });
                      
                      return new Set(weekShifts.map(s => s.name)).size;
                    })()}名
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">今週の総労働時間</p>
                  <p className="text-2xl font-bold text-[#2563EB]">
                    {(() => {
                      const weekStart = getWeekStart(currentWeek);
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekEnd.getDate() + 6);
                      
                      const weekShifts = shifts.filter(shift => {
                        const shiftDate = new Date(shift.day);
                        return shiftDate >= weekStart && shiftDate <= weekEnd;
                      });
                      
                      return weekShifts.reduce((total, shift) => {
                        const [startH, startM] = shift.start_time.split(':').map(Number);
                        const [endH, endM] = shift.finish_time.split(':').map(Number);
                        return total + (endH + endM/60) - (startH + startM/60);
                      }, 0).toFixed(1);
                    })()}時間
                  </p>
                </div>
              </div>

              {/* 休業日情報 */}
              {(() => {
                const weekStart = getWeekStart(currentWeek);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                // 今週の曜日を取得
                const weekDayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
                const currentWeekDays = [];
                for (let i = 0; i < 7; i++) {
                  const date = new Date(weekStart);
                  date.setDate(date.getDate() + i);
                  const dayName = weekDayNames[date.getDay()];
                  if (restDays.includes(dayName) && date >= new Date()) {
                    currentWeekDays.push(dayName);
                  }
                }
                
                return currentWeekDays.length > 0 ? (
                  <div className="mt-4 bg-red-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800">
                      今週の休業日: {currentWeekDays.join(', ')}
                    </p>
                  </div>
                ) : null;
              })()}
            </div>

            {/* 直近のシフト */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">直近のシフト</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {shifts.length > 0 ? (
                  shifts.slice(0, 10).map((shift, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">
                            {new Date(shift.day).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {['日', '月', '火', '水', '木', '金', '土'][new Date(shift.day).getDay()]}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{shift.name}</p>
                          <p className="text-sm text-gray-600">
                            {shift.position} • {shift.post === 'employee' ? '社員' : 'アルバイト'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {shift.start_time} - {shift.finish_time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">シフトデータがありません</p>
                )}
              </div>
            </div>
          </div>

          {/* 右側：クイックアクション */}
          <div className="space-y-6">
            {/* 管理メニュー */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">管理メニュー</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/host/store-info')}
                  className="w-full px-4 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    店舗情報管理
                  </span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => navigate('/host/crew-info')}
                  className="w-full px-4 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    従業員管理
                  </span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => navigate('/host/shift-adjustment')}
                  className="w-full px-4 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    シフト調整
                  </span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => navigate('/host/gemini-shift')}
                  className="w-full px-4 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    AI自動生成
                  </span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 統計情報 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">月間統計</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">総労働時間</span>
                  <span className="font-medium text-gray-900">--時間</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">予想人件費</span>
                  <span className="font-medium text-gray-900">¥--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">シフト充足率</span>
                  <span className="font-medium text-gray-900">--%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* エラートースト */}
      {errorMessage && (
        <ErrorToast
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </div>
  );
};

export default HostHome;