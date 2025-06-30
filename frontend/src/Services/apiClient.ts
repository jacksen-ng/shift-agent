import axios from 'axios';
import { getIdToken, isTokenExpired, logout } from './AuthService';

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
    // ログインページやサインインページへのリクエストはそのまま送る
    if (config.url?.includes('/login') || config.url?.includes('/signin')) {
      return config;
    }

    // トークンの有効期限をチェック
    if (isTokenExpired()) {
      console.log('トークンが有効期限切れです。ログアウトします。');
      logout();
      window.location.href = '/login';
      // リクエストをキャンセル
      return Promise.reject(new Error('Token expired'));
    }

    // CookieからIDトークンを取得
    const idToken = getIdToken();

    if (idToken) {
      // ヘッダーにAuthorizationを追加
      config.headers['Authorization'] = `Bearer ${idToken}`;
    } else {
      // トークンがない場合、ログインページにリダイレクト
      console.log('IDトークンが見つかりません。ログインページにリダイレクトします。');
      logout(); // 念のため既存の認証情報をクリア
      window.location.href = '/login';
      // リクエストをキャンセル
      return Promise.reject(new Error('No ID token found'));
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
    // 401 Unauthorizedエラーの場合、トークンが無効と判断しログアウト
    if (error.response?.status === 401) {
      console.log('401 Unauthorizedエラー。トークンが無効か期限切れの可能性があります。');
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
