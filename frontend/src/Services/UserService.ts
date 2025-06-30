import apiClient from './apiClient';

interface CrewMember {
  user_id: number;
  name: string;
  age: number;
  phone: string;
  position: string;
  evaluate: number;
  join_company_day: string;
  hour_pay: number;
  post: string;
}

interface CrewInfoResponse {
  company_member: CrewMember[];
}

// 会社のメンバー情報を取得
export const fetchCrewInfo = async (companyId: string): Promise<CrewInfoResponse> => {
  const response = await apiClient.get<CrewInfoResponse>('/crew-info', {
    params: { company_id: parseInt(companyId) }
  });
  return response.data;
};

// 自分のユーザー情報を取得
export const fetchMyUserInfo = async (): Promise<CrewMember | null> => {
  const userId = localStorage.getItem('user_id');
  const companyId = localStorage.getItem('company_id');
  
  if (!userId || !companyId) {
    return null;
  }
  
  try {
    const response = await fetchCrewInfo(companyId);
    const myInfo = response.company_member.find(
      member => member.user_id === parseInt(userId)
    );
    
    return myInfo || null;
  } catch (error: any) {
    console.error('ユーザー情報の取得に失敗しました:', error);
    if (error.response) {
      console.error('エラーレスポンス:', error.response.data);
      console.error('ステータスコード:', error.response.status);
    }
    return null;
  }
};

// ユーザー情報をキャッシュに保存
const USER_INFO_CACHE_KEY = 'user_info_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30分

export const getCachedUserInfo = (): CrewMember | null => {
  const cached = localStorage.getItem(USER_INFO_CACHE_KEY);
  if (!cached) return null;
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(USER_INFO_CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

export const setCachedUserInfo = (userInfo: CrewMember) => {
  const cacheData = {
    data: userInfo,
    timestamp: Date.now()
  };
  localStorage.setItem(USER_INFO_CACHE_KEY, JSON.stringify(cacheData));
};

// キャッシュ付きでユーザー情報を取得
export const fetchMyUserInfoWithCache = async (): Promise<CrewMember | null> => {
  // キャッシュをチェック
  const cached = getCachedUserInfo();
  if (cached) return cached;
  
  // APIから取得
  const userInfo = await fetchMyUserInfo();
  if (userInfo) {
    setCachedUserInfo(userInfo);
  }
  
  return userInfo;
};