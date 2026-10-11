// src/modules/roles/create.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RoleService } from "./service";
import type { RolePayload } from "./model";

interface FormErrors {
  name?: string[];
}

export default function RoleCreate() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError(null);

    try {
      const payload: RolePayload = { name };
      await RoleService.create(payload);
      navigate("/admin/roles");
    } catch (err: any) {
      if (err.response?.status === 422 && err.response.data?.erreurs) {
        setErrors(err.response.data.erreurs as FormErrors);
      } else {
        setGeneralError(err.response?.data?.message || "Erreur lors de la création.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container" style={{ maxWidth: "600px" }}>
        
        {/* En-tête de page */}
        <div className="mb-4 d-flex align-items-center">
          <Link to="/admin/roles" className="btn btn-white border shadow-sm rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h4 className="fw-bold mb-0 text-dark">Nouveau Rôle</h4>
            <p className="text-muted small mb-0">Définissez un nouvel intitulé de fonction pour le système.</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          {/* Barre décorative supérieure */}
          <div className="bg-primary" style={{ height: '4px' }}></div>
          
          <div className="card-body p-4 p-md-5">
            {generalError && (
              <div className="alert alert-danger border-0 small d-flex align-items-center rounded-3 mb-4 shadow-sm">
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
                  <span className={`input-group-text bg-light border-end-0 ${errors.name ? 'border-danger text-danger' : 'text-muted'}`} style={{ borderRadius: '12px 0 0 12px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11v6m-3-3h6"/></svg>
                  </span>
                  <input
                    id="name"
                    type="text"
                    className={`form-control form-control-lg bg-light border-start-0 ps-0 ${errors.name ? 'is-invalid border-danger' : ''}`}
                    style={{ borderRadius: '0 12px 12px 0', fontSize: '15px' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Responsable RH"
                    disabled={loading}
                    required
                  />
                </div>
                {errors.name && (
                  <div className="text-danger mt-2 fw-medium" style={{ fontSize: '12px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" className="me-1"><circle cx="6" cy="6" r="5"/><line x1="6" y1="4" x2="6" y2="6"/><line x1="6" y1="8" x2="6.01" y2="8"/></svg>
                    {errors.name.join(', ')}
                  </div>
                )}
              </div>

              <div className="d-grid gap-2 mt-5">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center py-2" 
                  disabled={loading || !name.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" className="me-2 text-white"><path d="M12 5v14m-7-7h14"/></svg>
                      Confirmer la création
                    </>
                  )}
                </button>
                <Link to="/admin/roles" className={`btn btn-link text-decoration-none text-muted small fw-bold ${loading ? 'disabled' : ''}`}>
                  Annuler
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Pied de formulaire informatif */}
        <div className="mt-4 text-center">
          <p className="text-muted" style={{ fontSize: '12px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="me-1"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
            Le nom du rôle doit être unique dans votre organisation.
          </p>
        </div>
      </div>
    </div>
  );
}