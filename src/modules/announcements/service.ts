// src/modules/announcements/service.ts
import { api } from "../../api/axios";
import type { Announcement } from "./model";

export interface ManagerStatus {
  is_manager: boolean;
  is_admin: boolean;
  department_id: number | null;
  department_name?: string;
  debug?: {
    user_role: string;
    has_employee_profile: boolean;
    employee_id: number | null;
    roles: string[];
  };
}

/**
 * ✅ Vérifier si l'utilisateur est un manager
 * Cette fonction est appelée par EmployeeLayout pour afficher les boutons manager
 */
export const checkManagerStatus = async (): Promise<ManagerStatus> => {
  try {
    const response = await api.get("/check-manager-status");
    
    console.log("🔍 checkManagerStatus - Réponse brute:", response.data);
    
    // Vérifier la structure de la réponse
    if (!response.data) {
      console.error("❌ Réponse vide de checkManagerStatus");
      return {
        is_manager: false,
        is_admin: false,
        department_id: null
      };
    }
    
    const status = response.data;
    
    console.log("✅ Statut manager final:", {
      is_manager: status.is_manager,
      is_admin: status.is_admin,
      department_id: status.department_id,
      department_name: status.department_name,
      debug: status.debug
    });
    
    return status;
  } catch (error: any) {
    console.error("❌ Erreur checkManagerStatus:", error);
    console.error("Détails:", error.response?.data);
    
    // Retourner un statut par défaut en cas d'erreur
    return {
      is_manager: false,
      is_admin: false,
      department_id: null
    };
  }
};

// Récupérer toutes les annonces (filtrées selon le rôle de l'utilisateur)
export const fetchAnnouncements = async (search: string = "", page: number = 1) => {
  const response = await api.get("/announcements", {
    params: { search, page }
  });
  return response.data;
};

// ✅ Pour les employés - annonces qui les concernent
export const fetchMyAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const response = await api.get("/me/announcements");
    return response.data.data || response.data || [];
  } catch (error: any) {
    console.error("❌ Erreur fetchMyAnnouncements:", error);
    return [];
  }
};

export interface CreateAnnouncementData {
  title: string;
  message: string;
  department_id?: number | null;
  is_general?: boolean;
}

// Créer une annonce
export const createAnnouncement = async (data: CreateAnnouncementData): Promise<Announcement> => {
  const payload = {
    ...data,
    is_general: data.department_id === null
  };
  const response = await api.post("/announcements", payload);
  return response.data;
};

// Modifier une annonce
export const updateAnnouncement = async (
  id: number,
  data: Partial<Announcement>
): Promise<Announcement> => {
  const response = await api.put(`/announcements/${id}`, data);
  return response.data;
};

// Supprimer une annonce
export const deleteAnnouncement = async (id: number): Promise<void> => {
  await api.delete(`/announcements/${id}`);
};

// Voir une annonce spécifique
export const getAnnouncement = async (id: number): Promise<Announcement> => {
  const response = await api.get(`/announcements/${id}`);
  return response.data;
};