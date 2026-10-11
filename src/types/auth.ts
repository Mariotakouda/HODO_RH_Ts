/** Rôle stocké sur `users.role` côté backend (voir App\Enums\UserRole). */
export type Role = "admin" | "manager" | "employee";

export interface Department {
  id: number;
  name: string;
}

export interface EmployeeRoleRef {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo_url?: string | null;
  phone?: string | null;
  contract_type?: string | null;
  hire_date?: string | null;
  salary_base?: number | null;
  department_id?: number | null;
  department?: Department | null;
  roles?: EmployeeRoleRef[];
  status?: "actif" | "demission" | "renvoyer" | "retraite";
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  employee?: Employee;
  needs_password_change: boolean;
}
