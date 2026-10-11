import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api } from "../../lib/api/client";
import { errorMessage } from "../../lib/api/errors";
import { EmployeeService } from "./service";
import type { DepartureStatus, EmployeeDocument, EmployeeFile } from "./model";

type Tab = "resume" | "documents" | "history" | "activity";

const STATUS_LABELS: Record<string, string> = {
  actif: "Actif",
  demission: "Démission",
  renvoyer: "Renvoi",
  retraite: "Retraite",
};

const DOC_TYPES: Record<string, string> = {
  contrat: "Contrat",
  piece_identite: "Pièce d'identité",
  diplome: "Diplôme",
  attestation: "Attestation",
  autre: "Autre",
};

const LOG_ACTIONS: Record<string, string> = {
  check_in: "Arrivée",
  check_out: "Sortie",
  deleted: "Suppression",
};

const LOG_REASONS: Record<string, string> = {
  already_checked_in: "Arrivée déjà enregistrée",
  already_completed: "Journée déjà pointée",
  already_checked_out: "Sortie déjà enregistrée",
  not_owner: "Tentative sur le pointage d'un autre employé",
  no_check_in: "Aucune arrivée enregistrée",
  employee_archived: "Compte archivé",
  deleted_by_staff: "Supprimé par l'équipe RH",
};

const TASK_LABELS: Record<string, string> = {
  pending: "En attente",
  in_progress: "En cours",
  completed: "Terminées",
  done: "Terminées",
};

