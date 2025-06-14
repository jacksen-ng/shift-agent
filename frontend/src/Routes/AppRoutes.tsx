import { Routes, Route } from 'react-router-dom';
import HostHome from '../Features/Host/Pages/Home';
import StoreInfo from '../Features/Host/Pages/StoreInfo';
import CrewInfo from '../Features/Host/Pages/CrewInfo';
import CrewEdit from '../Features/Host/Pages/CrewEdit';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/host/home" element={<HostHome />} />
      <Route path="/host/store-info" element={<StoreInfo />} />
      <Route path="/host/crew-info" element={<CrewInfo />} />
      <Route path="/host/crew-edit/:name" element={<CrewEdit />} />
    </Routes>
  );
};

export default AppRoutes;