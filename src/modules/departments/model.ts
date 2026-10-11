// src/modules/departments/model.ts

export interface Department {
  id: number;
  name: string;
  description?: string;
  manager_id?: number;
  manager?: {
    id: number;
    full_name: string;
    email: string;
  };
  employees?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentForm {
  name: string;
  description?: string;
  manager_id?: number | null;
}