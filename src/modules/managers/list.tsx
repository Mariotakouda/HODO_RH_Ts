import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchManagers, deleteManager } from "./service";
import type { Manager } from "./model";

/**
 * COMPOSANT SKELETON POUR LA LISTE
 */
const ListSkeleton = () => (
  <div className="w-100">
    <style>{`
      @keyframes shimmer {
        0% { background-position: -468px 0; }
        100% { background-position: 468px 0; }
      }
      .skeleton-shimmer {
        background: #f6f7f8;
        background-image: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 20%, #f1f5f9 40%, #f1f5f9 100%);
        background-repeat: no-repeat;
        background-size: 800px 100%;
        display: inline-block;
        animation: shimmer 1.5s linear infinite forwards;
      }
    `}</style>
    {/* Skeletons pour le tableau (Desktop) */}
    <div className="d-none d-md-block">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="d-flex align-items-center p-3 border-bottom bg-white">
          <div className="flex-grow-1">
            <div className="skeleton-shimmer mb-2" style={{ width: '200px', height: '20px', borderRadius: '4px' }}></div>
            <div className="skeleton-shimmer" style={{ width: '150px', height: '14px', borderRadius: '4px' }}></div>
          </div>
          <div className="mx-auto">
            <div className="skeleton-shimmer" style={{ width: '100px', height: '24px', borderRadius: '12px' }}></div>
          </div>
          <div className="ms-auto d-flex gap-2">
            <div className="skeleton-shimmer" style={{ width: '38px', height: '38px', borderRadius: '8px' }}></div>
            <div className="skeleton-shimmer" style={{ width: '38px', height: '38px', borderRadius: '8px' }}></div>
            <div className="skeleton-shimmer" style={{ width: '38px', height: '38px', borderRadius: '8px' }}></div>
          </div>
        </div>
      ))}
    </div>
    {/* Skeletons pour les cartes (Mobile) */}
    <div className="d-md-none">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card border-0 shadow-sm mb-3 p-3">
          <div className="skeleton-shimmer mb-2" style={{ width: '60%', height: '24px' }}></div>
          <div className="skeleton-shimmer mb-3" style={{ width: '40%', height: '16px' }}></div>
          <div className="d-flex gap-2">
            <div className="skeleton-shimmer flex-grow-1" style={{ height: '40px', borderRadius: '8px' }}></div>
            <div className="skeleton-shimmer" style={{ width: '45px', height: '40px', borderRadius: '8px' }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ManagerList() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const loadManagers = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      const data = await fetchManagers(page, search);
      setManagers(data.data || []);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
      setError("");
    } catch (err: any) {
      setError("Impossible de charger la liste des managers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManagers(currentPage, searchQuery);
  }, [currentPage, searchQuery, loadManagers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadManagers(1, searchQuery);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce manager ?")) {
      setIsDeleting(id);
      try {
        await deleteManager(id);
        loadManagers(currentPage, searchQuery);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const iconProps = {
    width: "20",
    height: "20",
    strokeWidth: "2",
    stroke: "currentColor",
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <div className="container-fluid py-4 px-2 px-md-5 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Gestion des Managers</h2>
          <p className="text-muted fs-6 mb-0">Total : <strong>{managers.length}</strong> managers enregistrés</p>
        </div>
        <Link to="/admin/managers/create" className="btn btn-primary d-inline-flex align-items-center shadow-sm py-2 px-3 rounded-3 fs-6">
          <svg {...iconProps} viewBox="0 0 24 24" className="me-2" width="18" height="18"><path d="M5 12h14m-7-7v14"/></svg>
          <span className="fw-bold">Nouveau Manager</span>
        </Link>
      </div>

      {/* Affichage de l'erreur */}
      {error && (
        <div className="alert alert-danger shadow-sm border-0 mb-4 rounded-3 d-flex align-items-center p-3 fs-6">
          <svg {...iconProps} viewBox="0 0 24 24" className="me-2 text-danger" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div className="flex-grow-1">{error}</div>
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="card border-0 shadow-sm mb-4 rounded-3 overflow-hidden">
        <div className="card-body p-3 bg-white">
          <form onSubmit={handleSearch} className="row g-2 align-items-center">
            <div className="col-12 col-md">
              <div className="input-group align-items-center px-2">
                <span className="text-muted me-2">
                    <svg {...iconProps} viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none fs-6 p-1"
                  placeholder="Rechercher un manager..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-auto">
              <button type="submit" className="btn btn-dark px-4 py-2 fw-bold rounded-2 fs-6">Rechercher</button>
            </div>
          </form>
        </div>
      </div>

      {/* VUE TABLEAU (Desktop) */}
      <div className="card border-0 shadow-sm d-none d-md-block rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-nowrap">
            <thead className="bg-white border-bottom">
              <tr>
                <th className="px-4 py-3 fs-6 fw-bold text-secondary">MANAGER</th>
                <th className="py-3 fs-6 fw-bold text-secondary text-center">DÉPARTEMENT</th>
                <th className="py-3 text-end px-4 fs-6 fw-bold text-secondary">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-0">
                    <ListSkeleton />
                  </td>
                </tr>
              ) : managers.length > 0 ? (
                managers.map((manager) => (
                  <tr key={manager.id}>
                    <td className="px-4 py-3">
                      <div className="fw-bold text-dark fs-6">{manager.employee.first_name} {manager.employee.last_name}</div>
                      <div className="text-muted small">{manager.employee.email}</div>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-primary border border-primary-subtle px-2 py-1 small fw-bold">
                        {manager.department?.name || "NON ASSIGNÉ"}
                      </span>
                    </td>
                    <td className="px-4">
                      <div className="d-flex justify-content-end gap-2">
                        <Link to={`/admin/managers/${manager.id}`} className="btn btn-outline-primary d-flex align-items-center justify-content-center border-1" style={{ width: '38px', height: '38px', borderRadius: '8px' }}>
                          <svg {...iconProps} viewBox="0 0 24 24" stroke="#0d6efd" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </Link>
                        <Link to={`/admin/managers/${manager.id}/edit`} className="btn btn-outline-warning d-flex align-items-center justify-content-center border-1" style={{ width: '38px', height: '38px', borderRadius: '8px' }}>
                          <svg {...iconProps} viewBox="0 0 24 24" stroke="#ffc107" width="18" height="18"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </Link>
                        <button onClick={() => handleDelete(manager.id)} disabled={isDeleting === manager.id} className="btn btn-outline-danger d-flex align-items-center justify-content-center border-1" style={{ width: '38px', height: '38px', borderRadius: '8px' }}>
                          {isDeleting === manager.id ? <span className="spinner-border spinner-border-sm"></span> : 
                          <svg {...iconProps} viewBox="0 0 24 24" stroke="#dc3545" width="18" height="18"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="text-center py-5 fs-6 text-muted">Aucun manager trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VUE MOBILE (Cards) */}
      <div className="d-block d-md-none">
        {loading ? (
          <ListSkeleton />
        ) : managers.map((manager) => (
          <div key={manager.id} className="card border-0 shadow-sm mb-3 rounded-3">
            <div className="card-body p-3">
              <div className="mb-3">
                <div className="fw-bold text-dark fs-5">{manager.employee.first_name} {manager.employee.last_name}</div>
                <div className="text-muted small">{manager.employee.email}</div>
                <span className="badge bg-primary text-white mt-2" style={{ fontSize: '10px' }}>{manager.department?.name || "Sans dép."}</span>
              </div>
              <div className="d-flex gap-2">
                <Link to={`/admin/managers/${manager.id}`} className="btn btn-dark flex-grow-1 py-2 fw-bold fs-6 rounded-2">Détails</Link>
                <Link to={`/admin/managers/${manager.id}/edit`} className="btn btn-outline-warning d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', borderRadius: '10px' }}>
                    <svg {...iconProps} viewBox="0 0 24 24" stroke="#ffc107" width="20" height="20"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </Link>
                <button onClick={() => handleDelete(manager.id)} className="btn btn-outline-danger d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', borderRadius: '10px' }}>
                    <svg {...iconProps} viewBox="0 0 24 24" stroke="#dc3545" width="20" height="20"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
          <button className="btn btn-outline-secondary btn-sm px-3 py-2 fw-bold" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1 || loading}>Précédent</button>
          <div className="fw-bold fs-6 text-dark px-2">Page {currentPage} / {lastPage}</div>
          <button className="btn btn-outline-secondary btn-sm px-3 py-2 fw-bold" onClick={() => setCurrentPage(p => Math.min(lastPage, p+1))} disabled={currentPage === lastPage || loading}>Suivant</button>
        </div>
      )}
    </div>
  );
}