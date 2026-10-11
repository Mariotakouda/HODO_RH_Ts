import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { errorMessage } from "../../lib/api/errors";
import { fetchPresenceLogs } from "../presences/service";
import type { PaginatedPresenceLogs } from "../presences/service";

const ACTIONS: Record<string, string> = {
  check_in: "Arrivée",
  check_out: "Sortie",
  deleted: "Suppression",
};

const REASONS: Record<string, string> = {
  already_checked_in: "Arrivée déjà enregistrée",
  already_completed: "Journée déjà pointée",
  already_checked_out: "Sortie déjà enregistrée",
  not_owner: "Tentative sur le pointage d'un autre employé",
  no_check_in: "Aucune arrivée enregistrée",
  employee_archived: "Compte archivé",
  deleted_by_staff: "Supprimé par l'équipe RH",
};

const STATUS_META: Record<string, string> = {
  present: "À l'heure",
  late: "En retard",
};

export default function PresenceLogsPage() {
  const [result, setResult] = useState<PaginatedPresenceLogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ date: "", action: "", outcome: "" });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setResult(await fetchPresenceLogs({ ...filters, page }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (patch: Partial<typeof filters>) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  };

  const rows = result?.data ?? [];

  return (
    <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
      <Link to="/admin/presences" className="text-decoration-none text-muted d-inline-block mb-3">← Retour aux présences</Link>
      <h1 className="h3 fw-bold mb-1">Journal des pointages</h1>
      <p className="text-muted">Chaque tentative d'arrivée ou de sortie (réussie ou refusée) avec son auteur et son adresse IP.</p>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-3">
          <input type="date" className="form-control" value={filters.date} onChange={(e) => update({ date: e.target.value })} />
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={filters.action} onChange={(e) => update({ action: e.target.value })}>
            <option value="">Toutes les actions</option>
            <option value="check_in">Arrivées</option>
            <option value="check_out">Sorties</option>
            <option value="deleted">Suppressions</option>
          </select>
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={filters.outcome} onChange={(e) => update({ outcome: e.target.value })}>
            <option value="">Tous les résultats</option>
            <option value="success">Réussis</option>
            <option value="rejected">Refusés</option>
          </select>
        </div>
        <div className="col-12 col-md-3 d-grid">
          <button className="btn btn-outline-secondary" onClick={() => { setPage(1); setFilters({ date: "", action: "", outcome: "" }); }}>
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0">
          {loading ? (
            <p className="text-center text-muted py-5 mb-0">Chargement…</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-muted py-5 mb-0">Aucune entrée pour ces critères.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Date et heure</th><th>Employé</th><th>Action</th><th>Résultat</th><th>Détail</th><th>Auteur</th><th>IP</th></tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id}>
                      <td className="text-nowrap">{new Date(l.occurred_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "medium" })}</td>
                      <td className="fw-semibold">{l.employee ? `${l.employee.first_name} ${l.employee.last_name}` : `#${l.employee_id}`}</td>
                      <td>{ACTIONS[l.action] ?? l.action}</td>
                      <td>
                        <span className={`badge ${l.outcome === "success" ? "bg-success-subtle text-success-emphasis" : "bg-danger-subtle text-danger-emphasis"}`}>
                          {l.outcome === "success" ? "Réussi" : "Refusé"}
                        </span>
                      </td>
                      <td className="small">
                        {l.reason ? REASONS[l.reason] ?? l.reason : l.meta?.status ? STATUS_META[String(l.meta.status)] ?? String(l.meta.status) : "—"}
                        {l.meta?.total_hours != null && <span className="text-muted"> · {String(l.meta.total_hours)} h</span>}
                      </td>
                      <td className="small">{l.user?.name ?? "—"}</td>
                      <td className="text-muted small">{l.ip_address ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {result && result.last_page > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
          <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</button>
          <span className="text-muted small">Page {result.current_page} / {result.last_page}</span>
          <button className="btn btn-outline-secondary btn-sm" disabled={page >= result.last_page} onClick={() => setPage(page + 1)}>Suivant</button>
        </div>
      )}
    </div>
  );
}
