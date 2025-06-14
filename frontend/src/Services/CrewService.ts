// Services/CrewService.ts
import axios from 'axios';

export const fetchCrewInfo = async (company_id: string, token: string) => {
  const response = await axios.get('http://localhost:8000/crew-info', {
    params: { company_id },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};