// Services/CrewService.ts
import apiClient from './apiClient';

interface CrewProfile {
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
  company_member: CrewProfile[];
}

export const fetchCrewInfo = async (company_id: string): Promise<CrewInfoResponse> => {
  const response = await apiClient.get<CrewInfoResponse>('/crew-info', {
    params: { company_id: parseInt(company_id) },
  });
  return response.data;
};