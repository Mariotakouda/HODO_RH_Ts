import { useEffect, useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  fetchAnnouncements,
  deleteAnnouncement,
  checkManagerStatus,
} from "./service";
import type { Announcement } from "./model";
import type { ManagerStatus } from "./service";

// --- Composant d'icône (Conservé tel quel) ---
const Icon = ({
  name,
}: {
  name: "eye" | "edit" | "trash" | "plus" | "search";
}) => {
  const icons = {
    eye: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    edit: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    ),
    trash: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    ),
    plus: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14m-7-7v14" />
      </svg>
    ),
    search: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  };
  return <span className={`icon-wrapper ic-${name}`}>{icons[name]}</span>;
};

// --- Sous-composant Skeleton (Conservé tel quel) ---
const SkeletonRow = () => (
  <tr className="skeleton-row">
    <td className="px-4 py-4">
      <div className="skeleton" style={{ width: "80px", height: "24px", borderRadius: "20px" }}></div>
    </td>
    <td className="py-4">
      <div className="skeleton mb-2" style={{ width: "60%", height: "18px" }}></div>
      <div className="skeleton" style={{ width: "90%", height: "14px" }}></div>
    </td>
    <td className="py-4">
      <div className="skeleton" style={{ width: "120px", height: "16px" }}></div>
    </td>
    <td className="px-4 text-center">
      <div className="skeleton d-inline-block" style={{ width: "100px", height: "32px" }}></div>
    </td>
  </tr>
);

