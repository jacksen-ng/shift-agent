// src/Components/DecisionShiftTable.tsx
import React from 'react';
import { formatTimeDisplay } from '../Utils/FormatDate';

interface ShiftItem {
  name: string;
  position: string;
  post: string;
  day: string;
  start_time: string;
  finish_time: string;
}

interface Props {
  shifts: ShiftItem[];
  restDays: string[];
}

const DecisionShiftTable: React.FC<Props> = ({ shifts, restDays }) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">確定シフト一覧</h2>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">名前</th>
            <th className="border px-2 py-1">ポジション</th>
            <th className="border px-2 py-1">役割</th>
            <th className="border px-2 py-1">日付</th>
            <th className="border px-2 py-1">開始</th>
            <th className="border px-2 py-1">終了</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{shift.name}</td>
              <td className="border px-2 py-1">{shift.position}</td>
              <td className="border px-2 py-1">{shift.post}</td>
              <td className="border px-2 py-1">{shift.day}</td>
              <td className="border px-2 py-1">{formatTimeDisplay(shift.start_time)}</td>
              <td className="border px-2 py-1">{formatTimeDisplay(shift.finish_time)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <strong>休業日：</strong> {restDays.join(', ')}
      </div>
    </div>
  );
};

export default DecisionShiftTable;