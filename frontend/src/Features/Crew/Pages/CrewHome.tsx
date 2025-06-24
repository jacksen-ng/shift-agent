import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDecisionShift } from '../../../Services/ShiftService';
import { logout } from '../../../Services/AuthService';
import { fetchMyUserInfoWithCache } from '../../../Services/UserService';
import { getAuthInfo } from '../../../Utils/authUtils';

interface Shift {
  name: string;
  position: string;
  post: string;
  day: string;
  start_time: string;
  finish_time: string;
}

interface WeekShift {
  date: Date;
  shift?: Shift;
}

const CrewHome: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [staffWeekShifts, setStaffWeekShifts] = useState<{ [key: string]: WeekShift[] }>({});
  const [userName, setUserName] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 曜日の配列
  const weekDays = ['月', '火', '水', '木', '金', '土', '日'];

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

  // 時間計算
  const calculateHours = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTotal = startHour + startMinute / 60;
    const endTotal = endHour + endMinute / 60;
    return endTotal - startTotal;
  };

  // 週のシフトデータを生成（スタッフ別）
  const generateWeekShifts = (shifts: Shift[], weekStart: Date) => {
    // スタッフ名のリストを取得
    const staffNames = Array.from(new Set(shifts.map(s => s.name))).sort();
    
    // 各スタッフの週間シフトデータを生成
    const staffWeekData: { [key: string]: WeekShift[] } = {};
    
    staffNames.forEach(staffName => {
      const weekData: WeekShift[] = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayShift = shifts.find(shift => shift.day === dateStr && shift.name === staffName);
        weekData.push({ date, shift: dayShift });
      }
      
      staffWeekData[staffName] = weekData;
    });
    
    return staffWeekData;
  };



  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 認証情報を確認
        const authInfo = getAuthInfo();
        if (!authInfo) {
          navigate('/login');
          return;
        }
        
        // ユーザー情報を取得
        const userInfo = await fetchMyUserInfoWithCache();
        if (userInfo) {
          setUserName(userInfo.name);
        }
        
        const res = await fetchDecisionShift(authInfo.companyId);
        const userShifts = res.decision_shift || [];

        // 現在の週のシフトを生成
        const weekStart = getWeekStart(currentWeek);
        const staffWeekData = generateWeekShifts(userShifts, weekStart);
        setStaffWeekShifts(staffWeekData);

      } catch (error) {
        console.error('シフト情報の取得に失敗しました', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentWeek]);

  // 週を変更
  const changeWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Shift Agent</h1>
            <div className="flex items-center space-x-4">
            <button
              onClick={() => changeWeek('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-medium text-gray-800 min-w-[160px] text-center">
              {currentWeek.getFullYear()}年{currentWeek.getMonth() + 1}月第{getWeekNumber(currentWeek)}週
            </span>
            <button
              onClick={() => changeWeek('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            </div>
            {/* モバイルメニューボタン */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* サイドパネル */}
        <aside className={`${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 absolute lg:relative w-64 bg-white border-r border-gray-200 p-6 h-full transition-transform duration-300 z-20`}>
          <div className="space-y-6">
            {/* ユーザー情報 */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">ようこそ</p>
              <p className="text-lg font-bold text-gray-900">{userName}さん</p>
            </div>

            {/* 今週のシフト状況 */}
            <div className="bg-teal-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">今週のシフト</p>
              <p className="text-2xl font-bold text-teal-600">
                {Object.keys(staffWeekShifts).length}名
              </p>
              <p className="text-xs text-gray-500 mt-1">
                スタッフが勤務予定
              </p>
            </div>


            {/* クイックアクション */}
            <div className="space-y-2">
              <button
                onClick={() => navigate('/crew/shift-submit')}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                シフト希望提出
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </aside>

        {/* オーバーレイ（モバイル） */}
        {showMobileMenu && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 p-4 lg:p-6">
          {/* シフト表 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 border-r border-gray-200 sticky left-0 bg-gray-50">
                      スタッフ
                    </th>
                    {weekDays.map((day, index) => {
                      const weekStart = getWeekStart(currentWeek);
                      const date = new Date(weekStart);
                      date.setDate(date.getDate() + index);
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      return (
                        <th
                          key={day}
                          className={`px-4 py-3 text-center font-medium ${
                            isToday ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                          }`}
                        >
                          <div>{day}</div>
                          <div className="text-xs font-normal text-gray-500 mt-1">
                            {date.getMonth() + 1}/{date.getDate()}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(staffWeekShifts).map(([staffName, weekData]) => (
                    <tr key={staffName}>
                      <td className="border-t border-r border-gray-200 p-3 text-left font-medium text-gray-900 bg-gray-50 sticky left-0">
                        {staffName}
                      </td>
                      {weekData.map((dayData, index) => {
                        const isToday = dayData.date.toDateString() === new Date().toDateString();
                        
                        return (
                          <td
                            key={index}
                            className={`border-t border-gray-200 p-2 text-center align-top ${
                              isToday ? 'bg-teal-50/30' : ''
                            }`}
                          >
                            {dayData.shift ? (
                              <div className="space-y-1">
                                <div className="text-sm font-semibold text-gray-900">
                                  {dayData.shift.start_time}
                                </div>
                                <div className="text-xs text-gray-500">〜</div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {dayData.shift.finish_time}
                                </div>
                                <div className="text-xs text-teal-600 font-medium">
                                  {calculateHours(dayData.shift.start_time, dayData.shift.finish_time)}h
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/crew/shift-check')}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              確定シフト
            </button>
            <button
              onClick={() => navigate('/crew/shift-submit')}
              className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              シフト希望提出
            </button>
          </div>

          {/* お知らせ */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-800">お知らせ</p>
                <p className="text-sm text-gray-600 mt-1">
                  来月のシフト希望は25日までに提出してください。
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CrewHome;