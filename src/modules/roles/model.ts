// src/modules/roles/model.ts

export interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  employees_count?: number; // Champ ajouté par loadCount
}

// Interface de réponse pour la pagination native de Laravel (DOIT CORRESPONDRE)
export interface LaravelPaginationResponse<T> {
  current_page: number;
  data: T[]; 
  last_page: number;
  per_page: number;
  total: number; 
  
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  from: number | null;
  to: number | null;
  path: string;
}

export interface RolePayload {
  name: string;
}