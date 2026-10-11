// src/modules/employee_roles/show.tsx

import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEmployeeRole } from "./service";
import type { EmployeeRole } from "./model";

export default function EmployeeRoleShow() {
  const { id } = useParams();
  const [role, setRole] = useState<EmployeeRole | null>(null);

  const loadRole = useCallback(async () => {
    if (!id) return;
    const employeeRole = await getEmployeeRole(Number(id));
    setRole(employeeRole);
  }, [id]);

  useEffect(() => {
    loadRole();
  }, [loadRole]);

  if (!role) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Détails du rôle #{id}</h1>
      <p><b>ID Employé :</b> {role.employee_id}</p>
      <p><b>ID Rôle :</b> {role.role_id}</p>
      <Link to="/admin/employee_roles">Retour</Link>
    </div>
  );
}
