// ✍️ ホストが自分のシフトを提出するページです
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../Services/apiClient';
import { logout } from '../../../Services/AuthService';
import { getErrorMessage, logError } from '../../../Utils/errorHandler';
import ErrorToast from '../../../Components/ErrorToast';
import { formatDateToISO, formatTimeToISO, formatTimeForInput } from '../../../Utils/FormatDate';

interface ShiftSubmission {
  day: string;
  start_time: string;
  finish_time: string;
}

interface TimePreset {
  label: string;
  start: string;
  end: string;
}

const ShiftSubmit = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [submissions, setSubmissions] = useState<ShiftSubmission[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 時間プリセット
  const timePresets: TimePreset[] = [
    { label: '早番', start: '06:00', end: '15:00' },
    { label: '通常', start: '09:00', end: '18:00' },
    { label: '遅番', start: '13:00', end: '22:00' },
    { label: '夜勤', start: '22:00', end: '06:00' },
  ];

  // 週の開始日（月曜日）を取得
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // 週の日付を生成
  const generateWeekDates = () => {
    const weekStart = getWeekStart(currentWeek);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 日付をフォーマット
  const formatDate = (date: Date) => {
    return formatDateToISO(date);
  };

  // シフトを追加
  const addShift = (date: Date, preset?: TimePreset) => {
    const dateStr = formatDate(date);
    const existingIndex = submissions.findIndex(s => s.day === dateStr);
    
    if (existingIndex >= 0) {
      // 既存のシフトを更新
      if (preset) {
        const updated = [...submissions];
        updated[existingIndex] = {
          day: dateStr,
          start_time: preset.start,
          finish_time: preset.end
        };
        setSubmissions(updated);
      }
    } else {
      // 新しいシフトを追加
      setSubmissions([...submissions, {
        day: dateStr,
        start_time: preset?.start || '09:00',
        finish_time: preset?.end || '18:00'
      }]);
    }
  };

  // シフトを削除
  const removeShift = (dateStr: string) => {
    setSubmissions(submissions.filter(s => s.day !== dateStr));
  };

  // 時間を更新
  const updateTime = (dateStr: string, field: 'start_time' | 'finish_time', value: string) => {
    setSubmissions(submissions.map(s => 
      s.day === dateStr ? { ...s, [field]: value } : s
    ));
  };

  // シフトを提出
  const handleSubmit = async () => {
    if (submissions.length === 0) {
      alert('提出するシフトがありません');
      return;
    }

    try {
      setIsSubmitting(true);
      const userId = localStorage.getItem('user_id') || '1';
      const companyId = localStorage.getItem('company_id') || '1';

      // API設計に準拠したバッチ提出
      const submitData = {
        company_member_info: {
          user_id: parseInt(userId),
          company_id: parseInt(companyId)
        },
        submit_shift: submissions.map(shift => ({
          ...shift,
          start_time: formatTimeToISO(shift.start_time),
          finish_time: formatTimeToISO(shift.finish_time)
        }))
      };

      await apiClient.post('/submitted-shift', submitData);

      alert('シフト希望を提出しました！');
      setSubmissions([]);
    } catch (error) {
      logError(error, 'HostShiftSubmit.handleSubmit');
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl font-bold text-gray-900">シフト希望提出</h1>
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
          {/* カレンダービュー */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* 週ナビゲーション */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    const newWeek = new Date(currentWeek);
                    newWeek.setDate(newWeek.getDate() - 7);
                    setCurrentWeek(newWeek);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold text-gray-800">
                  {currentWeek.getFullYear()}年{currentWeek.getMonth() + 1}月
                </h2>
                <button
                  onClick={() => {
                    const newWeek = new Date(currentWeek);
                    newWeek.setDate(newWeek.getDate() + 7);
                    setCurrentWeek(newWeek);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* カレンダー */}
              <div className="grid grid-cols-7 gap-2">
                {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                {generateWeekDates().map((date) => {
                  const dateStr = formatDate(date);
                  const hasShift = submissions.some(s => s.day === dateStr);
                  const shift = submissions.find(s => s.day === dateStr);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                  return (
                    <div
                      key={dateStr}
                      className={`relative border rounded-lg p-3 min-h-[100px] transition-all ${
                        hasShift ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'
                      } ${isPast ? 'opacity-50' : 'hover:border-purple-400 cursor-pointer'} ${
                        isToday ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => !isPast && setSelectedDate(date)}
                    >
                      <div className="text-sm font-medium text-gray-900">{date.getDate()}</div>
                      {hasShift && shift && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-purple-700">
                            {shift.start_time} - {shift.finish_time}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeShift(dateStr);
                            }}
                            className="absolute top-1 right-1 p-1 text-red-500 hover:bg-red-100 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* サイドパネル */}
          <div className="space-y-6">
            {/* 選択した日付の詳細 */}
            {selectedDate && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日（{['日', '月', '火', '水', '木', '金', '土'][selectedDate.getDay()]}）
                </h3>

                {/* 時間プリセット */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-gray-700">時間プリセット</p>
                  <div className="grid grid-cols-2 gap-2">
                    {timePresets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => addShift(selectedDate, preset)}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* カスタム時間 */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">カスタム時間</p>
                  <button
                    onClick={() => addShift(selectedDate)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    シフトを追加
                  </button>
                </div>
              </div>
            )}

            {/* 提出リスト */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">提出予定のシフト</h3>
              {submissions.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {submissions.sort((a, b) => a.day.localeCompare(b.day)).map((shift) => {
                    const date = new Date(shift.day);
                    return (
                      <div key={shift.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {date.getMonth() + 1}月{date.getDate()}日（{['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}）
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="time"
                              value={formatTimeForInput(shift.start_time)}
                              onChange={(e) => updateTime(shift.day, 'start_time', e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded"
                            />
                            <span className="text-xs text-gray-500">〜</span>
                            <input
                              type="time"
                              value={formatTimeForInput(shift.finish_time)}
                              onChange={(e) => updateTime(shift.day, 'finish_time', e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeShift(shift.day)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">まだシフトがありません</p>
              )}

              {/* 提出ボタン */}
              <button
                onClick={handleSubmit}
                disabled={submissions.length === 0 || isSubmitting}
                className="mt-4 w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    提出中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    シフトを提出する
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftSubmit;