import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getManager,
  updateManager,
  fetchEmployeesAndDepartments,
} from "./service";
import type { Employee, Department, ManagerFormData } from "./model";

/**
 * SKELETON LOADER POUR L'ÉDITION
 */
const EditSkeleton = () => (
  <div
    className="min-vh-100 py-4 py-md-5"
    style={{ backgroundColor: "#f1f5f9" }}
  >
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
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="d-flex justify-content-between mb-4">
            <div
              className="skeleton-shimmer"
              style={{ width: "250px", height: "40px", borderRadius: "8px" }}
            ></div>
            <div
              className="skeleton-shimmer"
              style={{ width: "100px", height: "40px", borderRadius: "8px" }}
            ></div>
          </div>
          <div
            className="card border-0 shadow-sm"
            style={{ borderRadius: "12px", height: "400px" }}
          >
            <div className="card-body p-5">
              <div className="row g-4">
                <div className="col-md-6">
                  <div
                    className="skeleton-shimmer w-100"
                    style={{ height: "60px", borderRadius: "12px" }}
                  ></div>
                </div>
                <div className="col-md-6">
                  <div
                    className="skeleton-shimmer w-100"
                    style={{ height: "60px", borderRadius: "12px" }}
                  ></div>
                </div>
                <div className="col-12 mt-5">
                  <div
                    className="skeleton-shimmer w-100"
                    style={{ height: "80px", borderRadius: "16px" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ManagerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const [formData, setFormData] = useState<ManagerFormData>({
    employee_id: null,
    department_id: null,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [manager, dependencies] = await Promise.all([
          getManager(id),
          fetchEmployeesAndDepartments(),
        ]);
        setEmployees(dependencies.employees);
        setDepartments(dependencies.departments);
        setFormData({
          employee_id: manager.employee_id || null,
          department_id: manager.department_id || null,
        });
      } catch (err: any) {
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const processedValue = value === "" ? null : Number(value);
    setFormData({ ...formData, [name]: processedValue });
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    try {
      await updateManager(Number(id), formData);
      navigate("/admin/managers");
    } catch (err: any) {
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.errors || {});
      } else {
        setError(err.response?.data?.message || "Erreur de mise à jour");
      }
    }
  };

  if (loading) return <EditSkeleton />;

  return (
    <div
      className="min-vh-100 py-4 py-md-5"
      style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {/* Header */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
              <div>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h1 className="h3 fw-bold mb-0" style={{ color: "#0f172a" }}>
                    Profil Manager
                  </h1>
                  <span
                    className="badge rounded-pill"
                    style={{
                      backgroundColor: "#e0e7ff",
                      color: "#4338ca",
                      border: "1px solid #c7d2fe",
                      fontSize: "11px",
                    }}
                  >
                    ADMINISTRATION
                  </span>
                </div>
                {/* <p className="mb-0 text-secondary small">ID Système : <span className="fw-bold text-dark">#{id}</span></p> */}
              </div>
              <Link
                to="/admin/managers"
                className="btn btn-white shadow-sm border px-4 py-2 bg-white"
                style={{
                  borderRadius: "10px",
                  fontWeight: "600",
                  color: "#64748b",
                }}
              >
                Annuler
              </Link>
            </div>

            <div
              className="card border-0 shadow-sm overflow-hidden"
              style={{ borderRadius: "12px" }}
            >
              <div
                style={{
                  height: "6px",
                  background:
                    "#2563eb",
                }}
              ></div>

              <div className="card-body p-4 p-md-5 bg-white">
                {error && (
                  <div
                    className="alert d-flex align-items-center mb-4 border-0"
                    style={{
                      backgroundColor: "#fff1f2",
                      color: "#be123c",
                      borderRadius: "12px",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="me-2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span className="fw-medium">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    {/* Assignation Employé */}
                    <div className="col-12 col-md-6">
                      <label
                        className="form-label fw-bold small text-uppercase mb-2"
                        style={{ color: "#64748b", letterSpacing: "0.05em" }}
                      >
                        Assignation de l'individu
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text border-0 bg-light px-3"
                          style={{ borderRadius: "12px 0 0 12px" }}
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="2"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <select
                          name="employee_id"
                          className={`form-select border-0 bg-light py-2 fw-bold ${
                            validationErrors.employee_id ? "is-invalid" : ""
                          }`}
                          style={{
                            borderRadius: "0 12px 12px 0",
                            height: "50px",
                            color: "#334155",
                          }}
                          value={formData.employee_id || ""}
                          onChange={handleChange}
                        >
                          <option value="">
                            Sélectionner un collaborateur
                          </option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.first_name} {emp.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {validationErrors.employee_id && (
                        <div className="text-danger small mt-1">
                          {validationErrors.employee_id[0]}
                        </div>
                      )}

                      <div
                        className="mt-3 p-3 rounded-3"
                        style={{
                          backgroundColor: "#fffbeb",
                          border: "1px solid #fef3c7",
                        }}
                      >
                        <p className="mb-0 small text-warning-emphasis d-flex align-items-center">
                          <svg
                            width="16"
                            height="16"
                            className="me-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
                          </svg>
                          Action sensible : modifie le lien contractuel du
                          manager.
                        </p>
                      </div>
                    </div>

                    {/* Périmètre de gestion */}
                    <div className="col-12 col-md-6">
                      <label
                        className="form-label fw-bold small text-uppercase mb-2"
                        style={{ color: "#64748b", letterSpacing: "0.05em" }}
                      >
                        Périmètre de gestion
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text border-0 bg-light px-3"
                          style={{ borderRadius: "12px 0 0 12px" }}
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="2"
                          >
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M3 9h18" />
                            <path d="M9 21V9" />
                          </svg>
                        </span>
                        <select
                          name="department_id"
                          className={`form-select border-0 bg-light py-2 fw-bold ${
                            validationErrors.department_id ? "is-invalid" : ""
                          }`}
                          style={{
                            borderRadius: "0 12px 12px 0",
                            height: "50px",
                            color: "#334155",
                          }}
                          value={formData.department_id || ""}
                          onChange={handleChange}
                        >
                          <option value="">Aucun département (Flottant)</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {validationErrors.department_id && (
                        <div className="text-danger small mt-1">
                          {validationErrors.department_id[0]}
                        </div>
                      )}
                    </div>

                    {/* Action Footer */}
                    <div className="col-12 mt-5">
                      <div
                        className="d-flex flex-column flex-md-row align-items-center justify-content-between p-4"
                        style={{
                          backgroundColor: "#1e293b",
                          borderRadius: "16px",
                        }}
                      >
                        <div className="text-white-50 mb-3 mb-md-0 d-flex align-items-center">
                          <svg
                            width="20"
                            height="20"
                            className="me-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          <span className="small">
                            Vérifiez les informations avant de valider.
                          </span>
                        </div>
                        <button
                          type="submit"
                          className="btn px-5 py-3 fw-bold text-white shadow-lg w-100 w-md-auto border-0"
                          style={{
                            background:
                              "#2563eb",
                            borderRadius: "12px",
                            transition: "transform 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "scale(1.02)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        >
                          Mettre à jour le profil
                        </button>
                      </div>
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
