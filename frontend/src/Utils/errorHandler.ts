import { logout } from '../Services/AuthService';

// AxiosErrorの型定義
type AxiosError<T = any> = Error & {
  config: any;
  code?: string;
  request?: any;
  response?: {
    data: T;
    status: number;
    statusText: string;
  };
  isAxiosError: boolean;
};

// Axiosエラーかどうかを判定
const isAxiosError = (error: any): error is AxiosError => {
  return error && error.isAxiosError === true;
};

export const getErrorMessage = (error: unknown): string => {
  // Axiosエラーの場合
  if (isAxiosError(error)) {
    const axiosError = error;
    // レスポンスがある場合
    if (axiosError.response?.data) {
      const data = axiosError.response.data as { detail?: string; message?: string };
      
      // APIからのエラーメッセージ
      if (data.detail) {
        return data.detail;
      }
      if (data.message) {
        return data.message;
      }
    }
    
    // ネットワークエラー
    if (axiosError.code === 'ERR_NETWORK') {
      return 'ネットワークエラーが発生しました。接続を確認してください。';
    }
    
    // タイムアウト
    if (axiosError.code === 'ECONNABORTED') {
      return 'リクエストがタイムアウトしました。もう一度お試しください。';
    }
    
    // HTTPステータスコードに基づくメッセージ
    if (axiosError.response) {
      switch (axiosError.response.status) {
        case 400:
          return '入力内容に誤りがあります。';
        case 401:
          return '認証が必要です。ログインし直してください。';
        case 403:
          // 403エラーの場合は自動的にログアウト
          logout();
          window.location.href = '/login';
          return 'アクセス権限がありません。ログイン画面に戻ります。';
        case 404:
          return 'リクエストされたデータが見つかりません。';
        case 500:
          return 'サーバーエラーが発生しました。しばらく後でお試しください。';
        default:
          return 'エラーが発生しました。もう一度お試しください。';
      }
    }
    
    return 'エラーが発生しました。もう一度お試しください。'
  }
  
  // その他のエラー
  if (error instanceof Error) {
    return error.message;
  }
  
  return '予期しないエラーが発生しました。';
};

// エラーログを送信する関数（本番環境では外部サービスに送信）
export const logError = (error: unknown, context?: string) => {
  console.error(`[${context || 'Unknown'}] Error:`, error);
  
  // 本番環境では、SentryやLogrocketなどのエラートラッキングサービスに送信
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { tags: { context } });
  // }
};