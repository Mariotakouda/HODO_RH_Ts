import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

// --- Icônes SVG ---
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IconEdit = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconDownload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>;
const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2l0 4M8 2l0 4M3 10l18 0"/></svg>;
const IconFileText = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;

/**
 * SKELETON LOADING STATE
 */
const ShowSkeleton = () => (
  <div className="container py-5" style={{ maxWidth: "1000px" }}>
    <style>{`
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      .sk-box { background: #e2e8f0; animation: pulse 1.5s infinite; border-radius: 8px; }
    `}</style>
    <div className="sk-box mb-4" style={{ width: '150px', height: '24px' }}></div>
    <div className="card border-0 shadow-sm p-5" style={{ borderRadius: '16px' }}>
      <div className="sk-box mb-3" style={{ width: '100px', height: '20px' }}></div>
      <div className="sk-box mb-4" style={{ width: '60%', height: '40px' }}></div>
      <div className="row g-4 mb-5 border-bottom pb-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="col-md-4"><div className="sk-box" style={{ height: '60px' }}></div></div>
        ))}
      </div>
      <div className="sk-box mb-3" style={{ width: '200px', height: '25px' }}></div>
      <div className="sk-box" style={{ height: '150px', borderRadius: '16px' }}></div>
    </div>
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
  employee: { first_name: string; last_name: string; email: string };
  creator: { name: string; role: string };
}

