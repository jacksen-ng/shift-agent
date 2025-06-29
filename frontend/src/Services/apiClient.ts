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
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    // ログインしているかチェック
    if (!config.url?.includes('/login') && !config.url?.includes('/signin')) {
      const userId = localStorage.getItem('user_id');
      const companyId = localStorage.getItem('company_id');
      
      // ログインしていない場合はリダイレクト
      if (!userId || !companyId) {
        logout();
        window.location.href = '/login';
        throw new Error('ログインが必要です');
      }
    }
    
    // CORSエラー回避のため、一時的にCredentialsを無効化
    // TODO: バックエンドのCORS設定が修正されたら有効化する
    config.withCredentials = false;

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
