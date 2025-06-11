import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // FastAPIモックのURL

export const fetchStoreInfo = async (companyId: string, token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/company-info`, {
      params: { company_id: companyId },
      headers: {
        Authorization: `Bearer ${token}`, // トークン付きでリクエスト
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};