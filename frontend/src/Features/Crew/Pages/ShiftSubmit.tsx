import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../Services/apiClient';
import { getErrorMessage, logError } from '../../../Utils/errorHandler';
import ErrorToast from '../../../Components/ErrorToast';
import { formatDateToISO, formatTimeToISO } from '../../../Utils/FormatDate';

interface ShiftSubmission {
  day: string;
  start_time: string;
  finish_time: string;
  isUnavailable?: boolean;
}

const ShiftSubmit: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [submissions, setSubmissions] = useState<{ [key: string]: ShiftSubmission }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 時間プリセット
  const timePresets = [
    { id: 'morning', label: '朝シフト', start: '09:00', end: '15:00', icon: '🌅' },
    { id: 'afternoon', label: '昼シフト', start: '12:00', end: '18:00', icon: '☀️' },
    { id: 'evening', label: '夜シフト', start: '17:00', end: '22:00', icon: '🌙' },
    { id: 'full', label: 'フルタイム', start: '10:00', end: '19:00', icon: '💪' },
  ];

  // ユーザー情報を取得
  const userId = localStorage.getItem('user_id') || '1';
  const companyId = localStorage.getItem('company_id') || '1';

  // カレンダーの日付を生成
  const generateCalendarDates = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  // 日付をキーに変換
  const dateToKey = (date: Date) => {
    return formatDateToISO(date);
  };

  // 提出済み日数を計算
  const getSubmittedCount = () => {
    return Object.keys(submissions).length;
  };

  // 進捗率を計算
  const getProgressPercentage = () => {
    const totalDays = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
    return Math.round((getSubmittedCount() / totalDays) * 100);
  };

  // 時間選択
  const handleTimeSelect = (preset: typeof timePresets[0]) => {
    if (!selectedDate) return;
    
    const key = dateToKey(selectedDate);
    setSubmissions({
      ...submissions,
      [key]: {
        day: key,
        start_time: `${preset.start}:00`,
        finish_time: `${preset.end}:00`,
      }
    });
    setSelectedPreset(preset.id);
  };

  // 日付選択
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const key = dateToKey(date);
    const submission = submissions[key];
    if (submission && !submission.isUnavailable) {
      const preset = timePresets.find(p => 
        p.start === submission.start_time && p.end === submission.finish_time
      );
      setSelectedPreset(preset?.id || 'custom');
    } else {
      setSelectedPreset('');
    }
  };

  // 不可に設定
  const handleSetUnavailable = () => {
    if (!selectedDate) return;
    
    const key = dateToKey(selectedDate);
    setSubmissions({
      ...submissions,
      [key]: {
        day: key,
        start_time: '',
        finish_time: '',
        isUnavailable: true,
      }
    });
  };

  // カスタム時間の変更
  const handleCustomTimeChange = (field: 'start_time' | 'finish_time', value: string) => {
    if (!selectedDate) return;
    
    const key = dateToKey(selectedDate);
    setSubmissions({
      ...submissions,
      [key]: {
        ...submissions[key],
        day: key,
        [field]: value,
        isUnavailable: false,
      }
    });
    setSelectedPreset('custom');
  };

  // 選択をクリア
  const handleClearSelection = () => {
    if (!selectedDate) return;
    
    const key = dateToKey(selectedDate);
    const newSubmissions = { ...submissions };
    delete newSubmissions[key];
    setSubmissions(newSubmissions);
    setSelectedPreset('');
  };

  // 一括提出
  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    
    try {
      // 実際の提出処理
      const validSubmissions = Object.values(submissions).filter(s => !s.isUnavailable && s.start_time && s.finish_time);
      
      // 新しいAPI仕様に合わせて形式を変更
      const submitData = {
        company_member_info: {
          user_id: parseInt(userId),
          company_id: parseInt(companyId)
        },
        submit_shift: validSubmissions.map(submission => ({
          day: submission.day,
          start_time: formatTimeToISO(submission.start_time),
          finish_time: formatTimeToISO(submission.finish_time)
        }))
      };
      
      await apiClient.post('/submitted-shift', submitData);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/crew/home');
      }, 2000);
    } catch (error) {
      logError(error, 'ShiftSubmit.handleSubmitAll');
      const message = getErrorMessage(error);
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calendarDates = generateCalendarDates();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/crew/home')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">シフト希望提出</h1>
          </div>
          
          {/* 進捗表示 */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {getSubmittedCount()}日入力済み
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* 月選択 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const newMonth = new Date(selectedMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setSelectedMonth(newMonth);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-lg font-bold text-gray-800">
              {selectedMonth.getFullYear()}年{selectedMonth.getMonth() + 1}月
            </h2>
            
            <button
              onClick={() => {
                const newMonth = new Date(selectedMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setSelectedMonth(newMonth);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* カレンダー */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDates.map((date, index) => {
                const isCurrentMonth = date.getMonth() === selectedMonth.getMonth();
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const key = dateToKey(date);
                const submission = submissions[key];
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={index}
                    onClick={() => isCurrentMonth && handleDateSelect(date)}
                    disabled={!isCurrentMonth}
                    className={`
                      aspect-square p-2 rounded-lg text-sm font-medium transition-all
                      ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                      ${isSelected ? 'bg-teal-500 text-white hover:bg-teal-600' : ''}
                      ${isToday && !isSelected ? 'bg-teal-50 text-teal-700' : ''}
                      ${submission && !isSelected ? (submission.isUnavailable ? 'bg-red-50' : 'bg-teal-100') : ''}
                    `}
                  >
                    <div className="relative">
                      {date.getDate()}
                      {submission && (
                        <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                          submission.isUnavailable ? 'bg-red-400' : 'bg-teal-500'
                        }`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* 凡例 */}
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-teal-100 rounded"></div>
                <span>希望済み</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-50 rounded"></div>
                <span>出勤不可</span>
              </div>
            </div>
          </div>

          {/* 時間選択パネル */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {selectedDate ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日({weekDays[selectedDate.getDay()]})
                  </h3>
                  {submissions[dateToKey(selectedDate)] && (
                    <button
                      onClick={handleClearSelection}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      クリア
                    </button>
                  )}
                </div>

                {/* プリセット選択 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">よく使う時間帯</p>
                  <div className="grid grid-cols-2 gap-2">
                    {timePresets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => handleTimeSelect(preset)}
                        className={`
                          p-3 rounded-lg border-2 transition-all text-left
                          ${selectedPreset === preset.id 
                            ? 'border-teal-500 bg-teal-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{preset.icon}</span>
                          <span className="font-medium text-sm">{preset.label}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {preset.start} - {preset.end}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* カスタム時間 */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">カスタム時間</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">開始時間</label>
                      <input
                        type="time"
                        value={submissions[dateToKey(selectedDate)]?.start_time || ''}
                        onChange={(e) => handleCustomTimeChange('start_time', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">終了時間</label>
                      <input
                        type="time"
                        value={submissions[dateToKey(selectedDate)]?.finish_time || ''}
                        onChange={(e) => handleCustomTimeChange('finish_time', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* 出勤不可ボタン */}
                <button
                  onClick={handleSetUnavailable}
                  className={`
                    w-full py-3 rounded-lg font-medium transition-all
                    ${submissions[dateToKey(selectedDate)]?.isUnavailable
                      ? 'bg-red-500 text-white'
                      : 'bg-white border-2 border-red-300 text-red-600 hover:bg-red-50'
                    }
                  `}
                >
                  この日は出勤できません
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>日付を選択してください</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 提出ボタン */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleSubmitAll}
              disabled={getSubmittedCount() === 0 || isSubmitting}
              className={`
                w-full py-4 rounded-xl font-medium text-lg transition-all transform
                ${getSubmittedCount() > 0
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  提出中...
                </span>
              ) : (
                `${getSubmittedCount()}日分のシフト希望を提出する`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 成功モーダル */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-[slideUp_0.3s_ease-out]">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">提出完了！</h3>
            <p className="text-gray-600">シフト希望を受け付けました</p>
          </div>
        </div>
      )}
      
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

export default ShiftSubmit;