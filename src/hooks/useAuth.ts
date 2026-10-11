import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { isAdminRole, isManagerRole } from "../lib/auth/roles";

/**
 * Accès centralisé à la session courante.
 * `isAdmin` / `isManager` reproduisent exactement les règles du backend
 * (un admin est aussi un manager).
 */
export function useAuth() {
  const ctx = useContext(AuthContext);

  return {
    ...ctx,
    isAdmin: isAdminRole(ctx.user?.role),
    isManager: isManagerRole(ctx.user?.role),
  };
}
