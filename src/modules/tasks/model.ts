export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  due_date: string | null;
  employee_id: number | null;
  creator_id: number;
  task_file: string | null;
  report_file: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    department?: {
      id: number;
      name: string;
    };
  };
  
  creator?: {
    id: number;
    name: string;
    role: "admin" | "manager" | "employee";
  };
}

export interface TaskForm {
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  employee_id?: number | string | null;
  task_file?: File | null;
}