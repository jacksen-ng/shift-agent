import axios from 'axios';

export const fetchDecisionShift = async (company_id: string): Promise<{
  shifts: any[];
  rest_day: string[];
}> => {
  const response = await axios.get('http://localhost:8000/decision-shift', {
    params: { company_id },
    headers: { Authorization: 'Bearer dummy_token' },
  });

  return response.data as {
    shifts: any[];
    rest_day: string[];
  };
};