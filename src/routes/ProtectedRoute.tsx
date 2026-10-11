import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Zone = "self" | "team" | "admin";

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Zone d'accès requise — reflète exactement les 3 niveaux du backend :
   *  - "self"  : auth:sanctum seul (tout utilisateur connecté)
   *  - "team"  : middleware 'manager' (manager OU admin)
   *  - "admin" : middleware 'admin' (admin uniquement)
   */
  zone: Zone;
}

export default function ProtectedRoute({ children, zone }: ProtectedRouteProps) {
  const { user, isAdmin, isManager, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (zone === "admin" && !isAdmin) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (zone === "team" && !isManager) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return <>{children}</>;
}
