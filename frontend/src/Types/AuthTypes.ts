// Authentication related types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: number;
  company_id: number;
  role: 'owner' | 'crew';
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  role: 'owner' | 'crew';
}

export interface RegisterResponse {
  message: string;
}

export interface User {
  user_id: number;
  company_id: number;
  email: string;
  firebase_uid?: string;
  role: 'owner' | 'crew';
}