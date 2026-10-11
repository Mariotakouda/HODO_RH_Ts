// src/modules/announcements/model.ts

export interface Announcement {
  data: Announcement;
  id: number;
  user_id: number;
  employee_id?: number | null;
  department_id?: number | null;
  is_general?: boolean;
  title: string;
  message: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  department?: {
    id: number;
    name: string;
  };
}

export interface CreateAnnouncementForm {
  title: string;
  message: string;
  employee_id?: number | null;
  department_id?: number | null;
  is_general?: boolean;
}