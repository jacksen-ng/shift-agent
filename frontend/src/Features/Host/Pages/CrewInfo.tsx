import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchCrewInfo } from '../../../Services/CrewService';
import { useNavigate } from 'react-router-dom';

interface CrewProfile {
  name: string;
  age: number;
  phone: number;
  position: string;
  evaluate: number;
  join_company_day: string;
  hour_pay: number;
  post: string;
}

const CrewInfo = () => {
  const navigate = useNavigate();
  const [crewList, setCrewList] = useState<CrewProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrewData = async () => {
      try {
        const response = await axios.get<CrewProfile[]>('http://localhost:8000/crew-info', {
          params: { company_id: 'dummy_company' },
          headers: { Authorization: 'Bearer dummy_token' },
        });
        setCrewList(response.data);
      } catch (error) {
        console.error('従業員情報の取得に失敗しました', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrewData();
  }, []);

  if (loading) return <div className="p-4">従業員情報を読み込み中...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">従業員一覧</h1>
        <button
          onClick={() => navigate('/host/crew/add')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ＋追加
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {crewList.map((crew, index) => (
          <div key={index} className="border p-4 rounded shadow bg-white text-black">
            <p><strong>名前:</strong> {crew.name}</p>
            <p><strong>年齢:</strong> {crew.age}歳</p>
            <p><strong>電話番号:</strong> {crew.phone}</p>
            <p><strong>ポジション:</strong> {crew.position}</p>
            <p><strong>評価:</strong> {crew.evaluate}</p>
            <p><strong>入社日:</strong> {crew.join_company_day}</p>
            <p><strong>時給:</strong> ¥{crew.hour_pay}</p>
            <p><strong>雇用形態:</strong> {crew.post}</p>
            <button
              onClick={() => navigate(`/host/crew-edit/${crew.name}`)}
              className="mt-2 text-blue-400 underline hover:text-blue-200"
            >
              編集
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrewInfo;