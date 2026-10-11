import { useState, useEffect, useContext, memo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { createAnnouncement, checkManagerStatus } from "./service";
import { EmployeeService } from "../employees/service";
import { DepartmentService } from "../departments/service";
import type { Employee } from "../employees/model";

// --- Composants d'icônes mémoïsés ---
const IconSend = memo(() => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const IconAlert = memo(() => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>);

const AnnouncementSkeleton = () => (
  <div className="container py-4 py-lg-5" style={{ maxWidth: "1000px" }}>
    <div className="skeleton mb-4" style={{ width: '200px', height: '24px', borderRadius: '4px' }}></div>
    <div className="skeleton mb-5" style={{ width: '350px', height: '40px', borderRadius: '8px' }}></div>
    <div className="card border-0 shadow-sm p-5" style={{ borderRadius: '12px' }}>
      <div className="row">
        <div className="col-lg-4"><div className="skeleton mb-3" style={{ width: '80%', height: '80px' }}></div></div>
        <div className="col-lg-8"><div className="skeleton mb-3" style={{ width: '100%', height: '80px' }}></div></div>
      </div>
      <hr className="my-5 opacity-25" />
      <div className="row">
        <div className="col-lg-4"><div className="skeleton mb-3" style={{ width: '80%', height: '80px' }}></div></div>
        <div className="col-lg-8"><div className="skeleton mb-3" style={{ width: '100%', height: '200px' }}></div></div>
      </div>
    </div>
  </div>
);

export default function AnnouncementCreate() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [targetType, setTargetType] = useState<"general" | "department" | "employee">("general");

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    department_id: null as number | null,
    employee_id: null as number | null,
    is_general: true,
  });

  const [managerInfo, setManagerInfo] = useState({ is_manager: false, dept_name: "" });

  useEffect(() => {
    // Si pas d'utilisateur, on ne tente rien (évite les erreurs au montage)
    if (!user) return;

    let isMounted = true;

    async function init() {
      try {
        setLoading(true);
        // On vérifie le rôle directement ici car TS sait que user existe grâce au check plus haut
        const isAdmin = user?.role === 'admin';

        const [status, empData, deptResponse] = await Promise.all([
          checkManagerStatus(),
          isAdmin ? EmployeeService.fetchAllForSelect() : Promise.resolve([]),
          isAdmin ? DepartmentService.list() : Promise.resolve({ data: [] })
        ]);

        if (!isMounted) return;

        if (status.is_manager) {
          setManagerInfo({ is_manager: true, dept_name: status.department_name || "votre département" });
          if (!isAdmin) {
            setTargetType("department");
            setFormData(p => ({ ...p, department_id: status.department_id, is_general: false }));
          }
        }

        if (isAdmin) {
          setEmployees(empData);
          setDepartments(deptResponse.data || []);
        }
      } catch (err) {
        setError("Erreur lors de l'initialisation du formulaire.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();
    return () => { isMounted = false; };
  }, [user]);

  const handleTargetChange = (type: "general" | "department" | "employee") => {
    setTargetType(type);
    setFormData(prev => ({
      ...prev,
      is_general: type === "general",
      department_id: null,
      employee_id: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !user) return;

    setSubmitting(true);
    setError("");
    
    try {
      await createAnnouncement(formData);
      const path = user.role === 'admin' ? "/admin/announcements" : "/employee/announcements";
      navigate(path);
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de la publication.");
      setSubmitting(false);
    }
  };

  // --- GARDE TS : Si user est null ou en chargement, on affiche le skeleton ---
  if (!user || loading) return (
    <>
      <style>{`.skeleton { background: linear-gradient(90deg, #f2f2f2 25%, #fafafa 50%, #f2f2f2 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 4px; } @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <AnnouncementSkeleton />
    </>
  );

  return (
    <div className="bg-light min-vh-100 py-4 py-lg-5">
      <div className="container" style={{ maxWidth: "1000px" }}>
        
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-2 small text-uppercase fw-bold">
                <li className="breadcrumb-item"><span className="text-muted">Communications</span></li>
                <li className="breadcrumb-item active text-primary">Nouveau</li>
              </ol>
            </nav>
            <h2 className="fw-bold text-dark mb-0 d-flex align-items-center">
               Publier une annonce
            </h2>
          </div>
          <button onClick={() => navigate(-1)} className="btn btn-white border shadow-sm px-4 fw-bold text-muted">
            Retour
          </button>
        </div>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center p-3 text-danger animate-fade-in">
            <IconAlert /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card border-0 shadow-lg rounded-4 overflow-hidden">
          <div style={{ height: "5px", background: "#2563eb" }}></div>
          
          <div className="card-body p-4 p-md-5 bg-white">
            <div className="row mb-5">
              <div className="col-lg-4 border-end-lg">
                <h5 className="fw-bold text-dark mb-2">Audience</h5>
                <p className="text-muted small">Ciblez précisément les destinataires.</p>
              </div>
              <div className="col-lg-8 ps-lg-4">
                {managerInfo.is_manager && user.role !== 'admin' ? (
                  <div className="p-4 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10">
                    <span className="badge bg-primary mb-2 px-3 rounded-pill">Mode Manager</span>
                    <h6 className="fw-bold text-dark mb-1">Département : {managerInfo.dept_name}</h6>
                    <p className="small text-muted mb-0">En tant que superviseur, votre annonce sera visible par votre équipe.</p>
                  </div>
                ) : (
                  <div className="bg-light p-1 rounded-4 d-flex gap-1 mb-4 shadow-sm">
                    {(['general', 'department', 'employee'] as const).map((t) => (
                      <button 
                        key={t} type="button"
                        onClick={() => handleTargetChange(t)}
                        className={`btn flex-fill py-3 fw-bold border-0 rounded-3 transition-all ${targetType === t ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                      >
                        {t === 'general' ? 'Tout le monde' : t === 'department' ? 'Département' : 'Individuel'}
                      </button>
                    ))}
                  </div>
                )}

                {user.role === 'admin' && targetType !== "general" && (
                  <div className="animate-fade-in mt-3">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Sélectionner la cible</label>
                    <select 
                      className="form-select form-select-lg border-2 shadow-none py-3 px-4 rounded-3" 
                      value={targetType === 'department' ? (formData.department_id || "") : (formData.employee_id || "")}
                      onChange={e => setFormData({
                        ...formData, 
                        [targetType === 'department' ? 'department_id' : 'employee_id']: e.target.value ? Number(e.target.value) : null
                      })}
                      required
                    >
                      <option value="">Choisir dans la liste...</option>
                      {targetType === "department" 
                        ? departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                        : employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)
                      }
                    </select>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-5 opacity-25" />

            <div className="row mb-4">
              <div className="col-lg-4 border-end-lg">
                <h5 className="fw-bold text-dark mb-2">Message</h5>
                <p className="text-muted small">Rédigez un titre accrocheur.</p>
              </div>
              <div className="col-lg-8 ps-lg-4">
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted text-uppercase">Sujet de l'annonce</label>
                  <input 
                    type="text" className="form-control form-control-lg border-2 shadow-none py-3 px-4 rounded-3 fw-bold" 
                    placeholder="Ex: Réunion d'équipe..."
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label className="form-label fw-bold small text-muted text-uppercase">Corps du message</label>
                  <textarea 
                    className="form-control border-2 shadow-none p-4 rounded-3" 
                    rows={6} 
                    placeholder="Saisissez votre message ici..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    style={{ fontSize: '1.05rem' }}
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="row mt-5">
              <div className="col-lg-8 offset-lg-4 ps-lg-4">
                <button 
                  type="submit" disabled={submitting} 
                  className="btn btn-primary btn-lg w-100 py-3 fw-bold shadow-sm border-0 rounded-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-3"></span> Publication...</>
                  ) : (
                    <><IconSend /> Publier l'annonce maintenant</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <style>{`
        .btn-white { background: #fff; }
        .btn-white:hover { background: #f8f9fa; }
        .border-end-lg { border-right: 1px solid #f0f0f0; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 991px) { .border-end-lg { border-right: none; border-bottom: 1px solid #f0f0f0; margin-bottom: 1rem; padding-bottom: 1rem; } }
      `}</style>
    </div>
  );
}