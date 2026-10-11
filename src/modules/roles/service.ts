import { api } from "../../api/axios";
import type { Role, LaravelPaginationResponse, RolePayload } from "./model";

export const RoleService = {
  /**
   * Récupère la liste paginée des rôles avec recherche.
   */
  async list(page: number = 1, search: string = ''): Promise<LaravelPaginationResponse<Role>> {
    const response = await api.get("/roles", {
      params: { page, search }
    });
    return response.data;
  },

  /**
   * Récupère les détails d'un rôle.
   */
  async get(id: number): Promise<Role> {
    const response = await api.get(`/roles/${id}`);
    return response.data; 
  },

  /**
   * Crée un nouveau rôle.
   */
  async create(payload: RolePayload): Promise<Role> {
    const response = await api.post("/roles", payload);
    return response.data;
  },

  /**
   * Met à jour un rôle existant.
   */
  async update(id: number, payload: RolePayload): Promise<Role> {
    const response = await api.put(`/roles/${id}`, payload);
    return response.data;
  },

  /**
   * Supprime un rôle.
   */
  async remove(id: number): Promise<void> {
    await api.delete(`/roles/${id}`); 
  },
};