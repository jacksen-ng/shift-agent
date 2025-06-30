import { createContext, useState, ReactNode, useEffect } from 'react';
import { LoginResponse } from '../Types/AuthTypes';
import { logout as authServiceLogout } from '../Services/AuthService';

type UserState = {
  role: string | null;
  userId: string | null;
  companyId: number | null;
};

type AuthContextType = {
  user: UserState | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: LoginResponse) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('role');
      const storedUserId = localStorage.getItem('user_id');
      const storedCompanyId = localStorage.getItem('company_id');

      if (storedRole && storedUserId && storedCompanyId) {
        setUser({ role: storedRole, userId: storedUserId, companyId: parseInt(storedCompanyId, 10) });
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: LoginResponse) => {
    const userState: UserState = {
      role: userData.role,
      userId: userData.user_id.toString(),
      companyId: userData.company_id,
    };
    setUser(userState);
    // localStorage is already set by AuthService.login
  };

  const logout = () => {
    authServiceLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};