import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { errorMessage } from "../../lib/api/errors";
import { EmployeeService } from "./service";
import type { Employee } from "./model";

const REASONS: Record<string, string> = {
  demission: "Démission",
  renvoyer: "Renvoi",
  retraite: "Retraite",
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
}

export default function EmployeeArchives() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setEmployees(await EmployeeService.listArchived());
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter((e) =>
      `${e.first_name} ${e.last_name} ${e.email} ${e.department?.name ?? ""}`.toLowerCase().includes(term)
    );
  }, [employees, search]);

  const handleRestore = async (emp: Employee) => {
    if (!window.confirm(`Réactiver ${emp.first_name} ${emp.last_name} ?`)) return;
    try {
      const res = await EmployeeService.restore(emp.id);
      toast.success(res.message);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Archives des anciens employés</h1>
          <p className="text-muted mb-0">Démissions, renvois et départs en retraite — dossiers conservés.</p>
        </div>
        <input
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Rechercher (nom, email, département)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0">
          {loading ? (
            <p className="text-center text-muted py-5 mb-0">Chargement…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted py-5 mb-0">
              {employees.length === 0 ? "Aucun employé archivé pour le moment." : "Aucun résultat."}
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Employé</th>
                    <th>Département</th>
                    <th>Motif</th>
                    <th>Départ</th>
                    <th>Archivé le</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id}>
                      <td className="fw-semibold">
                        {e.first_name} {e.last_name}
                        <div className="text-muted small fw-normal">{e.email}</div>
                      </td>
                      <td>{e.department?.name ?? "—"}</td>
                      <td>
                        <span className="badge bg-secondary">{REASONS[e.status] ?? e.status}</span>
                        {e.departure_reason && <div className="text-muted small mt-1">{e.departure_reason}</div>}
                      </td>
                      <td>{formatDate(e.departure_date)}</td>
                      <td>{formatDate(e.archived_at)}</td>
                      <td className="text-end text-nowrap">
                        <Link to={`/admin/employees/${e.id}/file`} className="btn btn-sm btn-outline-primary me-2">Dossier</Link>
                        <button className="btn btn-sm btn-outline-dark" onClick={() => handleRestore(e)}>Réactiver</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
