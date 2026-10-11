export interface Employee {
    id: number;
    first_name: string;
    last_name: string | null;
    email: string;
    phone: string | null;
    profile_photo_url: string | null;
    contract_type: string | null;
    hire_date: string | null;
    salary_base: number | null;
    department_id: number | null;
    status: 'actif' | 'demission' | 'renvoyer' | 'retraite';
    archived_at?: string | null;
    departure_date?: string | null;
    departure_reason?: string | null;
    department?: { 
        id: number; 
        name: string 
    };
    roles?: { 
        id: number; 
        name: string 
    }[];
}

export interface EmployeeFormData {
    first_name: string;
    last_name: string | null;
    email: string;
    phone: string | null;
    profile_photo?: File | null; 
    contract_type: string | null;
    hire_date: string | null;
    salary_base?: number | null;
    department_id?: number | null;
    role_ids?: number[]; 
    status: string;
}

// ===== Affectation, archives, dossier =====

export interface CreateEmployeeResponse {
    message: string;
    invitation_sent: boolean;
    employee: Employee;
}

export interface TransferPayload {
    department_id: number;
    reason?: string;
    effective_date?: string;
}

export type DepartureStatus = 'demission' | 'renvoyer' | 'retraite';

export interface ArchivePayload {
    status: DepartureStatus;
    departure_date: string;
    departure_reason?: string;
}

export interface EmployeeDocument {
    id: number;
    type: string;
    title: string;
    original_name: string;
    mime_type: string | null;
    size: number;
    created_at: string;
    uploader?: { id: number; name: string } | null;
}

export interface DepartmentHistoryEntry {
    id: number;
    effective_date: string;
    reason: string | null;
    from_department?: { id: number; name: string } | null;
    to_department?: { id: number; name: string } | null;
    transferred_by?: { id: number; name: string } | null;
}

export interface PresenceLogLite {
    id: number;
    action: string;
    outcome: string;
    reason: string | null;
    ip_address: string | null;
    occurred_at: string;
}

export interface EmployeeFile {
    employee: Employee;
    account: { has_account: boolean; pending_activation: boolean; is_manager: boolean };
    documents: EmployeeDocument[];
    department_history: DepartmentHistoryEntry[];
    stats: {
        tasks: Record<string, number>;
        leaves: Record<string, number>;
        presences_30d: { days_present: number; days_late: number; days_absent: number; total_hours: number };
    };
    recent_presence_logs: PresenceLogLite[];
}
