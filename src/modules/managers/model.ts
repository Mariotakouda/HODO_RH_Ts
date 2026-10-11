// Définitions de base
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Department {
  id: number;
  name: string;
}

// Modèle principal Manager
export interface Manager {
  id: number;
  employee_id: number;
  department_id: number | null;
  // Relations incluses par votre API Laravel
  employee: Employee;
  department: Department | null;
  created_at: string;
  updated_at: string;
}

// Formulaire pour la création et la modification
export interface ManagerFormData {
  employee_id: number | null;
  department_id: number | null;
}