import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getManager, deleteManager } from "./service";
import type { Manager } from "./model";

/**
 * COMPOSANT SKELETON POUR LA FICHE DÉTAILLÉE
 */
const ManagerSkeleton = () => (
  <div className="min-vh-100 py-4" style={{ backgroundColor: "#f8f9fa" }}>
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
    <div className="container" style={{ maxWidth: "900px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div className="skeleton-shimmer rounded-circle me-2" style={{ width: '32px', height: '32px' }}></div>
          <div>
            <div className="skeleton-shimmer mb-1" style={{ width: '100px', height: '10px' }}></div>
            <div className="skeleton-shimmer" style={{ width: '150px', height: '20px' }}></div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <div className="skeleton-shimmer rounded-pill" style={{ width: '80px', height: '30px' }}></div>
          <div className="skeleton-shimmer rounded-circle" style={{ width: '30px', height: '30px' }}></div>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-12 col-md-5">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
            <div className="d-flex align-items-center mb-3">
              <div className="skeleton-shimmer rounded-circle" style={{ width: '50px', height: '50px' }}></div>
              <div className="ms-3 flex-grow-1">
                <div className="skeleton-shimmer mb-2 w-75" style={{ height: '15px' }}></div>
                <div className="skeleton-shimmer w-50" style={{ height: '12px' }}></div>
              </div>
            </div>
            <div className="pt-2 border-top row">
              <div className="col-6"><div className="skeleton-shimmer w-100" style={{ height: '30px' }}></div></div>
              <div className="col-6"><div className="skeleton-shimmer w-100" style={{ height: '30px' }}></div></div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-7">
          <div className="skeleton-shimmer w-100 mb-3" style={{ height: '100px', borderRadius: '12px' }}></div>
          <div className="skeleton-shimmer w-100" style={{ height: '80px', borderRadius: '12px' }}></div>
        </div>
      </div>
    </div>
  </div>
);

export default function ManagerShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [manager, setManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadManager = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getManager(id);
      setManager(data);
    } catch (err: any) {
      setError("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadManager();
  }, [loadManager]);

  const handleDelete = async () => {
    if (window.confirm("Supprimer ce manager ?")) {
      try {
        await deleteManager(Number(id));
        navigate("/admin/managers");
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  if (loading) return <ManagerSkeleton />;

  if (error || !manager) return (
    <div className="container py-4 text-center">
      <div className="alert alert-light border shadow-sm py-3 small mx-auto" style={{ maxWidth: "400px" }}>
        <span className="text-danger fw-bold">Erreur :</span> {error || "Manager non trouvé"}
        <div className="mt-3">
          <button onClick={() => navigate("/admin/managers")} className="btn btn-sm btn-dark rounded-pill px-4">Retour à la liste</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 py-4" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        
        {/* Header - Actions compactes */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <button onClick={() => navigate("/admin/managers")} className="btn btn-white btn-sm shadow-sm rounded-circle me-2 border d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0" style={{ fontSize: '10px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  <li className="breadcrumb-item"><Link to="/admin/managers" className="text-decoration-none text-muted">Managers</Link></li>
                  <li className="breadcrumb-item active text-primary fw-bold">Détails</li>
                </ol>
              </nav>
              <h5 className="fw-bold text-dark mb-0">Fiche Manager</h5>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Link to={`/admin/managers/${id}/edit`} className="btn btn-primary btn-sm rounded-pill px-3 fw-bold small d-flex align-items-center gap-1 shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Éditer
            </Link>
            <button onClick={handleDelete} className="btn btn-outline-danger btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        <div className="row g-3">
          {/* Carte Identité */}
          <div className="col-12 col-md-5">
            <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '50px', height: '50px', fontSize: '14px' }}>
                  {manager.employee.first_name[0]}{manager.employee.last_name[0]}
                </div>
                <div className="ms-3">
                  <div className="fw-bold text-dark mb-0" style={{ fontSize: '15px' }}>{manager.employee.first_name} {manager.employee.last_name}</div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>{manager.employee.email}</div>
                </div>
              </div>
              
              <div className="pt-3 border-top mt-auto">
                <div className="row g-2 text-center">
                  {/* <div className="col-6 border-end">
                    <div className="text-muted fw-bold" style={{ fontSize: '9px', textTransform: 'uppercase' }}>ID Employé</div>
                    <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>#{manager.employee_id}</div>
                  </div> */}
                  <div className="col-6">
                    <div className="text-muted fw-bold" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Création</div>
                    <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{new Date(manager.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte Département & Activité */}
          <div className="col-12 col-md-7">
            <div className="row g-3">
              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-primary border-4">
                  <div className="text-muted fw-bold mb-1" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Département Assigné</div>
                  <div className="h4 fw-bold text-dark mb-0">
                    {manager.department ? manager.department.name : "Non assigné"}
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted fw-bold mb-1" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Dernière mise à jour</div>
                      <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>
                        {new Date(manager.updated_at || manager.created_at).toLocaleString('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="bg-light p-2 rounded-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}