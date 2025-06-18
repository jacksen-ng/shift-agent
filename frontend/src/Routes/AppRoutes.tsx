import { Routes, Route } from 'react-router-dom';
import Login from '../Features/Auth/Login';
import HostRegister from '../Features/Auth/HostRegister';
import HostHome from '../Features/Host/Pages/Home';
import StoreInfo from '../Features/Host/Pages/StoreInfo';
import CrewInfo from '../Features/Host/Pages/CrewInfo';
import CrewHome from '../Features/Crew/Pages/CrewHome';
import ShiftSubmit from '../Features/Crew/Pages/ShiftSubmit';
import CrewAdd from '../Features/Host/Pages/CrewCreate';


const AppRoutes = () => {
  return (
    <Routes>
      {/* 共通認証系 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register/host" element={<HostRegister />} />
   



     

      {/* ホスト画面 */}
      <Route path="/host/home" element={<HostHome />} />
      {/* 他のホストルートもここに記載 */}

      {/* クルー画面 */}
      <Route path="/crew/home" element={<CrewHome />} />
      {/* ホスト用 */}
      <Route path="/host/home" element={<HostHome />} />
      <Route path="/host/store-info" element={<StoreInfo />} />
      <Route path="/host/crew-info" element={<CrewInfo />} />
      <Route path="/host/crew/add" element={<CrewAdd />} /> 

      {/* クルー用 */}
      <Route path="/crew/home" element={<CrewHome />} /> 
      <Route path="/crew/shift-submit" element={<ShiftSubmit />} />
    </Routes>
  );
};

export default AppRoutes;


