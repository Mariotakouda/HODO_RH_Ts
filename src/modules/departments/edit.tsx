import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DepartmentService } from "./service";
import { api } from "../../api/axios";

interface Manager {
  id: number;
  full_name: string;
  email: string;
}

/**
 * COMPOSANT SKELETON POUR LE FORMULAIRE
 */
const EditSkeleton = () => (
  <div className="container-fluid py-4 px-3 px-md-5" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
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
    <div className="mx-auto" style={{ maxWidth: "800px" }}>
      <div className="skeleton-shimmer mb-3" style={{ width: '150px', height: '24px', borderRadius: '4px' }}></div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="skeleton-shimmer" style={{ width: '60px', height: '60px', borderRadius: '8px' }}></div>
        <div className="skeleton-shimmer" style={{ width: '250px', height: '32px', borderRadius: '4px' }}></div>
      </div>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4">
            <div className="skeleton-shimmer mb-2" style={{ width: '150px', height: '16px' }}></div>
            <div className="skeleton-shimmer w-100" style={{ height: '50px', borderRadius: '8px' }}></div>
          </div>
        ))}
        <div className="d-flex gap-3">
          <div className="skeleton-shimmer" style={{ width: '180px', height: '50px', borderRadius: '8px' }}></div>
          <div className="skeleton-shimmer" style={{ width: '120px', height: '50px', borderRadius: '8px' }}></div>
        </div>
      </div>
    </div>
  </div>
);

export default function DepartmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    manager_id: ""
  });
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadManagers = useCallback(async () => {
    try {
      const res = await api.get("/managers");
      let fetchedManagers = [];
      if (Array.isArray(res.data.data)) {
        fetchedManagers = res.data.data;
      } else if (Array.isArray(res.data)) {
        fetchedManagers = res.data;
      }
      setManagers(fetchedManagers);
    } catch (err) {
      console.error("❌ Erreur chargement managers:", err);
      setManagers([]);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DepartmentService.get(Number(id));
      setForm({
        name: data.name,
        description: data.description || "",
        manager_id: data.manager_id ? String(data.manager_id) : ""
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadManagers();
    load();
  }, [load, loadManagers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: form.name,
        description: form.description,
        manager_id: form.manager_id ? Number(form.manager_id) : null
      };
      await DepartmentService.update(Number(id), payload);
      navigate("/admin/departments", { state: { refresh: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  // --- RENDU DE CHARGEMENT ---
  if (loading) return <EditSkeleton />;

  return (
    <div className="container-fluid py-4 px-3 px-md-5" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div className="mx-auto" style={{ maxWidth: "800px" }}>
        
        {/* Navigation */}
        <Link to="/admin/departments" className="btn btn-link text-decoration-none text-muted p-0 mb-3 d-flex align-items-center gap-2 fw-bold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          RETOUR À LA LISTE
        </Link>

        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="bg-white shadow-sm p-3 rounded-3 border">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <h2 className="fw-bold text-dark m-0">Modifier le département</h2>
        </div>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4 d-flex align-items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <form onSubmit={submit} className="card-body p-4 p-md-5">
            <div className="row g-4">
              
              {/* Nom du département */}
              <div className="col-12">
                <label className="form-label fw-bold text-muted small text-uppercase">Nom du département <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                  </span>
                  <input 
                    type="text" 
                    name="name"
                    className="form-control form-control-lg bg-light border-start-0 fs-6"
                    placeholder="ex: Ressources Humaines"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Manager */}
              <div className="col-12">
                <label className="form-label fw-bold text-muted small text-uppercase">Manager Responsable</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <select 
                    name="manager_id"
                    className="form-select form-select-lg bg-light border-start-0 fs-6"
                    value={form.manager_id}
                    onChange={handleChange}
                  >
                    <option value="">-- Aucun manager --</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="col-12">
                <label className="form-label fw-bold text-muted small text-uppercase">Description</label>
                <textarea 
                  name="description"
                  className="form-control bg-light fs-6"
                  rows={5}
                  placeholder="Décrivez les missions du département..."
                  value={form.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Actions */}
              <div className="col-12 pt-3">
                <div className="d-flex flex-column flex-md-row gap-3 mt-2">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="btn btn-warning btn-lg px-5 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                    style={{ minWidth: "200px" }}
                  >
                    {saving ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {saving ? "Enregistrement..." : "Mettre à jour"}
                  </button>
                  
                  <Link to="/admin/departments" className="btn btn-light btn-lg px-4 fw-bold text-muted border shadow-sm">
                    Annuler
                  </Link>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}