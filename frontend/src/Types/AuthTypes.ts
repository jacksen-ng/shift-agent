// Authentication related types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: number;
  company_id: number;
  role: 'owner' | 'crew';
  firebase_uid: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  role: 'owner' | 'crew';
  company_id?: string;
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