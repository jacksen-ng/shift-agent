import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../Services/apiClient';
import { logout } from '../../../Services/AuthService';
import { getErrorMessage, logError } from '../../../Utils/errorHandler';
import ErrorToast from '../../../Components/ErrorToast';
import { formatDateToISO, formatTimeToISO, formatTimeForInput } from '../../../Utils/FormatDate';

interface EditShift {
  edit_shift_id: number;
  user_id: number;
  day: string;
  start_time: string;
  finish_time: string;
}

interface CompanyMember {
  user_id: number;
  name: string;
}

interface AdjustmentShiftResponse {
  edit_shift: EditShift[];
  company_member_name: CompanyMember[];
}

interface DecisionShiftResponse {
  decision_shift: any[];
  rest_day: string[];
}

interface ShiftUpdate {
  edit_shift_id: number;
  day?: string;
  start_time: string;
  finish_time: string;
}

interface ShiftAdd {
  user_id: number;
  day: string;
  start_time: string;
  finish_time: string;
}

const ShiftAdjustment = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<EditShift[]>([]);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restDays, setRestDays] = useState<string[]>([]);
  
  // 追加・更新・削除の管理
  const [addShifts, setAddShifts] = useState<ShiftAdd[]>([]);
  const [updateShifts, setUpdateShifts] = useState<ShiftUpdate[]>([]);
  const [deleteShiftIds, setDeleteShiftIds] = useState<number[]>([]);

  // 週の開始日（月曜日）を安全に取得
  const getWeekStart = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // 時刻情報をリセット
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // dayが0(日曜)の場合は-6、それ以外は+1
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
  
  // 休業日かどうかをチェック
  const isRestDay = (date: Date) => {
    const dateStr = formatDate(date);
    return restDays.includes(dateStr);
  };

  // シフトデータを取得
  const fetchShifts = async () => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem('company_id') || '1';
      
      // 編集用シフトデータを取得
      const response = await apiClient.get<AdjustmentShiftResponse>('/edit-shift', {
        params: { company_id: parseInt(companyId) }
      });
      
      const fetchedShifts = response.data.edit_shift || [];
      setShifts(fetchedShifts);
      setMembers(response.data.company_member_name || []);
      
      // 決定済みシフトから休業日情報を取得
      try {
        const decisionResponse = await apiClient.get<DecisionShiftResponse>('/decision-shift', {
          params: { company_id: parseInt(companyId) }
        });
        console.log('Decision shift response:', decisionResponse.data);
        console.log('Rest days:', decisionResponse.data.rest_day);
        
        // rest_dayの処理 - オブジェクトの場合は適切に変換
        const restDayData = decisionResponse.data.rest_day || [];
        const processedRestDays = restDayData.map((day: any) => {
          if (typeof day === 'string') {
            return day;
          } else if (typeof day === 'object' && day !== null) {
            // オブジェクトの場合、dateやdayプロパティを探す
            return day.date || day.day || day.rest_day || JSON.stringify(day);
          }
          return String(day);
        });
        
        setRestDays(processedRestDays);
      } catch (error) {
        // 決定済みシフトがない場合はエラーを無視
        console.log('No decision shift found, continuing without rest days');
      }

      // 直近のシフトがある週をデフォルト表示
      if (fetchedShifts.length > 0) {
        const latestShift = fetchedShifts.reduce((latest, current) => {
          return new Date(latest.day) > new Date(current.day) ? latest : current;
        });
        setCurrentWeek(new Date(latestShift.day));
      } else {
        setCurrentWeek(new Date()); // シフトがない場合は今日の週
      }

    } catch (error) {
      logError(error, 'ShiftAdjustment.fetchShifts');
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // シフトを取得（ユーザーと日付から）
  const getShift = (userId: number, dateStr: string) => {
    return shifts.find(s => s.user_id === userId && s.day === dateStr);
  };

  // シフトを追加
  const handleAddShift = (userId: number, date: Date) => {
    const dateStr = formatDate(date);
    
    // 既存のシフトがある場合は何もしない
    if (getShift(userId, dateStr)) return;
    
    const newShift: ShiftAdd = {
      user_id: userId,
      day: dateStr,
      start_time: '09:00',
      finish_time: '18:00'
    };
    
    setAddShifts([...addShifts, newShift]);
    
    // UIに即座に反映
    const tempId = -Date.now(); // 一時的なID
    setShifts([...shifts, {
      edit_shift_id: tempId,
      ...newShift
    }]);
  };

  // シフトを更新
  const handleUpdateShift = (shiftId: number, field: 'start_time' | 'finish_time', value: string) => {
    const originalShift = shifts.find(s => s.edit_shift_id === shiftId);
    if (!originalShift) return;

    // 更新リストに追加
    const existingUpdate = updateShifts.find(u => u.edit_shift_id === shiftId);
    if (existingUpdate) {
      setUpdateShifts(updateShifts.map(u => 
        u.edit_shift_id === shiftId ? { ...u, [field]: value } : u
      ));
    } else {
      setUpdateShifts([...updateShifts, {
        edit_shift_id: shiftId,
        day: originalShift.day, // 常にdayを含める
        start_time: originalShift.start_time,
        finish_time: originalShift.finish_time,
        [field]: value
      }]);
    }
    
    // UIに即座に反映
    setShifts(shifts.map(s => 
      s.edit_shift_id === shiftId ? { ...s, [field]: value } : s
    ));
  };

  // シフトを削除
  const handleDeleteShift = (shiftId: number) => {
    // 削除リストに追加（新規追加分でない場合）
    if (shiftId > 0) {
      setDeleteShiftIds([...deleteShiftIds, shiftId]);
    }
    
    // UIから削除
    setShifts(shifts.filter(s => s.edit_shift_id !== shiftId));
    
    // 追加リストからも削除
    const shift = shifts.find(s => s.edit_shift_id === shiftId);
    if (shift) {
      setAddShifts(addShifts.filter(a => 
        !(a.user_id === shift.user_id && a.day === shift.day)
      ));
    }
  };

  // 変更を保存
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const companyId = localStorage.getItem('company_id') || '1';
      
      const requestData = {
        company_id: parseInt(companyId),
        add_edit_shift: addShifts.map(shift => ({
          ...shift,
          start_time: formatTimeToISO(shift.start_time),
          finish_time: formatTimeToISO(shift.finish_time)
        })),
        update_edit_shift: updateShifts.map(shift => ({
          ...shift,
          start_time: formatTimeToISO(shift.start_time),
          finish_time: formatTimeToISO(shift.finish_time)
        })),
        delete_edit_shift: deleteShiftIds.map(id => ({ edit_shift_id: id }))
      };
      
      await apiClient.post('/edit-shift', requestData);
      
      // リセット
      setAddShifts([]);
      setUpdateShifts([]);
      setDeleteShiftIds([]);
      
      alert('シフトの変更を保存しました');
      await fetchShifts(); // 最新データを再取得
    } catch (error) {
      logError(error, 'ShiftAdjustment.handleSaveChanges');
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  // 確定処理へ進む
  const handleProceedToConfirm = () => {
    if (addShifts.length > 0 || updateShifts.length > 0 || deleteShiftIds.length > 0) {
      alert('未保存の変更があります。保存してから確定に進んでください。');
      return;
    }
    navigate('/host/shift-confirm');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  const weekDates = generateWeekDates();
  const weekDays = ['月', '火', '水', '木', '金', '土', '日'];

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
            <h1 className="text-2xl font-bold text-gray-900">シフト調整</h1>
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
        {/* 週ナビゲーション */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
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
        </div>

        {/* シフト表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 border-r border-gray-200 sticky left-0 bg-gray-50">
                    スタッフ
                  </th>
                  {weekDates.map((date, index) => (
                    <th key={index} className={`px-4 py-3 text-center font-medium ${isRestDay(date) ? 'bg-red-50 text-red-700' : 'text-gray-700'}`}>
                      <div>{weekDays[index]}</div>
                      <div className="text-xs font-normal text-gray-500 mt-1">
                        {date.getMonth() + 1}/{date.getDate()}
                      </div>
                      {isRestDay(date) && (
                        <div className="text-xs font-normal text-red-600 mt-1">休業日</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.user_id}>
                    <td className="border-t border-r border-gray-200 p-3 text-left font-medium text-gray-900 bg-gray-50 sticky left-0">
                      {member.name}
                    </td>
                    {weekDates.map((date, index) => {
                      const dateStr = formatDate(date);
                      const shift = getShift(member.user_id, dateStr);
                      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                      
                      const isRest = isRestDay(date);
                      
                      return (
                        <td key={index} className={`border-t border-gray-200 p-2 text-center ${isPast ? 'bg-gray-50' : ''} ${isRest ? 'bg-red-50' : ''}`}>
                          {isRest ? (
                            <div className="text-red-600 font-medium py-8">休業日</div>
                          ) : shift ? (
                            <div className="space-y-2">
                              <input
                                type="time"
                                value={formatTimeForInput(shift.start_time)}
                                onChange={(e) => handleUpdateShift(shift.edit_shift_id, 'start_time', e.target.value)}
                                className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${isPast ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                disabled={isPast}
                              />
                              <div className="text-xs text-gray-500">〜</div>
                              <input
                                type="time"
                                value={formatTimeForInput(shift.finish_time)}
                                onChange={(e) => handleUpdateShift(shift.edit_shift_id, 'finish_time', e.target.value)}
                                className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${isPast ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                disabled={isPast}
                              />
                              <button
                                onClick={() => handleDeleteShift(shift.edit_shift_id)}
                                className={`w-full px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors ${isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isPast}
                              >
                                削除
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddShift(member.user_id, date)}
                              className={`w-full h-24 border-2 border-dashed border-gray-300 rounded-lg transition-colors flex items-center justify-center ${
                                isPast 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : 'hover:border-purple-400 hover:bg-purple-50'
                              }`}
                              disabled={isPast}
                            >
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
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

        {/* 休業日情報 */}
        {restDays.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-800">
                休業日: {restDays.join(', ')}
              </span>
            </div>
          </div>
        )}
        
        {/* アクションボタン */}
        <div className="flex justify-between">
          <div>
            {(addShifts.length > 0 || updateShifts.length > 0 || deleteShiftIds.length > 0) && (
              <p className="text-sm text-orange-600">
                ※ 未保存の変更があります（追加: {addShifts.length}件、更新: {updateShifts.length}件、削除: {deleteShiftIds.length}件）
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/host/gemini-shift')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              AI生成
            </button>
            
            <button
              onClick={handleSaveChanges}
              disabled={saving || (addShifts.length === 0 && updateShifts.length === 0 && deleteShiftIds.length === 0)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  保存中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  変更を保存
                </>
              )}
            </button>
            
            <button
              onClick={handleProceedToConfirm}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              確定へ進む
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftAdjustment;