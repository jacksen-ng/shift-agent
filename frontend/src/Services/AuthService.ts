import axios from 'axios';

// 認証系APIのベースURL（直接アクセス）
const AUTH_BASE_URL = 'https://shift-agent-backend-562837022896.asia-northeast1.run.app';

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
    // 認証系は直接バックエンドにアクセス（プロキシを使わない）
    const response = await axios.post<LoginResponse>(`${AUTH_BASE_URL}/login`, {
      email,
      password
    });
    
    console.log('ログインAPIレスポンス:', response.data);
    
    if (response.status === 200 && response.data) {
      // アクセストークンが返されれば使用、なければダミートークンをセット
      const accessToken = response.data.access_token || 'dummy_access_token';
      setCookie('access_token', accessToken);
      setCookie('token_type', response.data.token_type || 'Bearer');
      
      // 有効期限を設定
      const expiresIn = response.data.expires_in || 3600;
      const expiresAt = new Date().getTime() + (expiresIn * 1000);
      setCookie('expires_at', expiresAt.toString());
      
      // LocalStorageに基本情報を保存
      localStorage.setItem('user_id', response.data.user_id.toString());
      localStorage.setItem('company_id', response.data.company_id.toString());
      
      // APIから返されたroleを使用（返されない場合はデフォルトで'owner'とする）
      const role = response.data.role || 'owner';
      console.warn('APIレスポンスにroleが含まれていません。デフォルトで"owner"を設定します。');
      localStorage.setItem('role', role);
      
      const result = {
        user_id: response.data.user_id.toString(),
        company_id: response.data.company_id.toString(),
        role: role,
        access_token: accessToken,
        message: 'ログイン成功'
      };
      
      console.log('ログイン処理の戻り値:', result);
      return result;
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

interface SignInRequest {
  email: string;
  password: string;
  confirm_password: string;
}

export const registerHost = async (data: SignInRequest) => {
  try {
    // API設計図通り：/sign-in（ハイフン付き）で roleも必要
    const requestBody = {
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
      role: 'owner'  // オーナー登録なのでroleは'owner'
    };
    
    console.log('登録リクエスト:', requestBody);
    
    // 認証系は直接バックエンドにアクセス
    const response = await axios.post(`${AUTH_BASE_URL}/signin`, requestBody);
    console.log('登録成功:', response.data);
    
    return response.data;
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