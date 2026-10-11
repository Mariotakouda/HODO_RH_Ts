import { api } from "../../api/axios";

export class TaskService {
  /**
   * ✅ Liste toutes les tâches avec pagination
   * Retourne automatiquement les tâches filtrées selon le rôle (backend gère ça)
   */
  static async list(page: number = 1) {
    const res = await api.get(`/tasks?page=${page}`);
    return res.data; // Laravel paginate renvoie { data, meta, links }
  }

  /**
   * ✅ Récupère une seule tâche
   */
  static async show(id: number) {
    const res = await api.get(`/tasks/${id}`);
    return res.data.data || res.data;
  }

  /**
   * ✅ Création avec fichier
   */
  static async create(data: any) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    const res = await api.post("/tasks", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    
    return res.data;
  }

  /**
   * ✅ Mise à jour (avec support fichiers sous Laravel)
   */
  static async update(id: number, data: any) {
    const formData = new FormData();
    formData.append("_method", "PUT"); // Laravel multipart workaround
    
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    const res = await api.post(`/tasks/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    
    return res.data;
  }

  /**
   * ✅ Suppression (admin uniquement)
   */
  static async remove(id: number) {
    return await api.delete(`/tasks/${id}`);
  }

  /**
   * ✅ Soumission de rapport par l'employé
   */
  static async submitReport(id: number, file: File) {
    const formData = new FormData();
    formData.append('report_file', file);
    
    const res = await api.post(`/tasks/${id}/submit-report`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    
    return res.data;
  }
}