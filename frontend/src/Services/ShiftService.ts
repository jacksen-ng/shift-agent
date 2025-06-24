import apiClient from './apiClient';

interface DecisionShiftItem {
  name: string;
  position: string;
  post: string;
  day: string;
  start_time: string;
  finish_time: string;
}

interface DecisionShiftResponse {
  decision_shift: DecisionShiftItem[];
  rest_day: string[];
}

export const fetchDecisionShift = async (company_id: string): Promise<DecisionShiftResponse> => {
  const response = await apiClient.get<DecisionShiftResponse>('/decision-shift', {
    params: { company_id: parseInt(company_id) },
  });

  return response.data;
};