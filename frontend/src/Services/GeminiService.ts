import apiClient from './apiClient';

// Request types
interface GeminiCreateShiftRequest {
  company_id: number;
  first_day: string; // ISO date format YYYY-MM-DD
  last_day: string;  // ISO date format YYYY-MM-DD
  comment?: string;
}

interface GeminiEvaluateShiftRequest {
  company_id: number;
  first_day: string; // ISO date format YYYY-MM-DD
  last_day: string;  // ISO date format YYYY-MM-DD
}

// Response types
interface EditShiftItem {
  edit_shift_id: number;
  user_id: number;
  company_id: number;
  day: string;
  start_time: string;
  finish_time: string;
}

interface GeminiCreateShiftResponse {
  edit_shift: EditShiftItem[];
}

interface CompanyInfo {
  company_id: number;
  company_name: string;
  store_locate: string;
  open_time: string;
  close_time: string;
  target_sales: number;
  labor_cost: number;
}

interface CompanyMember {
  user_id: number;
  name: string;
  age: number;
  phone: string;
  position: string;
  evaluate: number;
  experience: string;
  hour_pay: number;
  post: string;
}

interface DecisionShiftItem {
  decision_shift_id: number;
  user_id: number;
  company_id: number;
  day: string;
  start_time: string;
  finish_time: string;
}

interface EvaluateDecisionShiftItem {
  company_id: number;
  decision_shift: DecisionShiftItem[];
}

interface GeminiEvaluateShiftResponse {
  company_info: CompanyInfo;
  company_member: CompanyMember[];
  evaluate_decision_shift: EvaluateDecisionShiftItem[];
  edit_shift_id: number[];
  comment: string;
}

// Service functions
export const createGeminiShift = async (request: GeminiCreateShiftRequest): Promise<GeminiCreateShiftResponse> => {
  try {
    const response = await apiClient.post<GeminiCreateShiftResponse>('/gemini-create-shift', request);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const evaluateGeminiShift = async (request: GeminiEvaluateShiftRequest): Promise<GeminiEvaluateShiftResponse> => {
  try {
    const response = await apiClient.post<GeminiEvaluateShiftResponse>('/gemini-evaluate-shift', request);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export types for use in components
export type {
  GeminiCreateShiftRequest,
  GeminiEvaluateShiftRequest,
  GeminiCreateShiftResponse,
  GeminiEvaluateShiftResponse,
  EditShiftItem,
  CompanyInfo,
  CompanyMember,
  DecisionShiftItem,
  EvaluateDecisionShiftItem
};