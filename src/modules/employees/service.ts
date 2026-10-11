import { api } from "../../lib/api/client";
import {
  type ArchivePayload,
  type CreateEmployeeResponse,
  type Employee,
  type EmployeeDocument,
  type EmployeeFile,
  type EmployeeFormData,
  type TransferPayload,
} from "./model";

export const EmployeeService = {
  async list(): Promise<Employee[]> {
    const res = await api.get<{ data: Employee[] } | Employee[]>("/employees");
    return Array.isArray(res.data) ? res.data : res.data.data;
  },

  async get(id: number) {
    const res = await api.get<Employee>(`/employees/${id}`);
    return res.data;
  },

  async create(data: EmployeeFormData) {
    const res = await api.post<CreateEmployeeResponse>("/employees", data);
    return res.data;
  },

  async update(id: number, data: Partial<EmployeeFormData>) {
    const res = await api.put<Employee>(`/employees/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`/employees/${id}`);
  },

  // ----- Affectation, archives, invitation -----

  async transfer(id: number, payload: TransferPayload) {
    const res = await api.post<{ message: string; employee: Employee }>(`/employees/${id}/transfer`, payload);
    return res.data;
  },

  async archive(id: number, payload: ArchivePayload) {
    const res = await api.post<{ message: string; employee: Employee }>(`/employees/${id}/archive`, payload);
    return res.data;
  },

  async restore(id: number) {
    const res = await api.post<{ message: string; employee: Employee }>(`/employees/${id}/restore`);
    return res.data;
  },

  async listArchived(): Promise<Employee[]> {
    const res = await api.get<{ data: Employee[] }>("/archives/employees");
    return res.data.data;
  },

  async resendInvitation(id: number) {
    const res = await api.post<{ message: string; invitation_sent: boolean }>(`/employees/${id}/resend-invitation`);
    return res.data;
  },

  // ----- Dossier employé -----

  async getFile(id: number): Promise<EmployeeFile> {
    const res = await api.get<EmployeeFile>(`/employees/${id}/file`);
    return res.data;
  },

  async uploadDocument(id: number, data: { file: File; type: string; title?: string }) {
    const form = new FormData();
    form.append("file", data.file);
    form.append("type", data.type);
    if (data.title) form.append("title", data.title);
    const res = await api.post<{ message: string; document: EmployeeDocument }>(`/employees/${id}/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async deleteDocument(id: number, documentId: number) {
    await api.delete(`/employees/${id}/documents/${documentId}`);
  },

  /** Les pièces sont privées : téléchargement authentifié puis enregistrement du blob. */
  async downloadDocument(id: number, doc: EmployeeDocument) {
    const res = await api.get<Blob>(`/employees/${id}/documents/${doc.id}/download`, { responseType: "blob" });
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.original_name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async fetchAllForSelect(): Promise<Employee[]> {
    return this.list();
  },
};
