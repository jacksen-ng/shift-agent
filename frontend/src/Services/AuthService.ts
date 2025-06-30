import axios from 'axios';
import { LoginResponse, RegisterRequest, RegisterResponse } from '../Types/AuthTypes';

// 認証系APIのベースURL（環境変数から取得、なければデフォルト値）
const AUTH_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://shift-agent-backend-562837022896.asia-northeast1.run.app';

// 認証サービス用のaxiosインスタンス
const authAxios = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true // Cookieを正しく送受信するためにtrueに設定
});

// Cookieを設定するヘルパー関数
const setCookie = (name: string, value: string, days?: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  // セキュリティ強化のため、Secure; SameSite=Strict; HttpOnly を推奨
  // HttpOnlyはJSからアクセスできなくなるため、今回は付与しない
  document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Strict; Secure";
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
  // pathとdomainを指定しないと正しく削除できない場合がある
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};


// IDトークンを取得する関数
export const getIdToken = (): string | null => {
  return getCookie('id_token');
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // 認証系は直接バックエンドにアクセス
    const response = await authAxios.post<LoginResponse>('/login', {
      email,
      password
    });
    
    console.log('ログインAPIレスポンス:', response.data);
    
    if (response.status === 200 && response.data.success) {
      const { id_token, refresh_token, expires_in, user_id, company_id, role, firebase_uid } = response.data;

      // トークンをCookieに保存
      const expiresDate = new Date();
      expiresDate.setTime(expiresDate.getTime() + (expires_in * 1000));
      setCookie('id_token', id_token, expires_in / (24 * 60 * 60));
      setCookie('refresh_token', refresh_token, 30); // リフレッシュトークンは長めに設定

      // 有効期限をCookieに保存
      setCookie('expires_at', expiresDate.getTime().toString());
      
      // LocalStorageに基本情報を保存
      localStorage.setItem('user_id', user_id.toString());
      localStorage.setItem('company_id', company_id.toString());
      localStorage.setItem('role', role);
      localStorage.setItem('firebase_uid', firebase_uid);
      
      return response.data;
    }
    
    throw new Error('ログインに失敗しました');
  } catch (error: any) {
    console.error('ログインエラー:', error.response?.data || error.message);
    if (error.response?.status === 400 || error.response?.status === 422) {
      throw new Error(error.response.data.detail || 'メールアドレスまたはパスワードが正しくありません');
    }
    if (error.response?.status === 500) {
      throw new Error('サーバーエラーが発生しました。しばらくしてから再度お試しください');
    }
    throw new Error('サーバーとの通信に失敗しました');
  }
};

export const registerHost = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    // API設計図通り：/signin（ハイフンなし）で roleも必要
    const requestBody: any = {
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
      role: data.role || 'owner'  // roleが指定されていない場合はownerをデフォルト
    };
    
    console.log('登録リクエスト:', requestBody);
    
    // 認証系は直接バックエンドにアクセス
    const response = await authAxios.post<RegisterResponse>('/signin', requestBody);
    console.log('登録成功:', response.data);
    
    if(response.data.success) {
      return response.data;
    } else {
      throw new Error('登録に失敗しました。');
    }

  } catch (error: any) {
    console.error('登録エラー:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || '入力内容に誤りがあります');
    }
    if (error.response?.status === 422) {
      // バリデーションエラーの詳細を表示
      const details = error.response.data.detail;
      if (Array.isArray(details)) {
        const messages = details.map((d: any) => d.msg).join(', ');
        throw new Error(`入力エラー: ${messages}`);
      }
      throw new Error('入力内容を確認してください');
    }
    if (error.response?.status === 500) {
      throw new Error('サーバーエラーが発生しました');
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
  deleteCookie('id_token');
  deleteCookie('refresh_token');
  deleteCookie('expires_at');
  
  // LocalStorageもクリア
  localStorage.removeItem('user_id');
  localStorage.removeItem('company_id');
  localStorage.removeItem('role');
  localStorage.removeItem('firebase_uid');
  localStorage.removeItem('user_info_cache'); // ユーザー情報キャッシュも削除
};

// トークンの有効期限をチェック
export const isTokenExpired = (): boolean => {
  const expiresAt = getCookie('expires_at');
  if (!expiresAt) return true;
  
  const now = new Date().getTime();
  return now > parseInt(expiresAt);
};