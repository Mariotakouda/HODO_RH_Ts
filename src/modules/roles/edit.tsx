import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { RoleService } from "./service";
import type { RolePayload } from "./model";

interface FormErrors {
  name?: string[];
}

/**
 * SKELETON POUR L'ÉDITION
 */
const EditSkeleton = () => (
  <div className="min-vh-100 py-5 bg-light">
    <style>{`
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      .skeleton-box { background: #e9ecef; animation: pulse 1.5s infinite ease-in-out; border-radius: 10px; }
    `}</style>
    <div className="container" style={{ maxWidth: "600px" }}>
      <div className="mb-4 d-flex align-items-center">
        <div className="skeleton-box rounded-circle me-3" style={{ width: '38px', height: '38px' }}></div>
        <div className="flex-grow-1">
          <div className="skeleton-box mb-2" style={{ width: '40%', height: '20px' }}></div>
          <div className="skeleton-box" style={{ width: '25%', height: '12px' }}></div>
        </div>
      </div>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 p-md-5">
          <div className="skeleton-box mb-3" style={{ width: '100px', height: '15px' }}></div>
          <div className="skeleton-box mb-4" style={{ width: '100%', height: '50px' }}></div>
          <div className="skeleton-box mt-4" style={{ width: '100%', height: '45px', borderRadius: '50px' }}></div>
        </div>
      </div>
    </div>
  </div>
);

export default function RoleEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialName, setInitialName] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadRole(Number(id));
  }, [id]);

  const loadRole = async (roleId: number) => {
    setLoading(true);
    try {
      const data = await RoleService.get(roleId);
      setInitialName(data.name);
      setName(data.name);
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    setErrors({});
    setGeneralError(null);

    try {
      const payload: RolePayload = { name };
      await RoleService.update(Number(id), payload);
      navigate(`/admin/roles/${id}`);
    } catch (err: any) {
      if (err.response?.status === 422 && err.response.data?.erreurs) {
        setErrors(err.response.data.erreurs as FormErrors);
      } else {
        setGeneralError(err.response?.data?.message || "Erreur lors de la mise à jour.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <EditSkeleton />;

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container" style={{ maxWidth: "600px" }}>
        
        {/* Header de retour */}
        <div className="mb-4 d-flex align-items-center">
          <button onClick={() => navigate(-1)} className="btn btn-white border shadow-sm rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', backgroundColor: 'white' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h4 className="fw-bold mb-0 text-dark">Modifier le Rôle</h4>
            {/* <span className="text-muted small">ID: #{id} — <span className="text-primary fw-bold">{initialName}</span></span> */}
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4 p-md-5 bg-white">
            {generalError && (
              <div className="alert alert-danger border-0 small d-flex align-items-center rounded-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="me-2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>
                  Nom du Rôle
                </label>
                <div className="input-group">
                  <span className={`input-group-text bg-light border-end-0 ${errors.name ? 'border-danger' : ''}`} style={{ borderRadius: '10px 0 0 10px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </span>
                  <input
                    id="name"
                    type="text"
                    className={`form-control form-control-lg bg-light border-start-0 ps-0 ${errors.name ? 'is-invalid border-danger' : ''}`}
                    style={{ borderRadius: '0 10px 10px 0', fontSize: '15px' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Administrateur"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                {errors.name && (
                  <div className="text-danger mt-2 fw-medium" style={{ fontSize: '12px' }}>
                    {errors.name.join(', ')}
                  </div>
                )}
              </div>

              <div className="d-flex flex-column gap-2 mt-5">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center border-0" 
                  disabled={isSubmitting || name === initialName}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" className="me-2 text-white"><path d="M20 6 9 17l-5-5"/></svg>
                      Enregistrer les modifications
                    </>
                  )}
                </button>
                <Link to={`/admin/roles/${id}`} className={`btn btn-link text-decoration-none text-muted small fw-bold ${isSubmitting ? 'disabled' : ''}`}>
                  Annuler et revenir en arrière
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Aide visuelle */}
        <div className="mt-4 p-3 rounded-4 bg-white shadow-sm border-start border-warning border-4">
          <div className="d-flex">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning me-3 flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p className="small text-muted mb-0">
              <strong>Note :</strong> Modifier le nom du rôle n'affectera pas les permissions déjà assignées, mais sera visible partout dans le système.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}