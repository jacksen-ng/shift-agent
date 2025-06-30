import { useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext';

// src/Hooks/UseAuth.ts

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};