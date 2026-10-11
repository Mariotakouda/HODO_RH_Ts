import React, { useCallback, useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

// --- Icônes ---
const IconFile = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

// --- Skeleton Component ---
const TaskDetailSkeleton = () => (
    <div className="container py-4 py-lg-5" style={{ maxWidth: '850px' }}>
        <style>{`
            @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
            .skeleton-box { background: #e2e8f0; animation: pulse 1.5s infinite; border-radius: 8px; }
        `}</style>
        <div className="d-flex justify-content-between mb-4">
            <div className="skeleton-box" style={{ width: '200px', height: '28px' }}></div>
            <div className="skeleton-box" style={{ width: '100px', height: '38px' }}></div>
        </div>
        <div className="skeleton-box mb-4" style={{ width: '100%', height: '350px', borderRadius: '20px' }}></div>
        <div className="skeleton-box" style={{ width: '100%', height: '150px', borderRadius: '20px' }}></div>
    </div>
);

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  task_file: string | null;
  report_file: string | null;
  employee_id: number;
  creator: { name: string; role: string };
}

export default function EmployeeTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Suppression de 'user' ici pour éviter l'erreur ts(6133)
  const { } = useContext(AuthContext); 
  const [task, setTask] = useState<Task | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isTaskOwner, setIsTaskOwner] = useState(false);

  const getStorageUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const baseUrl = apiUrl ? apiUrl.replace('/api', '') : "http://localhost:8000";
    return `${baseUrl}/storage/`;
  };

  const loadTask = useCallback(async () => {
    try {
      setLoading(true);
      const [taskRes, meRes] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get('/me')
      ]);

      const taskData = taskRes.data.data || taskRes.data;
      const userData = meRes.data;

      setTask(taskData);

      const currentUserEmployeeId = userData.employee?.id;
      const taskAssignedTo = taskData.employee_id;

      setIsTaskOwner(!!currentUserEmployeeId && currentUserEmployeeId === taskAssignedTo);
    } catch (err) {
      console.error("Erreur chargement mission:", err);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) loadTask();
  }, [id, loadTask]);

  const handleDownloadPDF = async (e: React.MouseEvent, fileUrl: string, fileName: string) => {
    e.preventDefault();
    setDownloading(fileUrl);
    try {
      const response = await fetch(`${getStorageUrl()}${fileUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(`${getStorageUrl()}${fileUrl}`, '_blank');
    } finally {
      setDownloading(null);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Veuillez sélectionner un fichier PDF.");
      return;
    }

    const formData = new FormData();
    formData.append('report_file', file);

    setUploading(true);
    try {
      await api.post(`/tasks/${id}/submit-report`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("✅ Rapport envoyé avec succès !");
      setFile(null);
      loadTask(); 
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erreur lors de l'envoi du rapport.";
      alert(`❌ ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <TaskDetailSkeleton />;
  
  if (!task) return null;

  return (
    <div className="container py-4 py-lg-5" style={{ maxWidth: '850px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-2">
        <h2 className="h4 fw-bold mb-0">Détails de la mission</h2>
        <button onClick={() => navigate(-1)} className="btn btn-white border shadow-sm btn-sm px-3 d-flex align-items-center gap-2">
          <IconArrowLeft /> <span>Retour</span>
        </button>
      </div>

      {/* Carte Détails */}
      <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
        <div className="card-body p-4 p-md-5 bg-white">
          <div className="mb-4">
            <h1 className="h3 fw-bold mb-3">{task.title}</h1>
            <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill fw-bold text-uppercase" style={{ fontSize: '11px' }}>
              {task.status}
            </span>
          </div>

          <div className="bg-light p-4 rounded-3 mb-4 text-secondary" style={{ whiteSpace: "pre-wrap" }}>
            {task.description || "Aucune consigne spécifique."}
          </div>

          <div className="row g-4 mb-2">
            <div className="col-md-6">
              <label className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-2 mb-2">
                <IconCalendar /> Échéance
              </label>
              <div className="p-2 border rounded bg-white fw-bold">
                {new Date(task.due_date).toLocaleDateString()}
              </div>
            </div>
            <div className="col-md-6">
              <label className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-2 mb-2">
                <IconUser /> Créé par
              </label>
              <div className="p-2 border rounded bg-white fw-bold">
                {task.creator.name}
              </div>
            </div>
          </div>

          {task.task_file && (
            <div className="mt-4 pt-3 border-top">
              <button 
                onClick={(e) => handleDownloadPDF(e, task.task_file!, 'consignes.pdf')}
                disabled={downloading === task.task_file}
                className="btn btn-outline-dark d-flex align-items-center gap-2"
              >
                {downloading === task.task_file ? <span className="spinner-border spinner-border-sm"></span> : <IconDownload />}
                Télécharger les consignes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section Rapport */}
      {isTaskOwner && (
        <div className={`card shadow-sm border-0 rounded-4 overflow-hidden ${task.report_file ? 'border-success' : ''}`}>
          <div className={`card-body p-4 p-md-5 ${task.report_file ? 'bg-success-subtle' : 'bg-white'}`}>
            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
              {task.report_file ? <IconCheck /> : <IconUpload />}
              {task.report_file ? 'Mission terminée' : 'Soumettre votre rapport'}
            </h4>

            {task.report_file ? (
              <div className="d-flex flex-column gap-3">
                <p className="text-muted mb-0">Vous avez déjà soumis un rapport pour cette mission.</p>
                <button 
                  onClick={(e) => handleDownloadPDF(e, task.report_file!, 'mon-rapport.pdf')}
                  disabled={downloading === task.report_file}
                  className="btn btn-success d-flex align-items-center gap-2 align-self-start"
                >
                  <IconFile /> {downloading === task.report_file ? 'Ouverture...' : 'Voir mon rapport soumis'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Fichier du rapport (PDF uniquement)</label>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className={`form-control border-2 border-dashed shadow-none ${file ? 'border-primary' : ''}`} 
                    disabled={uploading}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!file || uploading} 
                  className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                >
                  {uploading ? <span className="spinner-border spinner-border-sm"></span> : <IconUpload />}
                  {uploading ? 'Envoi en cours...' : 'Confirmer et terminer la mission'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {!isTaskOwner && task.report_file && (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden border-success">
          <div className="card-body p-4 p-md-5 bg-success-subtle">
            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <IconCheck /> Rapport soumis par l'employé
            </h4>
            <button 
              onClick={(e) => handleDownloadPDF(e, task.report_file!, 'rapport-employe.pdf')}
              disabled={downloading === task.report_file}
              className="btn btn-success d-flex align-items-center gap-2"
            >
              <IconFile /> {downloading === task.report_file ? 'Ouverture...' : 'Télécharger le rapport'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}