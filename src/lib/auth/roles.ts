import type { Role } from "../../types/auth";

/**
 * Miroir de App\Models\User::isAdmin() / isManager() côté backend.
 * Un admin est aussi considéré comme manager (accès aux deux zones).
 */
export function isAdminRole(role?: Role): boolean {
  return role === "admin";
}

export function isManagerRole(role?: Role): boolean {
  return role === "admin" || role === "manager";
}
