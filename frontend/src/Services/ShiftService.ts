import apiClient from './apiClient';
import { formatTimeToISO } from '../Utils/FormatDate';

interface DecisionShiftItem {
  name: string;
  position: string;
  post: string;
  day: string; // ISO date format YYYY-MM-DD
  start_time: string; // ISO time format HH:MM:SS
  finish_time: string; // ISO time format HH:MM:SS
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

// Fetch adjustment shifts for owner
export const fetchAdjustmentShift = async (company_id: string) => {
  const response = await apiClient.get('/edit-shift', {
    params: { company_id: parseInt(company_id) },
  });
  return response.data;
};

// Update/Edit shifts for owner
export const updateEditShift = async (data: {
  company_id: number;
  updated_shifts: any[];
  added_shifts: any[];
  deleted_shifts: number[];
}) => {
  // Ensure all times are in HH:MM:SS format before sending to backend
  const formattedData = {
    ...data,
    updated_shifts: data.updated_shifts.map(shift => ({
      ...shift,
      start_time: formatTimeToISO(shift.start_time),
      finish_time: formatTimeToISO(shift.finish_time)
    })),
    added_shifts: data.added_shifts.map(shift => ({
      ...shift,
      start_time: formatTimeToISO(shift.start_time),
      finish_time: formatTimeToISO(shift.finish_time)
    }))
  };
  
  const response = await apiClient.post('/edit-shift', formattedData);
  return response.data;
};

// Confirm final shifts for owner
export const confirmEditShift = async (company_id: number) => {
  const response = await apiClient.post('/complete_edit_sift', { company_id });
  return response.data;
};

// Submit shift requests for crew
export const submitShift = async (data: {
  company_member_info: {
    user_id: number;
    company_id: number;
  };
  submit_shift: Array<{
    day: string; // YYYY-MM-DD
    start_time: string; // HH:MM:SS
    finish_time: string; // HH:MM:SS
  }>;
}) => {
  // Ensure all times are in HH:MM:SS format before sending to backend
  const formattedData = {
    ...data,
    submit_shift: data.submit_shift.map(shift => ({
      ...shift,
      start_time: formatTimeToISO(shift.start_time),
      finish_time: formatTimeToISO(shift.finish_time)
    }))
  };
  
  const response = await apiClient.post('/submitted-shift', formattedData);
  return response.data;
};