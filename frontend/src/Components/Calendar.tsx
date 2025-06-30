import React, { useState } from 'react';

interface CalendarProps {
  selectedDates: string[];
  onDateToggle: (date: string) => void;
  disabled?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDates, onDateToggle, disabled = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  // 月の最初の日と最後の日を取得
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    return { firstDayOfWeek, daysInMonth };
  };

  // 日付文字列をフォーマット (YYYY-MM-DD)
  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const { firstDayOfWeek, daysInMonth } = getMonthDays(currentMonth);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // カレンダーの日付配列を作成
  const calendarDays = [];
  
  // 前月の日付で埋める
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 当月の日付
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="bg-white rounded-lg">
      {/* 月選択ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth('prev')}
          disabled={disabled}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-bold text-gray-800">
          {year}年 {monthNames[month]}
        </h3>
        <button
          onClick={() => changeMonth('next')}
          disabled={disabled}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = formatDate(year, month, day);
          const isSelected = selectedDates.includes(dateStr);
          const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <button
              key={day}
              onClick={() => !disabled && onDateToggle(dateStr)}
              disabled={disabled}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                transition-all relative
                ${isSelected 
                  ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }
                ${isWeekend && !isSelected ? (dayOfWeek === 0 ? 'text-red-600' : 'text-blue-600') : ''}
                ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* 選択された休業日の一覧 */}
      {selectedDates.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm font-medium text-red-700 mb-2">選択された休業日:</p>
          <div className="flex flex-wrap gap-2">
            {selectedDates
              .filter(date => {
                const [y, m] = date.split('-').map(Number);
                return y === year && m - 1 === month;
              })
              .sort()
              .map(date => {
                const day = parseInt(date.split('-')[2]);
                return (
                  <span key={date} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    {day}日
                  </span>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;