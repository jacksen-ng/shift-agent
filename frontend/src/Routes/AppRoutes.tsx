import { Routes, Route } from 'react-router-dom';
import HostHome from '../Features/Host/Pages/Home'; // あなたのホーム画面

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/host/home" element={<HostHome />} />
    </Routes>
  );
};

export default AppRoutes;