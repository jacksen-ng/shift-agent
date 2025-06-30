// Shift related types

export interface SubmittedShift {
  submitted_shift_id?: number;
  user_id: number;
  company_id: number;
  day: string; // Date format YYYY-MM-DD
  start_time: string; // Time format HH:MM:SS
  finish_time: string; // Time format HH:MM:SS
}

export interface EditShift {
  edit_shift_id?: number;
  user_id: number;
  company_id: number;
  day: string; // Date format YYYY-MM-DD
  start_time: string; // Time format HH:MM:SS
  finish_time: string; // Time format HH:MM:SS
}

export interface DecisionShift {
  decision_shift_id?: number;
  user_id: number;
  company_id: number;
  day: string; // Date format YYYY-MM-DD
  start_time: string; // Time format HH:MM:SS
  finish_time: string; // Time format HH:MM:SS
}

export interface SubmittedShiftRequest {
  company_id: number;
  shift_data: Array<{
    day: string;
    start_time: string;
    finish_time: string;
  }>;
}

export interface EditShiftRequest {
  company_id: number;
  updated_shifts: EditShift[];
  added_shifts: EditShift[];
  deleted_shifts: number[]; // edit_shift_id array
}

export interface CompleteEditShiftRequest {
  company_id: number;
}

export interface DecisionShiftResponse {
  decision_shift: Array<{
    name: string;
    position: string;
    post: string;
    day: string;
    start_time: string;
    finish_time: string;
  }>;
  rest_day: string[];
}

export interface AdjustmentShiftResponse {
  company_member: Array<{
    user_id: number;
    name: string;
    position: string;
    evaluate: number;
    hour_pay: number;
    post: string;
  }>;
  edit_shift: EditShift[];
}