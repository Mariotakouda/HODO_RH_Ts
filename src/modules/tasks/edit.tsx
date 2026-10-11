import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TaskService } from "./service";
import { api } from "../../api/axios";

// --- ICONS SVG ---
const Icons = {
  Edit: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2-2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  File: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  ArrowLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
};

/**
 * SKELETON STATE POUR LE FORMULAIRE
 */
const EditSkeleton = () => (
  <div className="container py-5" style={{ maxWidth: "800px" }}>
    <style>{`
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      .sk-item { background: #eef2f7; animation: pulse 1.5s infinite; border-radius: 8px; mb-3; }
    `}</style>
    <div className="sk-item mb-4" style={{ width: '200px', height: '30px' }}></div>
    <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '16px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="mb-4">
          <div className="sk-item mb-2" style={{ width: '150px', height: '20px' }}></div>
          <div className="sk-item" style={{ width: '100%', height: '50px' }}></div>
        </div>
      ))}
      <div className="d-flex gap-3 mt-4">
        <div className="sk-item flex-grow-1" style={{ height: '55px' }}></div>
        <div className="sk-item" style={{ width: '120px', height: '55px' }}></div>
      </div>
    </div>
  </div>
);

export default function TaskEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    employee_id: "",
    due_date: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const init = useCallback(async () => {
    try {
      setLoading(true);
      const [empRes, taskData] = await Promise.all([
        api.get("/employees"),
        TaskService.show(Number(id))
      ]);
      setEmployees(empRes.data.data || empRes.data || []);
      setForm({
        title: taskData.title || "",
        description: taskData.description || "",
        status: taskData.status || "pending",
        employee_id: taskData.employee_id ? String(taskData.employee_id) : "",
        due_date: taskData.due_date ? taskData.due_date.split('T')[0].split(' ')[0] : "", 
      });
    } catch (error) {
      navigate(-1);
    } finally {
      setTimeout(() => setLoading(false), 500); // Petit délai pour fluidité
    }
  }, [id, navigate]);

  useEffect(() => { init(); }, [init]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("_method", "PUT"); 
    formData.append("title", form.title);
    formData.append("description", form.description || "");
    formData.append("status", form.status);
    formData.append("due_date", form.due_date || "");
    if (form.employee_id) formData.append("employee_id", form.employee_id);
    if (file) formData.append("task_file", file);

    try {
      await api.post(`/tasks/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate(-1); 
    } catch (error: any) {
      alert("Erreur de mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-vh-100 bg-light"><EditSkeleton /></div>;

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-white border shadow-sm rounded-3 p-2 me-3 d-flex align-items-center justify-content-center"
            style={{ width: '42px', height: '42px', backgroundColor: '#fff' }}
          >
            <Icons.ArrowLeft />
          </button>
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-1">
                <li className="breadcrumb-item small text-muted">Missions</li>
                <li className="breadcrumb-item small text-muted active">Modifier</li>
              </ol>
            </nav>
            <h2 className="h4 mb-0 fw-bold text-dark">Édition de la mission #{id}</h2>
          </div>
        </div>

        {/* Form Card */}
        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "12px" }}>
          <div className="card-body p-4 p-md-5">
            <form onSubmit={submit}>
              
              {/* Titre */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-2">Titre de la mission</label>
                <input 
                  className="form-control custom-input"
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  required 
                  placeholder="Ex: Analyse des besoins..."
                />
              </div>

              <div className="row g-4 mb-4">
                {/* Responsable */}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark mb-2">Responsable assigné</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0"><Icons.User /></span>
                    <select 
                      className="form-select custom-input border-start-0 ps-0"
                      value={form.employee_id} 
                      onChange={e => setForm({...form, employee_id: e.target.value})}
                    >
                      <option value="">Non assignée</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark mb-2">Date d'échéance</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0"><Icons.Calendar /></span>
                    <input 
                      type="date"
                      className="form-control custom-input border-start-0 ps-0"
                      value={form.due_date} 
                      onChange={e => setForm({...form, due_date: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Statut avec badges couleurs */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-2">Statut de la mission</label>
                <select 
                  className={`form-select custom-input fw-semibold status-select ${form.status}`}
                  value={form.status} 
                  onChange={e => setForm({...form, status: e.target.value})}
                >
                  <option value="pending">🟡 En attente</option>
                  <option value="in_progress">🔵 En cours</option>
                  <option value="completed">🟢 Terminée</option>
                  <option value="cancelled">🔴 Annulée</option>
                </select>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-2">Description / Instructions</label>
                <textarea 
                  className="form-control custom-input"
                  rows={5}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Détails de la mission..."
                />
              </div>

              {/* Upload */}
              <div className="mb-5">
                <label className="form-label fw-bold text-dark mb-2">Mettre à jour le document PDF</label>
                <div className="upload-zone">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={e => setFile(e.target.files?.[0] || null)} 
                    className="file-input"
                  />
                  <div className="upload-content py-4">
                    <div className="text-primary mb-2"><Icons.Upload /></div>
                    <span className="fw-bold">{file ? file.name : "Cliquez pour sélectionner un nouveau PDF"}</span>
                    <p className="text-muted small mb-0">Laissez vide pour conserver le document actuel</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex flex-column flex-sm-row gap-3">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary flex-grow-1 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{ borderRadius: '12px' }}
                >
                  {isSubmitting ? <span className="spinner-border spinner-border-sm"></span> : "Mettre à jour la mission"}
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  className="btn btn-light px-4 py-3 fw-bold text-secondary"
                  style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                >
                  Annuler
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      <style>{`
        .custom-input {
          border: 2px solid #f1f5f9 !important;
          background-color: #f8fafc !important;
          padding: 12px 16px;
          border-radius: 12px !important;
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }
        .custom-input:focus {
          border-color: #3b82f6 !important;
          background-color: #fff !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }
        .input-group-text {
          border: 2px solid #f1f5f9;
          border-radius: 12px 0 0 12px !important;
          color: #94a3b8;
        }
        .upload-zone {
          position: relative;
          border: 2px dashed #e2e8f0;
          border-radius: 16px;
          text-align: center;
          transition: all 0.2s ease;
          background: #fff;
        }
        .upload-zone:hover {
          border-color: #3b82f6;
          background: #f0f7ff;
        }
        .file-input {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          opacity: 0;
          cursor: pointer;
        }
        .status-select.completed { border-color: #10b981 !important; }
        .status-select.in_progress { border-color: #3b82f6 !important; }
        .status-select.pending { border-color: #f59e0b !important; }
        .status-select.cancelled { border-color: #ef4444 !important; }
      `}</style>
    </div>
  );
}