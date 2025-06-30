import { createContext, useState, ReactNode } from 'react';

type AuthContextType = {
  user: any;
  token: string;
  login: (token: string, user: any) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  const login = (token: string, user: any) => {
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    setUser(null);
    setToken('');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};