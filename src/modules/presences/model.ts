// src/modules/presences/model.ts

export interface Presence {
  id: number;
  employee_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}
