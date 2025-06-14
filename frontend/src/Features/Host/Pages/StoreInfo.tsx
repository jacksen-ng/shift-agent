import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const StoreInfo = () => {
  const location = useLocation();
  const [storeData, setStoreData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (location.state?.storeData) {
      setStoreData(location.state.storeData);
      setFormData(location.state.storeData);
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const cleanedData = {
        ...formData,
        company_id: 1,
        target_sales: Number(formData.target_sales),
        labor_cost: Number(formData.labor_cost),
        rest_day: storeData.rest_day,
        position_name: storeData.position_name,
      };

      const response = await axios.post<{ message: string; updated_data: any }>(
        'http://localhost:8000/store-info',
        cleanedData
      );

      alert('保存完了');
      setIsEditing(false);
      setStoreData(response.data.updated_data);
    } catch (error) {
      alert('保存に失敗しました');
      console.error(error);
    }
  };

  if (!storeData) return <div>店舗情報を読み込み中...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">店舗情報編集</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* 左：営業情報 */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold">会社名</label>
            <input
              name="company_name"
              className="w-full border rounded px-3 py-2"
              value={formData.company_name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block font-semibold">所在地</label>
            <input
              name="store_locate"
              className="w-full border rounded px-3 py-2"
              value={formData.store_locate}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block font-semibold">営業時間</label>
            <div className="flex space-x-2">
              <input
                name="open_time"
                className="border rounded px-3 py-2 w-1/2"
                value={formData.open_time}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <span>〜</span>
              <input
                name="close_time"
                className="border rounded px-3 py-2 w-1/2"
                value={formData.close_time}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* 右：金銭情報 */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold">売上目標（円）</label>
            <input
              name="target_sales"
              type="number"
              className="w-full border rounded px-3 py-2"
              value={formData.target_sales}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block font-semibold">人件費（円）</label>
            <input
              name="labor_cost"
              type="number"
              className="w-full border rounded px-3 py-2"
              value={formData.labor_cost}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="mt-6">
        {!isEditing ? (
          <button
            className="px-6 py-2 bg-mint text-black rounded"
            onClick={() => setIsEditing(true)}
          >
            編集する
          </button>
        ) : (
          <button
            className="px-6 py-2 bg-blue-500 text-black rounded"
            onClick={handleSave}
          >
            保存する
          </button>
        )}
      </div>
    </div>
  );
};

export default StoreInfo;