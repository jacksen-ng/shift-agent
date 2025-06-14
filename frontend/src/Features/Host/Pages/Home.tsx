import React from 'react';
import Navbar from '../../../Components/Navbar';
import { useNavigate } from 'react-router-dom';
import { fetchStoreInfo } from '../../../Services/StoreService';
import { useAuth } from '../../../Hooks/UseAuth';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const handleStoreInfoClick = async () => {
    try {
      const storeData = await fetchStoreInfo(user.company_id, token);
      console.log('取得した店舗情報:', storeData);
      navigate('/host/store-info', { state: { storeData } });
    } catch (error) {
      console.error('店舗情報の取得に失敗しました:', error);
      alert('店舗情報の取得に失敗しました');
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-between px-8 pt-24">
        <div className="w-2/3 pr-8">{/* データ未実装のため空 */}</div>
        <div className="w-1/3 flex flex-col space-y-6">
          <button
            onClick={handleStoreInfoClick} // ← 修正
            className="py-6 px-4 text-lg font-semibold text-black bg-white border border-gray-300 rounded-xl shadow-md hover:bg-gray-100 transition duration-200"
          >
            店舗情報
          </button>
          <button
            onClick={() => handleNavigate('/host/crew-info')}
            className="py-6 px-4 text-lg font-semibold text-black bg-white border border-gray-300 rounded-xl shadow-md hover:bg-gray-100 transition duration-200"
          >
            従業員情報
          </button>
          <button
            onClick={() => handleNavigate('/host/shit')}
            className="py-6 px-4 text-lg font-semibold text-black bg-white border border-gray-300 rounded-xl shadow-md hover:bg-gray-100 transition duration-200"
          >
            シフト
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;