import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface LoginResponse {
  user_id: number;
  company_id: number;
  role: 'owner' | 'crew';
  access_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
}

// Cookieを設定するヘルパー関数
const setCookie = (name: string, value: string, days: number = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

// Cookieを取得するヘルパー関数
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Cookieを削除するヘルパー関数
export const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

// アクセストークンを取得する関数
export const getAccessToken = (): string | null => {
  return getCookie('access_token');
};

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}/login`, {
      email,
      password
    });
    
    if (response.status === 200 && response.data) {
      // Mock APIの変更に対応：トークンは返されないので、ダミートークンをセット
      setCookie('access_token', 'dummy_access_token');
      setCookie('token_type', 'Bearer');
      
      // 有効期限を1時間後に設定
      const expiresAt = new Date().getTime() + (3600 * 1000);
      setCookie('expires_at', expiresAt.toString());
      
      // LocalStorageに基本情報を保存
      localStorage.setItem('user_id', response.data.user_id.toString());
      localStorage.setItem('company_id', response.data.company_id.toString());
      
      // APIから返されたroleを使用
      const role = response.data.role;
      localStorage.setItem('role', role);
      
      return {
        user_id: response.data.user_id.toString(),
        company_id: response.data.company_id.toString(),
        role: role,
        access_token: 'dummy_access_token',
        message: 'ログイン成功'
      };
    }
    
    throw new Error('ログインに失敗しました');
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw error;
    }
    throw new Error('サーバーとの通信に失敗しました');
  }
};

export const registerHost = async (_name: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sign-in`, {
      email,
      password,
      confirm_password: password, // 確認用パスワードも同じ値を送る
      role: 'owner'
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw error;
    }
    throw new Error('登録に失敗しました');
  }
};

// Crew登録用のAPIは現在のMock APIには存在しない
// TODO: 実際のプロダクションではクルー登録APIの実装が必要
export const registerCrew = async (_email: string, _password: string) => {
  throw new Error('クルー登録APIは未実装です');
};

// ログアウト処理
export const logout = () => {
  // Cookieをクリア
  deleteCookie('access_token');
  deleteCookie('id_token');
  deleteCookie('token_type');
  deleteCookie('expires_at');
  
  // LocalStorageもクリア
  localStorage.clear();
};

// トークンの有効期限をチェック
export const isTokenExpired = (): boolean => {
  const expiresAt = getCookie('expires_at');
  if (!expiresAt) return true;
  
  const now = new Date().getTime();
  return now > parseInt(expiresAt);
};