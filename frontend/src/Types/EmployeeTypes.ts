// Employee/Crew related types

export type Experience = 'beginner' | 'veteran';
export type Post = 'part_timer' | 'employee';
export type Evaluate = 1 | 2 | 3 | 4 | 5;

export interface UserProfile {
  user_profile_id?: number;
  user_id: number;
  company_id: number;
  name: string;
  age: number;
  phone: string;
  position: string;
  evaluate: Evaluate;
  experience: Experience;
  hour_pay: number;
  post: Post;
}

export interface CrewInfoResponse {
  company_member: Array<{
    user_id: number;
    name: string;
    age: number;
    phone: string;
    position: string;
    evaluate: number;
    join_company_day: string; // Date format YYYY-MM-DD
    hour_pay: number;
    post: string;
  }>;
}

export interface CrewInfoEditRequest {
  user_id: number;
  name: string;
  age: number;
  phone: string;
  position: string;
  evaluate: Evaluate;
  experience: Experience;
  hour_pay: number;
  post: Post;
}