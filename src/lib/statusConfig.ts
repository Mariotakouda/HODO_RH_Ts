import type { StatusConfig } from "../components/ui/StatusBadge";

// Les clés et libellés ci-dessous correspondent exactement aux enums PHP
// du backend (app/Enums/*.php) — à garder synchronisé si un enum change.

export const EMPLOYEE_STATUS_CONFIG: Record<string, StatusConfig> = {
  actif: { label: "Actif", tone: "success" },
  demission: { label: "Démission", tone: "warning" },
  renvoyer: { label: "Renvoyé", tone: "danger" },
  retraite: { label: "Retraite", tone: "info" },
};

export const TASK_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: { label: "En attente", tone: "secondary" },
  in_progress: { label: "En cours", tone: "primary" },
  completed: { label: "Terminée", tone: "success" },
  cancelled: { label: "Annulée", tone: "danger" },
};

export const LEAVE_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: { label: "En attente", tone: "warning" },
  approved: { label: "Approuvée", tone: "success" },
  rejected: { label: "Rejetée", tone: "danger" },
};

export const PRESENCE_STATUS_CONFIG: Record<string, StatusConfig> = {
  present: { label: "Présent", tone: "success" },
  late: { label: "En retard", tone: "warning" },
  absent: { label: "Absent", tone: "danger" },
};