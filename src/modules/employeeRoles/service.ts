// src/modules/employee_roles/service.ts

import type { EmployeeRole } from "./model";


const API_URL = "http://127.0.0.1:8000/api/employee_roles";

export async function fetchEmployeeRoles(search = "", page = 1) {
  const res = await fetch(`${API_URL}?search=${search}&page=${page}`);
  if (!res.ok) throw new Error("Erreur lors du chargement des rôles");
  return res.json();
}

export async function getEmployeeRole(id: number): Promise<EmployeeRole> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Rôle introuvable");
  return res.json();
}

export async function createEmployeeRole(data: Partial<EmployeeRole>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la création");
  return res.json();
}

export async function updateEmployeeRole(id: number, data: Partial<EmployeeRole>) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la modification");
  return res.json();
}

export async function deleteEmployeeRole(id: number) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
  return true;
}
