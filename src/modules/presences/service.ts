import { api } from "../../api/axios";

export interface EmployeePresence {
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | null;
  status: string;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
}

/**
 * NOUVEAU : Exporter les présences en CSV
 */
export async function exportPresences(): Promise<void> {
  try {
    const response = await api.get("/presences/export", { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_presences_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur export:", error);
    throw error;
  }
}

export async function getAllPresences(filters?: { date?: string; month?: string }): Promise<any> {
  const response = await api.get("/presences", { params: filters });
  return response.data;
}

export async function getMyPresences(): Promise<EmployeePresence[]> {
  const response = await api.get("/me/presences");
  const data = response.data.data || response.data;
  return Array.isArray(data) ? data : [];
}

export async function hasActiveCheckIn(): Promise<{ active: boolean; presence?: EmployeePresence }> {
  try {
    const presences = await getMyPresences();
    const active = presences.find(p => isToday(p.date) && !!p.check_in && !p.check_out);
    return { active: !!active, presence: active };
  } catch (error) { return { active: false }; }
}

/** L'API renvoie la date au format ISO complet (2026-10-08T00:00:00Z) : on compare uniquement le jour. */
export function isToday(date: string): boolean {
  const now = new Date();
  const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return date.slice(0, 10) === local;
}

export async function checkIn(): Promise<EmployeePresence> {
  const response = await api.post("/presences/check-in");
  return response.data;
}

export async function checkOut(presenceId: number): Promise<EmployeePresence> {
  const response = await api.put(`/presences/${presenceId}/check-out`);
  return response.data;
}

export function getPresenceStats(presences: EmployeePresence[]) {
  const now = new Date();
  const monthly = presences.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status !== 'absent';
  });
  const total = monthly.reduce((sum, p) => sum + (Number(p.total_hours) || 0), 0);
  return {
    totalHours: total.toFixed(2),
    daysPresent: monthly.length,
    averageHours: (monthly.length > 0 ? total / monthly.length : 0).toFixed(2)
  };
}

// ===== Journal des pointages (admin / manager) =====

export interface PresenceLogEntry {
  id: number;
  employee_id: number;
  action: string;
  outcome: string;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  occurred_at: string;
  meta: Record<string, unknown> | null;
  employee?: { id: number; first_name: string; last_name: string } | null;
  user?: { id: number; name: string; role: string } | null;
}

export interface PaginatedPresenceLogs {
  data: PresenceLogEntry[];
  current_page: number;
  last_page: number;
  total: number;
}

export async function fetchPresenceLogs(params: {
  date?: string;
  action?: string;
  outcome?: string;
  employee_id?: number;
  page?: number;
}): Promise<PaginatedPresenceLogs> {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined));
  const response = await api.get("/presences/logs", { params: clean });
  return response.data;
}

// ===== Export PDF de la fiche de présence =====

export interface PresenceExportRow {
  employee: string;
  department: string | null;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | null;
  status: string;
}

export interface PresenceExportData {
  rows: PresenceExportRow[];
  truncated: boolean;
  generated_at: string;
  generated_by: string;
  period: { from: string | null; to: string | null };
}

export async function fetchExportData(from?: string, to?: string): Promise<PresenceExportData> {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const response = await api.get("/presences/export-data", { params });
  return response.data;
}
