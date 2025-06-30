import apiClient from './apiClient';
import { CompanyInfoResponse, CompanyInfoEditRequest } from '../Types/StoreTypes';
import { formatTimeToISO } from '../Utils/FormatDate';

export const fetchStoreInfo = async (companyId: string): Promise<CompanyInfoResponse> => {
  try {
    const response = await apiClient.get<CompanyInfoResponse>('/company-info', {
      params: { company_id: parseInt(companyId) },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStoreInfo = async (data: CompanyInfoEditRequest): Promise<void> => {
  try {
    // Ensure times are in HH:MM:SS format before sending to backend
    const formattedData = {
      ...data,
      company_info: {
        ...data.company_info,
        open_time: formatTimeToISO(data.company_info.open_time),
        close_time: formatTimeToISO(data.company_info.close_time)
      }
    };
    
    await apiClient.post('/company-info-edit', formattedData);
  } catch (error) {
    throw error;
  }
};