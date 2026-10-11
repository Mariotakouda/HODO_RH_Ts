// src/modules/employee_roles/model.ts

export interface EmployeeRole {
  id: number;
  employee_id: number;
  role_id: number;
  created_at?: string;
  updated_at?: string;
}
