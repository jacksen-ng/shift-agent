import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../Features/Auth/Login';
import HostRegister from '../Features/Auth/HostRegister';
import HostHome from '../Features/Host/Pages/Home';
import StoreInfo from '../Features/Host/Pages/StoreInfo';
import CrewInfo from '../Features/Host/Pages/CrewInfo';
import CrewEdit from '../Features/Host/Pages/CrewEdit';
import ShiftAdjustment from '../Features/Host/Pages/ShiftAdjustment';
import GeminiShift from '../Features/Host/Pages/GeminiShift';
import ShiftConfirm from '../Features/Host/Pages/ShiftConfirm';
import CrewHome from '../Features/Crew/Pages/CrewHome';
import CrewShiftSubmit from '../Features/Crew/Pages/ShiftSubmit';
import ShiftCheck from '../Features/Crew/Pages/ShiftCheck';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🔰 最初のルート：ログイン画面にリダイレクト */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* 共通認証系 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<HostRegister />} />

      {/* ホスト用 */}
      <Route path="/host/home" element={<HostHome />} />
      <Route path="/host/store-info" element={<StoreInfo />} />
      <Route path="/host/crew-info" element={<CrewInfo />} />
      <Route path="/host/crew-edit/:id" element={<CrewEdit />} />
      <Route path="/host/shift-adjustment" element={<ShiftAdjustment />} />
      <Route path="/host/gemini-shift" element={<GeminiShift />} />
      <Route path="/host/shift-confirm" element={<ShiftConfirm />} />

      {/* クルー用 */}
      <Route path="/crew/home" element={<CrewHome />} />
      <Route path="/crew/shift-submit" element={<CrewShiftSubmit />} />
      <Route path="/crew/shift-check" element={<ShiftCheck />} />
    </Routes>
  );
};

export default AppRoutes;