// src/Features/Crew/Pages/Home.tsx

import React, { useEffect, useState } from 'react';
import CrewNavbar from '../../../Components/CrewNavbar';
import { fetchDecisionShift } from '../../../Services/ShiftService';
import DecisionShiftTable from '../../../Components/DecisionShiftTable';

const CrewHome: React.FC = () => {
  // HostHome.tsx / CrewHome.tsx の該当箇所
   
  const [shifts, setShifts] = useState<any[]>([]);
  const [restDays, setRestDays] = useState<string[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchDecisionShift('dummy_company');
        setShifts(res.shifts || []);
        setRestDays(res.rest_day || []);
      } catch (error) {
        console.error('シフト情報の取得に失敗しました', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <CrewNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">確定シフト情報（クルー）</h1>
        <DecisionShiftTable shifts={shifts} restDays={restDays} />
      </div>
    </>
  );
};

export default CrewHome;