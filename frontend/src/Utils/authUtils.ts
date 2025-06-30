// 認証情報が存在するかチェック
export const checkAuthInfo = (): boolean => {
  const userId = localStorage.getItem('user_id');
  const companyId = localStorage.getItem('company_id');
  const role = localStorage.getItem('role');
  
  return !!(userId && companyId && role);
};

// 必要な認証情報を取得（存在しない場合はnullを返す）
export const getAuthInfo = () => {
  const userId = localStorage.getItem('user_id');
  const companyId = localStorage.getItem('company_id');
  const role = localStorage.getItem('role');
  
  if (!userId || !companyId || !role) {
    return null;
  }
  
  return {
    userId,
    companyId,
    role: role as 'owner' | 'crew'
  };
};

// 認証情報がない場合はログイン画面にリダイレクト
export const requireAuth = () => {
  if (!checkAuthInfo()) {
    window.location.href = '/login';
    return false;
  }
  return true;
};