// src/modules/employee_roles/list.tsx

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEmployeeRoles, deleteEmployeeRole } from "./service";
import type { EmployeeRole } from "./model";

export default function EmployeeRoleList() {
  const [roles, setRoles] = useState<EmployeeRole[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const load = useCallback(async () => {
    const data = await fetchEmployeeRoles(search, page);
    setRoles(data.data);
    setMeta(data.meta);
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: number) {
    if (confirm("Supprimer ce rôle d'employé ?")) {
      await deleteEmployeeRole(id);
      load();
    }
  }

  return (
    <div>
      <h1>Rôles des employés</h1>

      <div>
        <input
          placeholder="Recherche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="create">Ajouter</Link>
      </div>

      <table border={1} width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>ID Employé</th>
            <th>ID Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.employee_id}</td>
              <td>{r.role_id}</td>
              <td>
                <Link to={`${r.id}`}>Voir</Link> |
                <Link to={`${r.id}/edit`}>Modifier</Link> |
                <button onClick={() => handleDelete(r.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {meta && (
        <div>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</button>
          <span> Page {meta.current_page} / {meta.last_page} </span>
          <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>Suivant</button>
        </div>
      )}
    </div>
  );
}
