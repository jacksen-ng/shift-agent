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


