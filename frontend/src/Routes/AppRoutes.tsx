import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../Features/Auth/Login';
import HostRegister from '../Features/Auth/HostRegister';
import HostHome from '../Features/Host/Pages/Home';
import StoreInfo from '../Features/Host/Pages/StoreInfo';
import CrewInfo from '../Features/Host/Pages/CrewInfo';
import CrewAdd from '../Features/Host/Pages/CrewCreate';
import CrewEdit from '../Features/Host/Pages/CrewEdit';
import CrewHome from '../Features/Crew/Pages/CrewHome';
import ShiftSubmit from '../Features/Crew/Pages/ShiftSubmit';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🔰 最初のルート：ログイン画面にリダイレクト */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* 共通認証系 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register/host" element={<HostRegister />} />

      {/* ホスト用 */}
      <Route path="/host/home" element={<HostHome />} />
      <Route path="/host/store-info" element={<StoreInfo />} />
      <Route path="/host/crew-info" element={<CrewInfo />} />
      <Route path="/host/crew/add" element={<CrewAdd />} />
      <Route path="/host/crew-edit/:name" element={<CrewEdit />} />

      {/* クルー用 */}
      <Route path="/crew/home" element={<CrewHome />} />
      <Route path="/crew/shift-submit" element={<ShiftSubmit />} />
    </Routes>
  );
};

export default AppRoutes;