import { useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext';

// src/Hooks/UseAuth.ts

export const useAuth = () => {
  return {
    user: {
      company_id: 'dummy_company',
      // その他使わない項目は省略OK
    },
    token: 'dummy_token'
  };
};