import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api/axios";
import type { Department, Employee, ManagerFormData } from "./model";

/**
 * SKELETON STATE
 */
const CreateSkeleton = () => (
  <div className="bg-light min-vh-100 py-4 py-md-5">
    <style>{`
      @keyframes shimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }
      .skeleton-shimmer {
        background: #f6f7f8;
        background-image: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 20%, #f1f5f9 40%, #f1f5f9 100%);
        background-repeat: no-repeat;
        background-size: 800px 100%;
        animation: shimmer 1.5s linear infinite forwards;
      }
    `}</style>
    <div className="container-fluid px-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11 col-xl-10 col-xxl-9">
          <div className="skeleton-shimmer mb-4" style={{ width: '300px', height: '40px', borderRadius: '8px' }}></div>
          <div className="card border-0 shadow-sm rounded-4" style={{ height: '400px' }}></div>
        </div>
      </div>
    </div>
  </div>
);

export default function ManagerCreate() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState<ManagerFormData>({
    employee_id: null,
    department_id: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([api.get("/employees"), api.get("/departments")]);
      setEmployees(empRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (err: any) {
      setError("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === "" ? null : Number(value) }));
    if (validationErrors[name]) {
      const newErr = { ...validationErrors };
      delete newErr[name];
      setValidationErrors(newErr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id) { setError("Sélectionnez un employé."); return; }
    try {
      setIsSubmitting(true);
      await api.post("/managers", formData);
      navigate("/admin/managers");
    } catch (err: any) {
      if (err.response?.status === 422) setValidationErrors(err.response.data.errors || {});
      else setError("Erreur lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <CreateSkeleton />;

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      <div className="container-fluid px-md-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-11 col-xl-10 col-xxl-9">
            
            {/* Header épuré */}
            <div className="mb-4">
              <h1 className="h3 fw-bold text-dark mb-1">Nouveau Manager</h1>
              <p className="text-muted small">Promotion d'un collaborateur au rang de superviseur.</p>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-body p-4 p-md-5 bg-white">
                
                {error && (
                  <div className="alert alert-danger border-0 small mb-4 py-2">
                    <i className="bi bi-exclamation-triangle me-2"></i>{error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    {/* Sélecteur Employé */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-uppercase text-secondary">Collaborateur *</label>
                      <select
                        name="employee_id"
                        className={`form-select bg-light border-0 ${validationErrors.employee_id ? 'is-invalid' : ''}`}
                        style={{ height: '48px', borderRadius: '10px' }}
                        value={formData.employee_id || ""}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      >
                        <option value="">Choisir un employé...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.last_name} {emp.first_name}</option>
                        ))}
                      </select>
                      {validationErrors.employee_id && <div className="invalid-feedback">{validationErrors.employee_id[0]}</div>}
                    </div>

                    {/* Sélecteur Département */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-uppercase text-secondary">Département</label>
                      <select
                        name="department_id"
                        className="form-select bg-light border-0"
                        style={{ height: '48px', borderRadius: '10px' }}
                        value={formData.department_id || ""}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      >
                        <option value="">Aucun (Flottant)</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Ligne de séparation discrète */}
                    <div className="col-12 my-4">
                      <hr className="text-muted opacity-25" />
                    </div>

                    {/* Boutons alignés à droite sans gros cadre gris */}
                    <div className="col-12 d-flex justify-content-end gap-3 align-items-center">
                      <Link to="/admin/managers" className="text-decoration-none text-secondary small fw-bold me-2">
                        Annuler
                      </Link>
                      <button
                        type="submit"
                        className="btn btn-primary px-4 py-2 fw-bold shadow-sm"
                        style={{ borderRadius: '10px', minWidth: '160px' }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : "Créer le profil"}
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}