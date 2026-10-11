import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { RoleService } from "./service";
import type { Role } from "./model";

/**
 * SKELETON STATE - REPRODUCTION DE LA STRUCTURE DE LA CARTE
 */
const ShowSkeleton = () => (
  <div className="min-vh-100 py-4 py-md-5" style={{ backgroundColor: "#fbfbfd" }}>
    <style>{`
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      .skeleton-shimmer { background: #eaecf0; animation: pulse 1.5s infinite ease-in-out; border-radius: 6px; }
    `}</style>
    <div className="container" style={{ maxWidth: "800px" }}>
      {/* Header Skeleton */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div className="skeleton-shimmer rounded-circle me-3" style={{ width: '40px', height: '40px' }}></div>
          <div>
            <div className="skeleton-shimmer mb-2" style={{ width: '100px', height: '12px' }}></div>
            <div className="skeleton-shimmer" style={{ width: '180px', height: '24px' }}></div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <div className="skeleton-shimmer rounded-pill" style={{ width: '90px', height: '32px' }}></div>
          <div className="skeleton-shimmer rounded-pill" style={{ width: '90px', height: '32px' }}></div>
        </div>
      </div>
      {/* Card Skeleton */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white p-4 border-bottom">
          <div className="d-flex align-items-center">
            <div className="skeleton-shimmer rounded-3 me-3" style={{ width: '54px', height: '54px' }}></div>
            <div className="flex-grow-1">
              <div className="skeleton-shimmer mb-2" style={{ width: '40%', height: '20px' }}></div>
              <div className="skeleton-shimmer" style={{ width: '20%', height: '12px' }}></div>
            </div>
          </div>
        </div>
        <div className="card-body p-4 p-md-5">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="skeleton-shimmer rounded-3" style={{ height: '70px' }}></div>
            </div>
            <div className="col-12 mt-5">
              <div className="skeleton-shimmer mb-3" style={{ width: '150px', height: '18px' }}></div>
              <div className="skeleton-shimmer mb-3" style={{ width: '100%', height: '40px' }}></div>
              <div className="skeleton-shimmer" style={{ width: '100%', height: '40px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function RoleShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await RoleService.get(Number(id));
      setRole(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erreur lors du chargement des données.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      load();
    }
  }, [id, load]);

  const handleDelete = async () => {
    if (!role) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`)) return;

    try {
      setLoading(true);
      await RoleService.remove(role.id);
      navigate("/admin/roles");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Impossible de supprimer le rôle.";
      alert(errorMsg);
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  // --- RENDU CONDITIONNEL (SKELETON) ---
  if (loading && !role) return <ShowSkeleton />;

  if (error || !role) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-light shadow-sm border-0 p-4 rounded-4">
          <h5 className="text-danger fw-bold">Oups !</h5>
          <p className="text-muted small">{error || "Rôle introuvable."}</p>
          <Link to="/admin/roles" className="btn btn-dark btn-sm rounded-pill px-4 fw-bold text-decoration-none">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-4 py-md-5" style={{ backgroundColor: "#fbfbfd" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        
        {/* Navigation & Actions */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
          <div className="d-flex align-items-center">
            <button 
              onClick={() => navigate("/admin/roles")} 
              className="btn btn-white shadow-sm rounded-circle me-3 border d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px', backgroundColor: 'white' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 small text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>
                  <li className="breadcrumb-item"><Link to="/admin/roles" className="text-decoration-none text-muted">Rôles</Link></li>
                  <li className="breadcrumb-item active text-primary">Détails</li>
                </ol>
              </nav>
              <h4 className="fw-bold text-dark mb-0">Information du Rôle</h4>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Link to={`/admin/roles/${role.id}/edit`} className="btn btn-outline-warning btn-sm rounded-pill px-3 fw-bold d-flex align-items-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              Modifier
            </Link>
            <button 
              onClick={handleDelete} 
              disabled={loading}
              className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold d-flex align-items-center shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              Supprimer
            </button>
          </div>
        </div>

        {/* Carte de détails */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
          <div className="card-header bg-white border-bottom p-4">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3 shadow-sm fw-bold" style={{ width: '54px', height: '54px', fontSize: '18px' }}>
                  {role.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="fw-bold mb-0 text-dark" style={{ fontSize: '20px' }}>{role.name}</h3>
                  {/* <p className="text-muted small mb-0 font-monospace">ID REF: #{role.id}</p> */}
                </div>
              </div>
          </div>
          
          <div className="card-body p-4 p-md-5">
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <div className="p-3 border rounded-3 bg-light">
                  <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '10px' }}>Effectif associé</small>
                  <div className="d-flex align-items-center">
                    <span className="h4 fw-bold text-primary mb-0 me-2">{role.employees_count ?? 0}</span>
                    <span className="small text-muted fw-medium">Employés</span>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 mt-2" style={{ fontSize: '14px' }}>Historique système</h6>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center">
                    <div className="p-2 bg-light rounded me-3 text-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div>
                      <small className="text-muted d-block small" style={{ fontSize: '10px' }}>Date de création</small>
                      <span className="fw-bold text-dark small">{formatDateTime(role.created_at)}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="p-2 bg-light rounded me-3 text-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </div>
                    <div>
                      <small className="text-muted d-block small" style={{ fontSize: '10px' }}>Dernière modification</small>
                      <span className="fw-bold text-dark small">{formatDateTime(role.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note informative */}
        <div className="alert bg-white border-0 shadow-sm rounded-4 p-3 d-flex align-items-center border-start border-primary border-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary me-3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <p className="small text-muted mb-0">
              Les changements apportés à ce rôle impacteront les permissions de tous les employés associés.
            </p>
        </div>

      </div>
    </div>
  );
}