import { api } from "../../api/axios";
import type { Department, Employee, Manager, ManagerFormData } from "./model";

// --- Types de réponse API ---

interface PaginatedResponse {
    current_page: number;
    data: Manager[];
    total: number;
    last_page: number;
    per_page: number;
}

interface DependenciesResponse {
    employees: Employee[];
    departments: Department[];
}

// --- Fonctions de chargement des dépendances (pour create.tsx et edit.tsx) ---

export const fetchEmployeesAndDepartments = async (): Promise<DependenciesResponse> => {
    const [employeesRes, departmentsRes] = await Promise.all([
        api.get("/employees?per_page=999"), 
        api.get("/departments?per_page=999"), 
    ]);

    return {
        employees: employeesRes.data.data || [],
        departments: departmentsRes.data.data || [],
    };
};

// --- CRUD Managers ---

export const fetchManagers = async (page: number = 1, search: string = ""): Promise<PaginatedResponse> => {
    const response = await api.get(`/managers?page=${page}&search=${search}`);
    const responseData = response.data || {};

    return {
        current_page: responseData.current_page || 1,
        data: responseData.data || [],
        total: responseData.total || 0,
        last_page: responseData.last_page || 1,
        per_page: responseData.per_page || 15,
    };
};

// 🎯 CORRECTION : Gérer les deux formats de réponse possibles
export const getManager = async (id: string): Promise<Manager> => {
    const response = await api.get(`/managers/${id}`);
    console.log("📥 Réponse getManager:", response.data);
    
    // Si l'API retourne { data: {...} }
    if (response.data.data) {
        return response.data.data;
    }
    
    // Si l'API retourne directement l'objet manager
    return response.data;
};

export const createManager = async (data: ManagerFormData): Promise<Manager> => {
    const response = await api.post("/managers", data);
    return response.data.data || response.data;
};

export const updateManager = async (id: number, data: ManagerFormData): Promise<Manager> => {
    const response = await api.put(`/managers/${id}`, data);
    return response.data.data || response.data;
};

export const deleteManager = async (id: number): Promise<void> => {
    await api.delete(`/managers/${id}`);
};