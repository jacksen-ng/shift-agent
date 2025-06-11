import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStoreInfo } from '../../../Services/StoreService';
import { useAuth } from '../../../Hooks/UseAuth';

const Home = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const handleStoreInfoClick = async () => {
    try {
      const storeData = await fetchStoreInfo(user.company_id, token);
      console.log('取得した店舗情報:', storeData);

      // 遷移 + state 渡す
      navigate('/host/store-info', { state: { storeData } });
    } catch (error) {
      alert('店舗情報の取得に失敗しました');
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ホーム画面（ホスト）</h1>
      <button
        onClick={handleStoreInfoClick}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        店舗情報へ
      </button>
    </div>
  );
};

export default Home;