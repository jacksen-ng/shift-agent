import { Routes, Route } from 'react-router-dom';
import HostHome from '../Features/Host/Pages/Home';
import StoreInfo from '../Features/Host/Pages/StoreInfo';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/host/home" element={<HostHome />} />
      <Route path="/host/store-info" element={<StoreInfo />} />
    </Routes>
  );
};

export default AppRoutes;