import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../Services/apiClient';
import { logout } from '../../../Services/AuthService';
import { getErrorMessage, logError } from '../../../Utils/errorHandler';
import ErrorToast from '../../../Components/ErrorToast';

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

const ShiftConfirm = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<EditShift[]>([]);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  // シフトデータを取得
  const fetchShifts = async () => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem('company_id') || '1';
      const response = await apiClient.get<AdjustmentShiftResponse>('/edit-shift', {
        params: { company_id: parseInt(companyId) }
      });
      
      setShifts(response.data.edit_shift || []);
      setMembers(response.data.company_member_name || []);
    } catch (error) {
      logError(error, 'ShiftConfirm.fetchShifts');
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // シフトを確定
  const handleConfirmShifts = async () => {
    const confirmMessage = 
      '現在の調整シフトを確定シフトとして登録します。\n' +
      '確定後は従業員に公開され、変更はできません。\n' +
      '本当によろしいですか？';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setConfirming(true);
      const companyId = localStorage.getItem('company_id') || '1';
      
      await apiClient.post('/complete_edit_sift', { // APIのタイポに注意
        company_id: parseInt(companyId)
      });
      
      alert('シフトを確定しました！従業員に公開されました。');
      navigate('/host/home');
    } catch (error) {
      logError(error, 'ShiftConfirm.handleConfirmShifts');
      setErrorMessage(getErrorMessage(error));
    } finally {
      setConfirming(false);
    }
  };

  // 統計情報を計算
  const calculateStats = () => {
    const totalShifts = shifts.length;
    const uniqueStaff = new Set(shifts.map(s => s.user_id)).size;
    const totalHours = shifts.reduce((total, shift) => {
      const [startH, startM] = shift.start_time.split(':').map(Number);
      const [endH, endM] = shift.finish_time.split(':').map(Number);
      return total + (endH + endM/60) - (startH + startM/60);
    }, 0);

    return { totalShifts, uniqueStaff, totalHours };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  const stats = calculateStats();

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
              onClick={() => navigate('/host/shift-adjustment')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">シフト確定</h1>
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
        {/* 確認メッセージ */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-amber-900">確定前の最終確認</h3>
              <p className="text-sm text-amber-700 mt-1">
                以下の内容でシフトを確定します。確定後は変更できませんので、よくご確認ください。
              </p>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総シフト数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShifts}件</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">稼働スタッフ数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueStaff}名</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総労働時間</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}時間</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* シフト詳細 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">シフト詳細</h3>
          
          {/* 日付ごとのシフト数 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">日付</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">シフト数</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">労働時間</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">スタッフ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(
                  shifts.reduce((acc, shift) => {
                    if (!acc[shift.day]) {
                      acc[shift.day] = {
                        shifts: [],
                        members: []
                      };
                    }
                    acc[shift.day].shifts.push(shift);
                    const member = members.find(m => m.user_id === shift.user_id);
                    if (member) acc[shift.day].members.push(member.name);
                    return acc;
                  }, {} as { [key: string]: { shifts: EditShift[], members: string[] } })
                )
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([day, data]) => {
                    const totalHours = data.shifts.reduce((total, shift) => {
                      const [startH, startM] = shift.start_time.split(':').map(Number);
                      const [endH, endM] = shift.finish_time.split(':').map(Number);
                      return total + (endH + endM/60) - (startH + startM/60);
                    }, 0);

                    return (
                      <tr key={day}>
                        <td className="px-4 py-3 text-sm">{day}</td>
                        <td className="px-4 py-3 text-sm text-center">{data.shifts.length}</td>
                        <td className="px-4 py-3 text-sm text-center">{totalHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 text-sm">{Array.from(new Set(data.members)).join(', ')}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/host/shift-adjustment')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            調整に戻る
          </button>
          <button
            onClick={handleConfirmShifts}
            disabled={confirming || shifts.length === 0}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {confirming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                確定中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                シフトを確定する
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftConfirm;