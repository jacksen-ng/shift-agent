import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDecisionShift } from '../../../Services/ShiftService';
import { logout } from '../../../Services/AuthService';
import { formatDateToISO, formatTimeDisplay } from '../../../Utils/FormatDate';

interface Shift {
  name: string;
  position: string;
  post: string;
  day: string;
  start_time: string;
  finish_time: string;
}

const ShiftCheck: React.FC = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [restDays, setRestDays] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // 曜日の配列
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

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
        
        // 全てのシフトを表示（人別の情報も見たいため）
        setShifts(res.decision_shift || []);
        setRestDays(res.rest_day || []);
      } catch (error) {
        console.error('シフト情報の取得に失敗しました', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  // 特定の日のシフトを取得
  const getShiftForDate = (dateStr: string) => {
    return shifts.filter(shift => shift.day === dateStr);
  };

  // 休業日かどうかを判定
  const isRestDay = (dateStr: string) => {
    return restDays.includes(dateStr);
  };

  // 時間計算
  const calculateHours = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTotal = startHour + startMinute / 60;
    const endTotal = endHour + endMinute / 60;
    return endTotal - startTotal;
  };

  // 月の合計勤務時間を計算
  const calculateMonthlyHours = () => {
    const monthShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.day);
      return shiftDate.getMonth() === selectedMonth.getMonth() &&
             shiftDate.getFullYear() === selectedMonth.getFullYear();
    });
    
    return monthShifts.reduce((total, shift) => {
      return total + calculateHours(shift.start_time, shift.finish_time);
    }, 0);
  };

  // 月の勤務日数を計算
  const calculateMonthlyDays = () => {
    const monthShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.day);
      return shiftDate.getMonth() === selectedMonth.getMonth() &&
             shiftDate.getFullYear() === selectedMonth.getFullYear();
    });
    
    return monthShifts.length;
  };

  const calendarDates = generateCalendarDates();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/crew/home')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">確定シフト確認</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 表示切り替え */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-white text-teal-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  カレンダー
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-teal-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  リスト
                </button>
              </div>
              
              {/* ログアウトボタン */}
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="ログアウト"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* 月選択と統計情報 */}
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
            
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-800">
                {selectedMonth.getFullYear()}年{selectedMonth.getMonth() + 1}月
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>勤務日数: <span className="font-bold text-teal-600">{calculateMonthlyDays()}日</span></span>
                <span>合計時間: <span className="font-bold text-teal-600">{calculateMonthlyHours()}時間</span></span>
              </div>
            </div>
            
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

        {viewMode === 'calendar' ? (
          /* カレンダービュー */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDates.map((date, index) => {
                const isCurrentMonth = date.getMonth() === selectedMonth.getMonth();
                const dateStr = dateToKey(date);
                const dayShifts = getShiftForDate(dateStr);
                const isRest = isRestDay(dateStr);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] p-2 border rounded-lg
                      ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                      ${isToday ? 'border-teal-500 border-2' : 'border-gray-200'}
                      ${isRest ? 'bg-red-50' : ''}
                    `}
                  >
                    <div className="text-sm font-medium mb-1">
                      {date.getDate()}
                    </div>
                    {isCurrentMonth && (
                      <>
                        {isRest ? (
                          <div className="text-xs text-red-600 font-medium">
                            休業日
                          </div>
                        ) : dayShifts && dayShifts.length > 0 ? (
                          <div className="space-y-1 max-h-[80px] overflow-y-auto">
                            {dayShifts.slice(0, 2).map((shift, idx) => (
                              <div key={idx} className="border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                                <div className="text-xs font-semibold text-gray-900">
                                  {formatTimeDisplay(shift.start_time)}-{formatTimeDisplay(shift.finish_time)}
                                </div>
                                <div className="text-xs text-gray-700 font-medium">
                                  {shift.name}
                                </div>
                              </div>
                            ))}
                            {dayShifts.length > 2 && (
                              <div className="text-xs text-gray-500">
                                他{dayShifts.length - 2}名
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">-</div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* 凡例 */}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-teal-500 rounded"></div>
                <span>今日</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border border-gray-200 rounded"></div>
                <span>休業日</span>
              </div>
            </div>
          </div>
        ) : (
          /* リストビュー */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {shifts
                .filter(shift => {
                  const shiftDate = new Date(shift.day);
                  return shiftDate.getMonth() === selectedMonth.getMonth() &&
                         shiftDate.getFullYear() === selectedMonth.getFullYear();
                })
                .sort((a, b) => a.day.localeCompare(b.day))
                .map((shift, index) => {
                  const date = new Date(shift.day);
                  const weekDay = weekDays[date.getDay()];
                  const isToday = shift.day === dateToKey(new Date());
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        isToday ? 'bg-teal-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {date.getDate()}
                            </div>
                            <div className="text-sm text-gray-600">{weekDay}</div>
                          </div>
                          <div>
                            <div className="text-lg font-medium text-gray-900">
                              {formatTimeDisplay(shift.start_time)} - {formatTimeDisplay(shift.finish_time)}
                            </div>
                            <div className="text-sm font-medium text-gray-700 mt-1">
                              {shift.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {shift.position} / {shift.post === 'part_timer' ? 'アルバイト' : '社員'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-teal-600">
                            {calculateHours(shift.start_time, shift.finish_time)}時間
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {shifts.filter(shift => {
                const shiftDate = new Date(shift.day);
                return shiftDate.getMonth() === selectedMonth.getMonth() &&
                       shiftDate.getFullYear() === selectedMonth.getFullYear();
              }).length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  この月のシフトはありません
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftCheck;