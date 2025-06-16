import { Routes, Route } from 'react-router-dom';
import HostHome from '../Features/Host/Pages/Home';
import StoreInfo from '../Features/Host/Pages/StoreInfo';
import CrewInfo from '../Features/Host/Pages/CrewInfo';
import CrewHome from '../Features/Crew/Pages/CrewHome';
import ShiftSubmit from '../Features/Crew/Pages/ShiftSubmit';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ホスト用 */}
      <Route path="/host/home" element={<HostHome />} />
      <Route path="/host/store-info" element={<StoreInfo />} />
      <Route path="/host/crew-info" element={<CrewInfo />} />

      {/* クルー用 */}
      <Route path="/crew/home" element={<CrewHome />} /> 
      <Route path="/crew/shift-submit" element={<ShiftSubmit />} />
    </Routes>
  );
};

export default AppRoutes;


