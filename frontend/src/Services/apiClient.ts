import axios from 'axios';
import { logout } from './AuthService';

// バックエンドのベースURL（環境変数から取得、なければデフォルト値）
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://shift-agent-backend-562837022896.asia-northeast1.run.app';

// axiosインスタンスを作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cookieを正しく送受信するためにtrueに設定
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
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
      console.log('401 Unauthorized: Redirecting to login.');
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