export default function TaskShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";
  const routePrefix = isAdmin ? "/admin/tasks" : "/employee/tasks";
  
  const STORAGE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api")
                        .replace('/api', '') + '/storage/';

  const loadTask = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data.data || res.data);
    } catch (error) {
      navigate(routePrefix);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, routePrefix]);

  useEffect(() => { loadTask(); }, [loadTask]);

  const handleDownloadPDF = async (fileUrl: string, fileName: string) => {
    const fullUrl = `${STORAGE_URL}${fileUrl}`;
    setDownloading(fileUrl);
    try {
      // Tentative de téléchargement propre par Blob pour forcer le nom du fichier
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // Fallback : ouverture dans un nouvel onglet si Fetch échoue (CORS/Auth)
      window.open(fullUrl, '_blank');
    } finally {
      setDownloading(null);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { class: string; label: string }> = {
      pending: { class: 'bg-warning-subtle text-warning border-warning-subtle', label: 'En attente' },
      in_progress: { class: 'bg-primary-subtle text-primary border-primary-subtle', label: 'En cours' },
      completed: { class: 'bg-success-subtle text-success border-success-subtle', label: 'Terminée' },
      cancelled: { class: 'bg-danger-subtle text-danger border-danger-subtle', label: 'Annulée' }
    };
    return configs[status] || configs.pending;
  };

  if (loading) return <div className="min-vh-100 bg-light"><ShowSkeleton /></div>;
  if (!task) return null;

  const statusCfg = getStatusConfig(task.status);

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        
        {/* Navigation Supérieure */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button 
            onClick={() => navigate(routePrefix)}
            className="btn btn-link text-decoration-none text-secondary p-0 d-flex align-items-center gap-2 fw-semibold border-0 shadow-none"
          >
            <IconArrowLeft /> Retour à la liste
          </button>
          
          <div className="d-flex gap-2">
            {isAdmin && (
              <button 
                onClick={() => navigate(`${routePrefix}/${task.id}/edit`)}
                className="btn btn-white border shadow-sm px-4 py-2 d-flex align-items-center gap-2 fw-bold text-dark bg-white"
                style={{ borderRadius: '8px' }}
              >
                <IconEdit /> Modifier
              </button>
            )}
          </div>
        </div>

        {/* Corps Principal */}
        <div className="card shadow-sm border-0" style={{ borderRadius: "16px" }}>
          <div className="card-body p-4 p-md-5">
            
            {/* Header de la Carte */}
            <div className="row align-items-start mb-5">
              <div className="col-lg-8">
                <div className={`badge border px-3 py-2 mb-3 rounded-pill fw-bold text-uppercase ${statusCfg.class}`} style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                  {statusCfg.label}
                </div>
                <h1 className="display-6 fw-bold text-dark mb-2" style={{ letterSpacing: '-1px' }}>{task.title}</h1>
                <p className="text-muted mb-0">Mission ID : <span className="text-dark fw-medium">#{task.id}</span></p>
              </div>
            </div>

            {/* Grid des Métadonnées */}
            <div className="row g-4 mb-5 pb-5 border-bottom">
              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light p-3 rounded-3 text-primary"><IconUser /></div>
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">Responsable</div>
                    <div className="fw-bold text-dark">{task.employee.first_name} {task.employee.last_name}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light p-3 rounded-3 text-danger"><IconCalendar /></div>
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">Échéance</div>
                    <div className="fw-bold text-dark">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', month: 'short', year: 'numeric' 
                      }) : 'Non spécifiée'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light p-3 rounded-3 text-secondary"><IconFileText /></div>
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">Émetteur</div>
                    <div className="fw-bold text-dark">{task.creator.name}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Description */}
            <div className="mb-5">
              <h5 className="fw-bold text-dark mb-4">Description et Consignes</h5>
              <div className="p-4 rounded-4 bg-light border-0" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "#4B5563" }}>
                {task.description || "Aucun détail complémentaire."}
              </div>
            </div>

            {/* Section Documents */}
            <h5 className="fw-bold text-dark mb-3">Documents joints</h5>
            <div className="row g-4">
              {/* Document Consignes */}
              <div className="col-md-6">
                <div className="card h-100 border bg-white shadow-none rounded-4">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="p-2 bg-primary-subtle rounded-3 text-primary"><IconFileText /></div>
                      <span className="small text-muted fw-bold">PDF</span>
                    </div>
                    <h6 className="fw-bold mb-1">Cahier des charges</h6>
                    <p className="small text-muted mb-4">Instructions initiales pour la mission.</p>
                    
                    {task.task_file ? (
                      <button
                        onClick={() => handleDownloadPDF(task.task_file!, `Consignes_Task_${task.id}.pdf`)}
                        className="btn btn-dark w-100 py-2 mt-auto fw-bold d-flex align-items-center justify-content-center gap-2"
                        disabled={!!downloading}
                      >
                        {downloading === task.task_file ? <span className="spinner-border spinner-border-sm"></span> : <IconDownload />}
                        Télécharger
                      </button>
                    ) : (
                      <div className="alert alert-light border-0 small mb-0 mt-auto py-2 text-center">Aucun fichier joint</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Rapport */}
              <div className="col-md-6">
                <div className={`card h-100 border shadow-none rounded-4 ${task.report_file ? 'border-success-subtle bg-success-subtle' : 'bg-white'}`}>
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className={`p-2 rounded-3 ${task.report_file ? 'bg-success text-white' : 'bg-light text-muted'}`}><IconFileText /></div>
                      <span className="small text-muted fw-bold text-uppercase">{task.report_file ? 'Soumis' : 'En attente'}</span>
                    </div>
                    <h6 className="fw-bold mb-1 text-dark">Rapport d'exécution</h6>
                    <p className="small text-muted mb-4">Livrable final déposé par le responsable.</p>
                    
                    {task.report_file ? (
                      <button
                        onClick={() => handleDownloadPDF(task.report_file!, `Rapport_Task_${task.id}.pdf`)}
                        className="btn btn-success w-100 py-2 mt-auto fw-bold d-flex align-items-center justify-content-center gap-2"
                        disabled={!!downloading}
                      >
                        {downloading === task.report_file ? <span className="spinner-border spinner-border-sm"></span> : <IconDownload />}
                        Consulter le rapport
                      </button>
                    ) : (
                      <div className="bg-light rounded-3 text-center text-muted small py-2 mt-auto fw-medium border">
                        {task.status === 'completed' ? 'Rapport manquant' : 'Réalisation en cours...'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="text-center mt-5">
          <p className="text-muted small">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')} • Accès sécurisé
          </p>
        </div>
      </div>
    </div>
  );
}