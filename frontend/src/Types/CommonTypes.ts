// Common types used across the application

export interface ApiError {
  status: number;
  detail: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export type Role = 'owner' | 'crew';

export interface DateRange {
  start_date: string; // Date format YYYY-MM-DD
  end_date: string; // Date format YYYY-MM-DD
}

export interface TimeRange {
  start_time: string; // Time format HH:MM:SS
  end_time: string; // Time format HH:MM:SS
}