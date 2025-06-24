import apiClient from './apiClient';

export const fetchStoreInfo = async (companyId: string, _token: string) => {
  try {
    const response = await apiClient.get('/company-info', {
      params: { company_id: companyId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};