export interface EmployeeNameOnly {
    id: number;
    first_name: string;
    last_name?: string | null;
}

export interface LeaveRequest {
    id: number;
    employee_id: number;
    type: 'vacances' | 'maladie' | 'impayé' | 'autres';
    start_date: string;
    end_date: string;
    status: 'pending' | 'approved' | 'rejected';
    message?: string | null;       // Message de l'employé
    admin_comment?: string | null; // ✅ AJOUTÉ : Commentaire de l'admin
    
    employee?: EmployeeNameOnly;
    created_at?: string; 
    updated_at?: string;
}

export interface CreateLeaveRequest {
  employee_id: number;
  type: string;
  start_date: string;
  end_date: string;
  message?: string | null;
}

export interface UpdateLeaveRequest {
  employee_id?: number;
  type?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  admin_comment?: string | null;
  message?: string | null;
}