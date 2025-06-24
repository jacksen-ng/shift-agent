import axios from 'axios';
import { getAccessToken, isTokenExpired, logout } from './AuthService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

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
    // トークンが期限切れの場合
    if (isTokenExpired()) {
      // ログインページへリダイレクト（ログインAPI自体は除外）
      if (!config.url?.includes('/login') && !config.url?.includes('/sign-in')) {
        logout();
        window.location.href = '/login';
        throw new Error('トークンの有効期限が切れています');
      }
    }

    // アクセストークンを取得してヘッダーに追加
    const token = getAccessToken();
    if (token && !config.url?.includes('/login') && !config.url?.includes('/sign-in')) {
      // headers が undefined の場合は初期化
      if (!config.headers) {
        config.headers = axios.AxiosHeaders.from({});
      }
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401エラー（認証エラー）の場合
    if (error.response?.status === 401) {
      logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;