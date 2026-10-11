import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

// --- ICONS SVG (Lucide style) ---
const Icons = {
  Target: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  File: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
  Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
};

/**
 * SKELETON STATE
 */
const CreateSkeleton = () => (
  <div className="container py-5" style={{ maxWidth: "800px" }}>
    <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } } .sk { background: #eef2f7; animation: pulse 1.5s infinite; border-radius: 12px; }`}</style>
    <div className="sk mb-4" style={{ width: '250px', height: '35px' }}></div>
    <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '12px' }}>
        {[1, 2, 3, 4].map(i => <div key={i} className="mb-4"><div className="sk mb-2" style={{ width: '120px', height: '20px' }}></div><div className="sk" style={{ width: '100%', height: '50px' }}></div></div>)}
        <div className="sk mt-3" style={{ width: '100%', height: '60px' }}></div>
    </div>
  </div>
);

export default function TaskCreate() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) as any;

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    employee_id: "",
    due_date: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const isAdmin = user?.role === "admin";

  const initData = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      const [mgrRes, empRes] = await Promise.all([
        api.get("/check-manager-status"),
        api.get("/employees")
      ]);
      setIsManager(mgrRes.data.is_manager || false);
      setEmployees(empRes.data.data || empRes.data || []);
    } catch (err: any) {
      setError("Erreur lors de l'initialisation des données.");
    } finally {
      setTimeout(() => setLoadingEmployees(false), 500);
    }
  }, []);

  useEffect(() => { initData(); }, [initData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id) return alert("Veuillez assigner un employé.");

    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    if (file) formData.append("task_file", file);

    try {
      await api.post("/tasks", formData, { headers: { "Content-Type": "multipart/form-data" } });
      alert("Mission créée avec succès !");
      const path = isAdmin ? "/admin/tasks" : (isManager ? "/employee/team-tasks" : "/employee/tasks");
      navigate(path);
    } catch (err: any) {
      alert("Erreur : " + (err.response?.data?.message || "Échec de création"));
    } finally {
      setLoading(false);
    }
  };

  if (loadingEmployees) return <div className="min-vh-100 bg-light"><CreateSkeleton /></div>;

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="container" style={{ maxWidth: "850px" }}>
        
        {/* Header Section */}
        <div className="mb-4 d-flex align-items-center justify-content-between">
            <div>
                <h2 className="h3 fw-bold text-dark d-flex align-items-center gap-3 mb-1">
                    <Icons.Target /> Nouvelle Mission
                </h2>
                <p className="text-muted mb-0">
                    {isAdmin ? "Assignation globale" : "Gestion d'équipe : " + user?.department?.name}
                </p>
            </div>
            <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                Retour
            </button>
        </div>

        {error && (
            <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4 d-flex align-items-center">
                <Icons.Alert /> <span className="ms-2">{error}</span>
            </div>
        )}

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              
              {/* Titre & Description */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark small mb-2 uppercase-label">Désignation de la tâche</label>
                <input 
                  type="text" 
                  className="form-control custom-field fs-5" 
                  required 
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})} 
                  placeholder="Ex: Rédaction du rapport trimestriel..."
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-dark small mb-2 uppercase-label">Consignes détaillées</label>
                <textarea 
                  className="form-control custom-field" 
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})} 
                  placeholder="Quels sont les objectifs et les livrables attendus ?"
                />
              </div>

              <div className="row g-4 mb-4">
                {/* Employee Select */}
                <div className="col-md-7">
                  <label className="form-label fw-bold text-dark small mb-2 d-flex align-items-center gap-2">
                    <Icons.User /> Assignation
                  </label>
                  <select 
                    className="form-select custom-field" 
                    required 
                    value={form.employee_id}
                    onChange={e => setForm({...form, employee_id: e.target.value})} 
                  >
                    <option value="">Sélectionner un collaborateur</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} {emp.department ? `(${emp.department.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div className="col-md-5">
                  <label className="form-label fw-bold text-dark small mb-2 d-flex align-items-center gap-2">
                    <Icons.Calendar /> Échéance
                  </label>
                  <input 
                    type="date" 
                    className="form-control custom-field" 
                    value={form.due_date}
                    onChange={e => setForm({...form, due_date: e.target.value})} 
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Upload Zone */}
              <div className="mb-5">
                <label className="form-label fw-bold text-dark small mb-2 uppercase-label">Fichier de référence (PDF)</label>
                <div className="upload-wrapper">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="upload-input"
                  />
                  <div className="upload-placeholder">
                    <div className="icon-box mb-2"><Icons.Upload /></div>
                    <span className="fw-bold d-block">{file ? file.name : "Glissez un fichier ou cliquez ici"}</span>
                    <span className="text-muted small">Format PDF uniquement - Max 10Mo</span>
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="d-flex flex-column flex-md-row gap-3 pt-4 border-top">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary flex-grow-1 py-3 fw-bold rounded-3 shadow-sm"
                >
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : "Lancer la mission"}
                </button>
                <button 
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-light px-4 py-3 fw-bold text-muted border"
                  style={{ borderRadius: '12px' }}
                >
                  Annuler
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      <style>{`
        .uppercase-label { text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.75rem; color: #64748b; }
        .custom-field {
          border: 2px solid #f1f5f9 !important;
          background-color: #f8fafc !important;
          padding: 14px 18px;
          border-radius: 14px !important;
          transition: all 0.2s ease;
        }
        .custom-field:focus {
          border-color: #3b82f6 !important;
          background-color: #fff !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }
        .upload-wrapper {
          position: relative;
          border: 2px dashed #e2e8f0;
          border-radius: 16px;
          background: #fff;
          transition: all 0.2s ease;
        }
        .upload-wrapper:hover { border-color: #3b82f6; background: #f0f7ff; }
        .upload-input {
          position: absolute;
          width: 100%; height: 100%;
          top: 0; left: 0;
          opacity: 0; cursor: pointer;
          z-index: 2;
        }
        .upload-placeholder {
          padding: 30px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .icon-box {
          width: 48px; height: 48px;
          background: #eff6ff;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: #3b82f6;
        }
        .btn-primary {
          background-color: #0d6efd;
          border: none;
          border-radius: 14px;
          transition: transform 0.1s ease;
        }
        .btn-primary:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
}