export default function AnnouncementList() {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [managerStatus, setManagerStatus] = useState<ManagerStatus | null>(null);

  const canManage = user?.role === "admin" || managerStatus?.is_manager || false;

  // Chargement du statut au montage
  useEffect(() => {
    loadManagerStatus();
  }, []);

  // OPTIMISATION : Utilisation d'un debounce pour éviter la latence à la saisie
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchAnnouncements(search, page);
      const items = response.data || [];
      const metadata = response.meta || {
        total: response.total || 0,
        last_page: response.last_page || 1,
      };

      setAnnouncements(items);
      setMeta(metadata);
      setError("");
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const handler = setTimeout(() => {
      load();
    }, 400); // On attend 400ms avant de lancer la requête API

    return () => clearTimeout(handler);
  }, [load]);

  async function loadManagerStatus() {
    try {
      const status = await checkManagerStatus();
      setManagerStatus(status);
    } catch (err) {
      console.error("Statut manager error:", err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;
    try {
      await deleteAnnouncement(id);
      load();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  }

  function canManageAnnouncement(a: Announcement): boolean {
    // Seul l'auteur peut modifier / supprimer son annonce.
    return a.user_id === user?.id;
  }

  return (
    <div className="container-fluid py-4 py-md-5 px-3 px-md-5 bg-light min-vh-100">
      <style>{`
        .skeleton {
          background: linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 4px;
        }
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .skeleton-card { background: white; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; }
        .btn-white { background: white; border: 1px solid #dee2e6; }
      `}</style>

      {/* --- HEADER --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Annonces Externes</h1>
          <p className="text-muted mb-0 font-monospace" style={{ fontSize: "13px" }}>
            TOTAL: <span className="fw-bold">{meta?.total || 0}</span>
          </p>
        </div>
        {canManage && (
          <Link to="create" className="btn btn-primary d-inline-flex align-items-center shadow-sm px-4 py-2 rounded-3">
            <Icon name="plus" /> <span className="fw-bold ms-2">Nouvelle annonce</span>
          </Link>
        )}
      </div>

      {/* --- RECHERCHE --- */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0 text-muted ps-3">
              <Icon name="search" />
            </span>
            <input
              className="form-control border-0 bg-transparent shadow-none"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ fontSize: "15px", padding: "12px 10px" }}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger border-0 py-3 small">{error}</div>}

      {/* --- VUE MOBILE --- */}
      <div className="d-md-none">
        {loading
          ? [1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card shadow-sm border-0">
                <div className="skeleton mb-3" style={{ width: "80px", height: "24px", borderRadius: "20px" }}></div>
                <div className="skeleton mb-2" style={{ width: "100%", height: "20px" }}></div>
                <div className="skeleton mb-3" style={{ width: "70%", height: "14px" }}></div>
                <div className="skeleton" style={{ width: "100%", height: "35px", borderRadius: "8px" }}></div>
              </div>
            ))
          : announcements.map((a) => (
              <div key={a.id} className="card border-0 shadow-sm mb-3 rounded-4">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    {a.is_general ? (
                      <span className="badge rounded-pill px-3 py-2 bg-info" style={{ fontSize: "11px" }}>Générale</span>
                    ) : a.department ? (
                      <span className="badge rounded-pill px-3 py-2 bg-primary" style={{ fontSize: "11px" }}>Dépt: {a.department.name}</span>
                    ) : a.employee ? (
                      <span className="badge rounded-pill px-3 py-2 bg-warning text-dark" style={{ fontSize: "11px" }}>Pour: {a.employee.first_name} {a.employee.last_name}</span>
                    ) : (
                      <span className="badge rounded-pill px-3 py-2 bg-secondary" style={{ fontSize: "11px" }}>Individuelle</span>
                    )}
                    <small className="text-muted" style={{ fontSize: "12px" }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                    </small>
                  </div>
                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: "16px" }}>{a.title}</h5>
                  <p className="text-muted mb-3 small text-truncate">{a.message}</p>
                  <Link to={`${a.id}`} className="btn btn-white btn-sm w-100 shadow-sm py-2 d-flex align-items-center justify-content-center">
                    <Icon name="eye" /> <span className="ms-2 fw-bold">Détails</span>
                  </Link>
                </div>
              </div>
            ))}
      </div>

      {/* --- VUE DESKTOP --- */}
      <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr style={{ fontSize: "12px", textTransform: "uppercase", color: "#666" }}>
                <th className="px-4 py-3">Destinataire</th>
                <th className="py-3">Sujet / Message</th>
                <th className="py-3">Date</th>
                <th className="py-3 text-center px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
                : announcements.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-4">
                        {a.is_general ? (
                          <span className="badge fw-bold px-3 py-2 rounded-pill bg-info" style={{ fontSize: "10px" }}>GÉNÉRALE</span>
                        ) : a.department ? (
                          <span className="badge fw-bold px-3 py-2 rounded-pill bg-primary" style={{ fontSize: "10px" }}>DÉPT: {a.department.name.toUpperCase()}</span>
                        ) : a.employee ? (
                          <span className="badge fw-bold px-3 py-2 rounded-pill bg-warning text-dark" style={{ fontSize: "10px" }}>POUR: {a.employee.first_name.toUpperCase()} {a.employee.last_name.toUpperCase()}</span>
                        ) : (
                          <span className="badge fw-bold px-3 py-2 rounded-pill bg-secondary" style={{ fontSize: "10px" }}>INDIVIDUELLE</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="fw-bold text-dark mb-1">{a.title}</div>
                        <div className="text-muted text-truncate" style={{ maxWidth: "400px", fontSize: "13px" }}>{a.message}</div>
                      </td>
                      <td className="py-4 text-muted small">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="text-center px-4">
                        <div className="d-inline-flex gap-2">
                          <Link to={`${a.id}`} className="btn btn-outline-primary btn-sm rounded-3 p-2 d-flex shadow-sm">
                            <Icon name="eye" />
                          </Link>
                          {canManageAnnouncement(a) && (
                            <>
                              <Link to={`${a.id}/edit`} className="btn btn-outline-warning btn-sm rounded-3 p-2 d-flex shadow-sm">
                                <Icon name="edit" />
                              </Link>
                              <button onClick={() => handleDelete(a.id)} className="btn btn-outline-danger btn-sm rounded-3 p-2 d-flex shadow-sm">
                                <Icon name="trash" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PAGINATION --- */}
      {!loading && meta && meta.last_page > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted small">
            Page <strong>{page}</strong> sur <strong>{meta.last_page}</strong>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-white border px-4 shadow-sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
              Précédent
            </button>
            <button className="btn btn-white border px-4 shadow-sm" onClick={() => setPage(page + 1)} disabled={page === meta.last_page}>
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}