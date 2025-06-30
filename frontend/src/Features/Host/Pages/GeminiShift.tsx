import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../Services/apiClient';
import { logout } from '../../../Services/AuthService';
import { getErrorMessage, logError } from '../../../Utils/errorHandler';
import ErrorToast from '../../../Components/ErrorToast';
import { formatDateToISO } from '../../../Utils/FormatDate';

interface GeneratedShift {
  user_id: number;
  company_id: number;
  day: string;
  start_time: string;
  finish_time: string;
}

interface EvaluationResponse {
  company_info: {
    company_id: number;
    open_time: string;
    close_time: string;
    target_sales: number;
    labor_cost: number;
    rest_day: string[];
  };
  company_member: Array<{
    user_id: number;
    name: string;
    evaluate: number;
    position: string;
    experience: number;
    hour_pay: number;
    post: string;
  }>;
  edit_shift_id: {
    user_id: number;
    day: string;
    start_time: string;
    finish_time: string;
  };
  evaluate_decision_shift: Array<{
    user_id: number;
    day: string;
    start_time: string;
    finish_time: string;
    evaluate: string;
  }>;
  comment: string;
}

const GeminiShift = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    first_day: '',
    last_day: ''
  });
  const [comment, setComment] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedShifts, setGeneratedShifts] = useState<GeneratedShift[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 今週の月曜日と日曜日を取得
  const getThisWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      first_day: formatDate(monday),
      last_day: formatDate(sunday)
    };
  };

  // 来週の範囲を取得
  const getNextWeekRange = () => {
    const thisWeek = getThisWeekRange();
    const monday = new Date(thisWeek.first_day);
    monday.setDate(monday.getDate() + 7);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      first_day: formatDate(monday),
      last_day: formatDate(sunday)
    };
  };

  // 日付をフォーマット
  const formatDate = (date: Date) => {
    return formatDateToISO(date);
  };

  // プリセットを適用
  const applyPreset = (preset: 'thisWeek' | 'nextWeek' | 'thisMonth') => {
    if (preset === 'thisWeek') {
      setDateRange(getThisWeekRange());
    } else if (preset === 'nextWeek') {
      setDateRange(getNextWeekRange());
    } else if (preset === 'thisMonth') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateRange({
        first_day: formatDate(firstDay),
        last_day: formatDate(lastDay)
      });
    }
  };

  // AI生成を実行
  const handleGenerate = async () => {
    if (!dateRange.first_day || !dateRange.last_day) {
      alert('期間を選択してください');
      return;
    }

    // 既存データ削除の警告
    const confirmMessage = 
      `${dateRange.first_day}から${dateRange.last_day}までの既存のシフトデータは削除されます。\n` +
      'AIで新しいシフトを生成してもよろしいですか？';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsGenerating(true);
      const companyId = localStorage.getItem('company_id') || '1';
      
      // まず会社情報を確認し、必要に応じて時刻形式を修正
      try {
        const companyInfoResponse = await apiClient.get(`/company-info/${companyId}`);
        const companyData = companyInfoResponse.data;
        
        // 時刻形式が古い場合は修正
        if ((companyData.open_time && !companyData.open_time.includes(':00:00') && companyData.open_time.match(/^\d{2}:\d{2}$/)) ||
            (companyData.close_time && !companyData.close_time.includes(':00:00') && companyData.close_time.match(/^\d{2}:\d{2}$/))) {
          
          console.log('Detected old time format, updating before AI generation...');
          
          // formatTimeToISO関数を定義
          const formatTimeToISO = (time: string): string => {
            if (!time) return '';
            // すでに正しい形式の場合はそのまま返す
            if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
              return time;
            }
            // HH:MM形式の場合は:00を追加
            if (time.match(/^\d{2}:\d{2}$/)) {
              return `${time}:00`;
            }
            return time;
          };
          
          // 時刻形式を修正して保存
          const updateData = {
            company_info: {
              company_id: parseInt(companyId),
              company_name: companyData.company_name || '',
              store_locate: companyData.store_locate || '',
              open_time: formatTimeToISO(companyData.open_time || ''),
              close_time: formatTimeToISO(companyData.close_time || ''),
              target_sales: companyData.target_sales || 0,
              labor_cost: companyData.labor_cost || 0
            },
            rest_day: companyData.rest_days || [],
            position: companyData.position_names || [],
            evaluate_decision_shift: companyData.evaluate_decision_shift || []
          };
          
          await apiClient.post('/company-info-edit', updateData);
          console.log('Company time format updated successfully');
          
          // 少し待ってからAI生成を続行
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Failed to check/update company info:', error);
        // エラーが発生しても続行（バックエンドが対応している可能性があるため）
      }
      
      const requestData = {
        company_id: parseInt(companyId),
        first_day: dateRange.first_day,
        last_day: dateRange.last_day,
        comment: comment || ''
      };
      
      console.log('Sending request to /gemini-create-shift:', requestData);
      
      const response = await apiClient.post<{ edit_shift: GeneratedShift[] }>(
        '/gemini-create-shift', 
        requestData,
        {
          timeout: 300000 // 5分のタイムアウト（AI生成には時間がかかるため）
        }
      );
      
      console.log('Gemini API Response:', response.data);
      console.log('Generated shifts:', response.data.edit_shift);
      
      setGeneratedShifts(response.data.edit_shift || []);
      setShowPreview(true);
    } catch (error: any) {
      logError(error, 'GeminiShift.handleGenerate');
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const message = getErrorMessage(error);
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // シフトを評価
  const handleEvaluate = async () => {
    try {
      setIsEvaluating(true);
      const companyId = localStorage.getItem('company_id') || '1';
      
      const response = await apiClient.post<EvaluationResponse>(
        '/gemini-evaluate-shift', 
        {
          company_id: parseInt(companyId),
          first_day: dateRange.first_day,
          last_day: dateRange.last_day
        },
        {
          timeout: 300000 // 5分のタイムアウト（AI評価にも時間がかかるため）
        }
      );
      
      setEvaluationResult(response.data);
    } catch (error) {
      logError(error, 'GeminiShift.handleEvaluate');
      const message = getErrorMessage(error);
      setErrorMessage(message);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 生成結果を適用して調整画面へ
  const handleApplyAndEdit = () => {
    // AI生成されたシフトはバックエンドのedit_shiftテーブルに保存されているため、
    // 調整画面で自動的に読み込まれます
    navigate('/host/shift-adjustment');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/host/shift-adjustment')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">AIシフト生成</h1>
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

      <div className="max-w-4xl mx-auto p-6">
        {!showPreview ? (
          <div className="space-y-6">
            {/* AI生成の説明 */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-purple-900">Gemini AIによるシフト自動生成</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    従業員の希望シフト、スキル、過去の実績を基に、最適なシフトを自動生成します。
                    生成後は手動で調整することも可能です。
                  </p>
                </div>
              </div>
            </div>

            {/* 期間選択 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">生成期間の選択</h3>
              
              {/* プリセットボタン */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => applyPreset('thisWeek')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  今週
                </button>
                <button
                  onClick={() => applyPreset('nextWeek')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  来週
                </button>
                <button
                  onClick={() => applyPreset('thisMonth')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  今月
                </button>
              </div>

              {/* 日付入力 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
                  <input
                    type="date"
                    value={dateRange.first_day}
                    onChange={(e) => setDateRange({ ...dateRange, first_day: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
                  <input
                    type="date"
                    value={dateRange.last_day}
                    onChange={(e) => setDateRange({ ...dateRange, last_day: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* AIへの指示 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">AIへの指示（オプション）</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="例：土日は多めに人員を配置してください、新人は熟練者とペアで配置してください"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                ※ 特別な要望がある場合は、ここに記入してください
              </p>
            </div>

            {/* 生成ボタン */}
            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !dateRange.first_day || !dateRange.last_day}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    AI生成中... (最大5分かかります)
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    シフトを生成
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 生成結果のプレビュー */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">生成結果のプレビュー</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  {generatedShifts.length}件のシフトが生成されました
                </p>
              </div>
              
              {/* シフト一覧（簡易表示） */}
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">日付</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">時間</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">人数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* 日付ごとにグループ化して表示 */}
                    {Object.entries(
                      generatedShifts.reduce((acc, shift) => {
                        if (!acc[shift.day]) acc[shift.day] = [];
                        acc[shift.day].push(shift);
                        return acc;
                      }, {} as { [key: string]: GeneratedShift[] })
                    ).map(([day, shifts]) => (
                      <tr key={day}>
                        <td className="px-4 py-2 text-sm">{day}</td>
                        <td className="px-4 py-2 text-sm">
                          {shifts[0].start_time} - {shifts[0].finish_time}
                        </td>
                        <td className="px-4 py-2 text-sm">{shifts.length}名</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 評価ボタン */}
            <div className="flex justify-center my-6">
              <button
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    評価中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AIでシフトを評価
                  </>
                )}
              </button>
            </div>

            {/* 評価結果 */}
            {evaluationResult && (
              <div className="space-y-6">
                {/* 総合評価 */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="w-full">
                      <h3 className="text-lg font-bold text-purple-900 mb-2">AI評価結果</h3>
                      <p className="text-sm text-purple-700 mb-4">{evaluationResult.comment}</p>
                      
                      {/* 店舗情報サマリー */}
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">店舗情報</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>営業時間: {evaluationResult.company_info.open_time} - {evaluationResult.company_info.close_time}</div>
                          <div>売上目標: ¥{evaluationResult.company_info.target_sales.toLocaleString()}</div>
                          <div>人件費率: {evaluationResult.company_info.labor_cost}%</div>
                          <div>定休日: {evaluationResult.company_info.rest_day.join(', ')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 個別評価 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">従業員別評価</h3>
                  <div className="space-y-4">
                    {evaluationResult.evaluate_decision_shift.map((evalShift, index) => {
                      const member = evaluationResult.company_member.find(m => m.user_id === evalShift.user_id);
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-800">{member?.name || `従業員 ${evalShift.user_id}`}</h4>
                              <p className="text-sm text-gray-600">
                                {member?.position} | {member?.post === 'employee' ? '社員' : 'アルバイト'}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <p>{evalShift.day}</p>
                              <p>{evalShift.start_time} - {evalShift.finish_time}</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded p-3 mt-2">
                            <p className="text-sm text-gray-700">{evalShift.evaluate}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setGeneratedShifts([]);
                  setEvaluationResult(null);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                やり直す
              </button>
              <button
                onClick={handleApplyAndEdit}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                この結果を調整画面で編集
              </button>
            </div>
          </div>
        )}
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

export default GeminiShift;