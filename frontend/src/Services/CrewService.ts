// Services/CrewService.ts
import apiClient from './apiClient';
import { CrewInfoResponse, CrewInfoEditRequest } from '../Types/EmployeeTypes';

export const fetchCrewInfo = async (company_id: string): Promise<CrewInfoResponse> => {
  const response = await apiClient.get<CrewInfoResponse>('/crew-info', {
    params: { company_id: parseInt(company_id) },
  });
  return response.data;
};

export const updateCrewInfo = async (data: CrewInfoEditRequest): Promise<void> => {
  await apiClient.post('/crew-info-edit', data);
};