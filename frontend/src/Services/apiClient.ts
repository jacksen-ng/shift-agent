import axios, { InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, isTokenExpired, logout } from './AuthService';

// 開発環境ではプロキシを使用してCORSを回避
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '' // 開発環境ではプロキシ経由
  : (process.env.REACT_APP_API_BASE_URL || 'https://shift-agent-backend-562837022896.asia-northeast1.run.app');

// axiosインスタンスを作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    if (isTokenExpired()) {
      if (!config.url?.includes('/login') && !config.url?.includes('/sign-in')) {
        logout();
        window.location.href = '/login';
        throw new Error('トークンの有効期限が切れています');
      }
    }

    const token = getAccessToken();
    if (token && !config.url?.includes('/login') && !config.url?.includes('/sign-in')) {
      // Authorizationヘッダーを設定
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
