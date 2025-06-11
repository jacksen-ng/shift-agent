import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Routes/AppRoutes';
import { AuthProvider } from './Contexts/AuthContext'; // ここ重要！

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>  {/* 👈 これで全体を囲む */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;