const LEAVE_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvées",
  rejected: "Rejetées",
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(15,23,42,0.55)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow p-4"
        style={{ width: "min(480px, 92vw)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">{title}</h5>
          <button type="button" className="btn-close" aria-label="Fermer" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

function StatBox({ label, value, tone = "dark" }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="col-6 col-md-3">
      <div className="bg-white border rounded-3 p-3 h-100">
        <div className={`fs-4 fw-bold text-${tone}`}>{value}</div>
        <div className="text-muted small">{label}</div>
      </div>
    </div>
  );
}

export default function EmployeeFilePage() {
  const { id } = useParams();
  const employeeId = Number(id);

  const [data, setData] = useState<EmployeeFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("resume");
  const [busy, setBusy] = useState(false);
  const [fileKey, setFileKey] = useState(0);

  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const [transferForm, setTransferForm] = useState({ department_id: "", reason: "", effective_date: todayISO() });
  const [archiveForm, setArchiveForm] = useState<{ status: DepartureStatus; departure_date: string; departure_reason: string }>({
    status: "demission",
    departure_date: todayISO(),
    departure_reason: "",
  });
  const [docForm, setDocForm] = useState<{ type: string; title: string; file: File | null }>({
    type: "contrat",
    title: "",
    file: null,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setData(await EmployeeService.getFile(employeeId));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api
      .get("/departments/list")
      .then((res) => setDepartments(res.data.data || res.data))
      .catch(() => setDepartments([]));
  }, []);

  const run = async (action: () => Promise<string | void>) => {
    try {
      setBusy(true);
      const message = await action();
      if (message) toast.success(message);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleTransfer = (e: FormEvent) => {
    e.preventDefault();
    if (!transferForm.department_id) {
      toast.error("Choisissez le département de destination.");
      return;
    }
    run(async () => {
      const res = await EmployeeService.transfer(employeeId, {
        department_id: Number(transferForm.department_id),
        reason: transferForm.reason || undefined,
        effective_date: transferForm.effective_date || undefined,
      });
      setShowTransfer(false);
      setTransferForm({ department_id: "", reason: "", effective_date: todayISO() });
      return res.message;
    });
  };

  const handleArchive = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      const res = await EmployeeService.archive(employeeId, {
        status: archiveForm.status,
        departure_date: archiveForm.departure_date,
        departure_reason: archiveForm.departure_reason || undefined,
      });
      setShowArchive(false);
      return res.message;
    });
  };

  const handleRestore = () => {
    if (!window.confirm("Réactiver cet employé ? Il pourra se reconnecter.")) return;
    run(async () => (await EmployeeService.restore(employeeId)).message);
  };

  const handleResend = () => {
    if (!window.confirm("Renvoyer un lien d'activation ? Les anciens identifiants temporaires seront invalidés.")) return;
    run(async () => (await EmployeeService.resendInvitation(employeeId)).message);
  };

  const handleUpload = (e: FormEvent) => {
    e.preventDefault();
    if (!docForm.file) {
      toast.error("Sélectionnez un fichier.");
      return;
    }
    const file = docForm.file;
    run(async () => {
      const res = await EmployeeService.uploadDocument(employeeId, { file, type: docForm.type, title: docForm.title || undefined });
      setDocForm({ type: docForm.type, title: "", file: null });
      setFileKey((k) => k + 1);
      return res.message;
    });
  };

  const handleDeleteDoc = (doc: EmployeeDocument) => {
    if (!window.confirm(`Supprimer « ${doc.title} » du dossier ?`)) return;
    run(async () => {
      await EmployeeService.deleteDocument(employeeId, doc.id);
      return "Pièce supprimée.";
    });
  };

  const handleDownload = async (doc: EmployeeDocument) => {
    try {
      await EmployeeService.downloadDocument(employeeId, doc);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading && !data) {
    return <div className="container-fluid py-5 text-center text-muted">Chargement du dossier…</div>;
  }

  if (error || !data) {
    return (
      <div className="container py-5 text-center">
        <p className="text-danger">{error || "Dossier introuvable."}</p>
        <Link to="/admin/employees" className="btn btn-primary">Retour à la liste</Link>
      </div>
    );
  }

  const emp = data.employee;
  const archived = !!emp.archived_at;
  const fullName = `${emp.first_name} ${emp.last_name ?? ""}`.trim();
  const initials = `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase();
  const p30 = data.stats.presences_30d;

  return (
    <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
      <Link to="/admin/employees" className="text-decoration-none text-muted d-inline-block mb-3">
        ← Retour aux employés
      </Link>

      {archived && (
        <div className="alert alert-secondary d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <strong>Employé archivé</strong> — {STATUS_LABELS[emp.status] ?? emp.status} le {formatDate(emp.departure_date)}
            {emp.departure_reason ? ` · ${emp.departure_reason}` : ""}
          </div>
          <button className="btn btn-sm btn-dark" onClick={handleRestore} disabled={busy}>Réactiver</button>
        </div>
      )}

      {/* En-tête */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
        <div className="card-body p-4 d-flex flex-column flex-md-row align-items-md-center gap-3">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: 72, height: 72, fontSize: 26 }}
          >
            {initials || "?"}
          </div>
          <div className="flex-grow-1">
            <h1 className="h4 fw-bold mb-1">{fullName}</h1>
            <div className="text-muted">
              {emp.department?.name ?? "Sans département"}
              {data.account.is_manager && <span className="badge bg-info-subtle text-info-emphasis ms-2">Manager</span>}
              <span className={`badge ms-2 ${archived ? "bg-secondary" : "bg-success"}`}>{STATUS_LABELS[emp.status] ?? emp.status}</span>
              {!archived && data.account.pending_activation && (
                <span className="badge bg-warning-subtle text-warning-emphasis ms-2">Compte non activé</span>
              )}
            </div>
          </div>
          {!archived && (
            <div className="d-flex flex-wrap gap-2">
              <Link to={`/admin/employees/${emp.id}/edit`} className="btn btn-outline-dark btn-sm">Modifier</Link>
              <button className="btn btn-primary btn-sm" onClick={() => setShowTransfer(true)} disabled={busy}>
                Changer de département
              </button>
              {data.account.pending_activation && (
                <button className="btn btn-outline-primary btn-sm" onClick={handleResend} disabled={busy}>
                  Renvoyer l'invitation
                </button>
              )}
              <button className="btn btn-outline-danger btn-sm" onClick={() => setShowArchive(true)} disabled={busy}>
                Archiver
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Onglets */}
      <ul className="nav nav-tabs mb-3">
        {([
          ["resume", "Résumé"],
          ["documents", `Documents (${data.documents.length})`],
          ["history", "Mouvements"],
          ["activity", "Activité pointage"],
        ] as [Tab, string][]).map(([key, label]) => (
          <li className="nav-item" key={key}>
            <button className={`nav-link ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>
              {label}
            </button>
          </li>
        ))}
      </ul>

      {tab === "resume" && (
        <>
          <div className="row g-3 mb-4">
            <StatBox label="Jours présents (30 j)" value={p30.days_present} tone="success" />
            <StatBox label="Retards (30 j)" value={p30.days_late} tone="warning" />
            <StatBox label="Absences (30 j)" value={p30.days_absent} tone="danger" />
            <StatBox label="Heures travaillées (30 j)" value={`${p30.total_hours} h`} />
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3">Informations</h6>
                  <dl className="row mb-0 small">
                    <dt className="col-5 text-muted">Email</dt><dd className="col-7">{emp.email}</dd>
                    <dt className="col-5 text-muted">Téléphone</dt><dd className="col-7">{emp.phone || "—"}</dd>
                    <dt className="col-5 text-muted">Contrat</dt><dd className="col-7">{emp.contract_type || "—"}</dd>
                    <dt className="col-5 text-muted">Date d'embauche</dt><dd className="col-7">{formatDate(emp.hire_date)}</dd>
                    <dt className="col-5 text-muted">Salaire de base</dt>
                    <dd className="col-7">{emp.salary_base != null ? `${Number(emp.salary_base).toLocaleString("fr-FR")} FCFA` : "—"}</dd>
                    <dt className="col-5 text-muted">Rôles</dt>
                    <dd className="col-7">{emp.roles?.length ? emp.roles.map((r) => r.name).join(", ") : "—"}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3">Tâches et congés</h6>
                  <div className="small mb-3">
                    <div className="text-muted mb-1">Tâches</div>
                    {Object.keys(data.stats.tasks).length === 0 && <span className="text-muted">Aucune tâche</span>}
                    {Object.entries(data.stats.tasks).map(([k, v]) => (
                      <span key={k} className="badge bg-light text-dark border me-2">{TASK_LABELS[k] ?? k} : {v}</span>
                    ))}
                  </div>
                  <div className="small">
                    <div className="text-muted mb-1">Congés</div>
                    {Object.keys(data.stats.leaves).length === 0 && <span className="text-muted">Aucune demande</span>}
                    {Object.entries(data.stats.leaves).map(([k, v]) => (
                      <span key={k} className="badge bg-light text-dark border me-2">{LEAVE_LABELS[k] ?? k} : {v}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "documents" && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-body p-4">
            <form onSubmit={handleUpload} className="row g-2 align-items-end mb-4">
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Type</label>
                <select className="form-select" value={docForm.type} onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}>
                  {Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Titre (facultatif)</label>
                <input className="form-control" value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small text-muted mb-1">Fichier (PDF, image, Word — 5 Mo max)</label>
                <input
                  key={fileKey}
                  type="file"
                  className="form-control"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setDocForm({ ...docForm, file: e.target.files?.[0] ?? null })}
                />
              </div>
              <div className="col-12 col-md-2 d-grid">
                <button className="btn btn-primary" type="submit" disabled={busy || !docForm.file}>Ajouter</button>
              </div>
            </form>

            {data.documents.length === 0 ? (
              <p className="text-muted mb-0">Aucune pièce dans ce dossier.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr><th>Titre</th><th>Type</th><th>Taille</th><th>Ajouté le</th><th>Par</th><th /></tr>
                  </thead>
                  <tbody>
                    {data.documents.map((doc) => (
                      <tr key={doc.id}>
                        <td className="fw-semibold">{doc.title}<div className="text-muted small fw-normal">{doc.original_name}</div></td>
                        <td>{DOC_TYPES[doc.type] ?? doc.type}</td>
                        <td>{formatSize(doc.size)}</td>
                        <td>{formatDate(doc.created_at)}</td>
                        <td>{doc.uploader?.name ?? "—"}</td>
                        <td className="text-end text-nowrap">
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleDownload(doc)}>Télécharger</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteDoc(doc)} disabled={busy}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-body p-4">
            {data.department_history.length === 0 ? (
              <p className="text-muted mb-0">Aucun mouvement de département enregistré.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr><th>Date d'effet</th><th>De</th><th>Vers</th><th>Motif</th><th>Par</th></tr>
                  </thead>
                  <tbody>
                    {data.department_history.map((h) => (
                      <tr key={h.id}>
                        <td>{formatDate(h.effective_date)}</td>
                        <td>{h.from_department?.name ?? "—"}</td>
                        <td className="fw-semibold">{h.to_department?.name ?? "—"}</td>
                        <td>{h.reason || "—"}</td>
                        <td>{h.transferred_by?.name ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-body p-4">
            {data.recent_presence_logs.length === 0 ? (
              <p className="text-muted mb-0">Aucune activité de pointage.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr><th>Date</th><th>Action</th><th>Résultat</th><th>Détail</th><th>IP</th></tr>
                  </thead>
                  <tbody>
                    {data.recent_presence_logs.map((l) => (
                      <tr key={l.id}>
                        <td>{formatDateTime(l.occurred_at)}</td>
                        <td>{LOG_ACTIONS[l.action] ?? l.action}</td>
                        <td>
                          <span className={`badge ${l.outcome === "success" ? "bg-success-subtle text-success-emphasis" : "bg-danger-subtle text-danger-emphasis"}`}>
                            {l.outcome === "success" ? "Réussi" : "Refusé"}
                          </span>
                        </td>
                        <td>{l.reason ? LOG_REASONS[l.reason] ?? l.reason : "—"}</td>
                        <td className="text-muted small">{l.ip_address ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link to="/admin/presences/logs" className="btn btn-link px-0 mt-3">Voir le journal complet →</Link>
          </div>
        </div>
      )}

      {showTransfer && (
        <Modal title="Changer de département" onClose={() => setShowTransfer(false)}>
          <form onSubmit={handleTransfer}>
            <p className="text-muted small">
              Département actuel : <strong>{emp.department?.name ?? "aucun"}</strong>. Ses tâches et son historique le suivent.
            </p>
            <div className="mb-3">
              <label className="form-label">Nouveau département</label>
              <select
                className="form-select"
                value={transferForm.department_id}
                onChange={(e) => setTransferForm({ ...transferForm, department_id: e.target.value })}
                required
              >
                <option value="">— Choisir —</option>
                {departments.filter((d) => d.id !== emp.department_id).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Date d'effet</label>
              <input type="date" className="form-control" value={transferForm.effective_date}
                onChange={(e) => setTransferForm({ ...transferForm, effective_date: e.target.value })} />
            </div>
            <div className="mb-4">
              <label className="form-label">Motif (facultatif)</label>
              <textarea className="form-control" rows={2} maxLength={500} value={transferForm.reason}
                onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })} />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={() => setShowTransfer(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={busy}>Confirmer le transfert</button>
            </div>
          </form>
        </Modal>
      )}

      {showArchive && (
        <Modal title="Archiver cet employé" onClose={() => setShowArchive(false)}>
          <form onSubmit={handleArchive}>
            <p className="text-muted small">
              L'employé ne pourra plus se connecter et disparaîtra des listes courantes. Son dossier et son historique sont conservés.
            </p>
            <div className="mb-3">
              <label className="form-label">Motif du départ</label>
              <select className="form-select" value={archiveForm.status}
                onChange={(e) => setArchiveForm({ ...archiveForm, status: e.target.value as DepartureStatus })}>
                <option value="demission">Démission</option>
                <option value="renvoyer">Renvoi</option>
                <option value="retraite">Retraite</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Date de départ</label>
              <input type="date" className="form-control" required value={archiveForm.departure_date}
                onChange={(e) => setArchiveForm({ ...archiveForm, departure_date: e.target.value })} />
            </div>
            <div className="mb-4">
              <label className="form-label">Détails (facultatif)</label>
              <textarea className="form-control" rows={3} maxLength={1000} value={archiveForm.departure_reason}
                onChange={(e) => setArchiveForm({ ...archiveForm, departure_reason: e.target.value })} />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={() => setShowArchive(false)}>Annuler</button>
              <button type="submit" className="btn btn-danger" disabled={busy}>Archiver</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
