import axios from 'axios';
import { LoginResponse, RegisterRequest, RegisterResponse } from '../Types/AuthTypes';

// 認証系APIのベースURL（環境変数から取得、なければデフォルト値）
const AUTH_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://shift-agent-backend-562837022896.asia-northeast1.run.app';

// 認証サービス用のaxiosインスタンス
const authAxios = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true // Cookieを正しく送受信するためにtrueに設定
});

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await authAxios.post<LoginResponse>('/login', {
      email,
      password
    });
    
    if (response.status === 200 && response.data) {
      const { user_id, company_id, role, firebase_uid } = response.data;
      
      localStorage.setItem('user_id', user_id.toString());
      localStorage.setItem('company_id', company_id.toString());
      localStorage.setItem('role', role);
      if (firebase_uid) {
        localStorage.setItem('firebase_uid', firebase_uid);
      }
      
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

export const registerHost = async (data: RegisterRequest): Promise<void> => {
  try {
    const requestBody: any = {
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
      role: data.role || 'owner'
    };

    if (data.company_id) {
      requestBody.company_id = parseInt(data.company_id, 10);
    }
    
    await authAxios.post('/signin', requestBody);

  } catch (error: any) {
    console.error('登録エラー:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || '入力内容に誤りがあります');
    }
    if (error.response?.status === 422) {
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
  localStorage.removeItem('user_id');
  localStorage.removeItem('company_id');
  localStorage.removeItem('role');
  localStorage.removeItem('firebase_uid');
  localStorage.removeItem('user_info_cache');
};