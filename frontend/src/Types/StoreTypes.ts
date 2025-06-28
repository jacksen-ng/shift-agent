// Store/Company related types

export interface CompanyInfo {
  company_id: number;
  company_name: string;
  store_locate: string; // Note: API uses 'store_locate' not 'store_location'
  open_time: string; // Time format HH:MM:SS
  close_time: string; // Time format HH:MM:SS
  target_sales: number;
  labor_cost: number;
}

export interface CompanyRestDay {
  company_rest_day_id?: number;
  company_id: number;
  rest_day: string; // Date format YYYY-MM-DD
}

export interface CompanyPosition {
  company_position_id?: number;
  company_id: number;
  position_name: string;
}

export interface CompanyInfoResponse {
  company_name: string;
  store_locate: string;
  open_time: string;
  close_time: string;
  target_sales: number;
  labor_cost: number;
  rest_day: string[];
  position_name: string[];
}

export interface CompanyInfoEditRequest {
  company_info: CompanyInfo;
  rest_day: Array<{ rest_day: string }>;
  position: Array<{ position_name: string }>;
}