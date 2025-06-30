// Authentication related types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  firebase_uid: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
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
  success: boolean;
  firebase_uid: string;
  email: string;
}

export interface User {
  user_id: number;
  company_id: number;
  email: string;
  firebase_uid: string; // firebase_uidを必須に変更
  role: 'owner' | 'crew';
}