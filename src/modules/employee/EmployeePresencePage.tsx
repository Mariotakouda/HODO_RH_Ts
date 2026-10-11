import { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  checkIn,
  checkOut,
  getMyPresences,
  getPresenceStats,
  hasActiveCheckIn,
  isToday,
  type EmployeePresence,
} from "../presences/service";
import { errorMessage } from "../../lib/api/errors";
import toast from "react-hot-toast";

// --- Icônes SVG ---
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;

export default function EmployeePresencePage() {
  const { employee } = useContext(AuthContext);
  const [presences, setPresences] = useState<EmployeePresence[]>([]);
  const [activePresence, setActivePresence] = useState<EmployeePresence | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadPresences();
  }, []);

  const loadPresences = async () => {
    try {
      setLoading(true);
      
      // OPTIMISATION : Lancement des requêtes en parallèle
      const [data, status] = await Promise.all([
        getMyPresences(),
        hasActiveCheckIn()
      ]);

      setPresences(data);
      setActivePresence(status.active ? status.presence || null : null);
    } catch (err) {
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  const formatPresenceTime = (dateString: string | null) => {
    if (!dateString) return "--:--";
    const dateStr = dateString.endsWith('Z') ? dateString : dateString.replace(' ', 'T') + 'Z';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleCheckIn = async () => {
    if (!employee?.id) return;
    try {
      setActionLoading(true);
      const newPresence = await checkIn();
      setActivePresence(newPresence);
      await loadPresences();
      toast.success("Pointage d'arrivée enregistré");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activePresence) return;
    if (!window.confirm("Voulez-vous valider votre fin de service ?")) return;
    try {
      setActionLoading(true);
      await checkOut(activePresence.id);
      setActivePresence(null);
      await loadPresences();
      toast.success("Pointage de sortie enregistré");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const stats = useMemo(() => getPresenceStats(presences), [presences]);
  const todayPresence = presences.find((p) => isToday(p.date) && !!p.check_in);

  return (
    <div className="bg-light min-vh-100 pb-5">
      <style>{`
        .skeleton { animation: skeleton-loading 1s linear infinite alternate; background-color: #e9ecef; border-radius: 4px; }
        @keyframes skeleton-loading { 0% { background-color: #e9ecef; } 100% { background-color: #f8f9fa; } }
        .ls-1 { letter-spacing: 0.5px; }
        .border-top-primary { border-top: 4px solid #0d6efd !important; }
        @media (max-width: 425px) {
          .mobile-time { font-size: 1.75rem !important; }
          .responsive-table thead { display: none; }
          .responsive-table tr { display: block; padding: 10px 5px; border-bottom: 1px solid #eee; }
          .responsive-table td { display: flex; justify-content: space-between; align-items: center; border: none !important; padding: 4px 10px !important; }
          .responsive-table td::before { content: attr(data-label); font-weight: bold; color: #6c757d; text-transform: uppercase; font-size: 0.65rem; }
        }
      `}</style>

      {/* HEADER BAR */}
      <div className="bg-white border-bottom shadow-sm mb-3 mb-md-4">
        <div className="container py-3">
          <div className="row align-items-center g-2 g-md-3">
            <div className="col-12 col-md-6 text-center text-md-start">
              <h1 className="h5 fw-bold mb-1">Espace Présence</h1>
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                {loading ? <div className="skeleton" style={{width: '120px', height: '24px', borderRadius: '20px'}} /> : (
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1" style={{ fontSize: "0.75rem" }}>
                    {employee?.first_name} {employee?.last_name}
                  </span>
                )}
              </div>
            </div>
            <div className="col-12 col-md-6 text-center text-md-end">
              <div className="h2 fw-bold text-dark mb-0 mobile-time">{currentTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
              <div className="text-primary fw-medium small text-uppercase ls-1">{currentTime.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-2 px-md-3">
        {error && <div className="alert alert-danger border-0 shadow-sm mb-3 small py-2">{error}</div>}

        <div className="row g-3 g-md-4">
          {/* ZONE DE POINTAGE ACTIVE */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100 border-top-primary">
              <div className="card-body p-4 p-md-5 text-center">
                {loading ? (
                  <div className="py-4">
                    <div className="skeleton mx-auto rounded-circle mb-4" style={{width: '80px', height: '80px'}} />
                    <div className="skeleton mx-auto mb-3" style={{width: '60%', height: '30px'}} />
                    <div className="skeleton mx-auto mb-4" style={{width: '40%', height: '20px'}} />
                    <div className="skeleton mx-auto" style={{width: '100%', height: '55px', borderRadius: '12px'}} />
                  </div>
                ) : activePresence ? (
                  <div className="animate-fade-in">
                    <div className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold mb-3 border border-success-subtle">SESSION ACTIVE</div>
                    <p className="text-muted small mb-1">Arrivée enregistrée</p>
                    <div className="display-4 fw-bold text-dark mb-4">{formatPresenceTime(activePresence.check_in)}</div>
                    <button onClick={handleCheckOut} disabled={actionLoading} className="btn btn-danger btn-lg w-100 rounded-4 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all">
                      {actionLoading ? <span className="spinner-border spinner-border-sm" /> : <LogOutIcon />} Terminer service
                    </button>
                  </div>
                ) : (
                  <div className="py-2 animate-fade-in">
                    <div className="text-primary bg-primary-subtle d-inline-block p-4 rounded-circle mb-4"><MapPinIcon /></div>
                    <h3 className="fw-bold text-dark h5 mb-2">Prêt pour votre service ?</h3>
                    <p className="text-muted mx-auto mb-4 small" style={{ maxWidth: "260px" }}>Enregistrez votre arrivée pour commencer votre journée.</p>
                    <button onClick={handleCheckIn} disabled={actionLoading || !!todayPresence} className={`btn btn-lg w-100 rounded-4 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${todayPresence ? "btn-light border text-muted" : "btn-primary"}`}>
                      {todayPresence ? <CheckIcon /> : <ClockIcon />} {todayPresence ? "Service terminé" : "Pointer mon arrivée"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RÉSUMÉ MENSUEL */}
          <div className="col-12 col-lg-4">
            <div className="row g-2 g-md-3">
              {[1, 2].map((i) => (
                <div key={i} className="col-6 col-lg-12">
                  <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 h-100">
                    <div className="d-flex align-items-center gap-3">
                      <div className={`p-3 rounded-3 d-none d-sm-block ${i === 1 ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'}`}>
                        {i === 1 ? <ClockIcon /> : <CalendarIcon />}
                      </div>
                      <div className="w-100">
                        <div className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: "0.65rem" }}>{i === 1 ? 'Volume' : 'Jours'}</div>
                        {loading ? <div className="skeleton mt-1" style={{width: '50px', height: '28px'}} /> : (
                          <div className="fw-bold h4 mb-0 text-dark">{i === 1 ? stats.totalHours : stats.daysPresent} {i === 1 && <small className="h6 text-muted">h</small>}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORIQUE */}
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0 text-dark small text-uppercase">Historique récent</h6>
              </div>
              <div className="table-responsive">
                <table className="table align-middle mb-0 responsive-table">
                  <thead className="bg-light d-none d-sm-table-header-group">
                    <tr className="small text-muted text-uppercase">
                      <th className="ps-4 py-3">Date</th>
                      <th className="text-center">Entrée</th>
                      <th className="text-center">Sortie</th>
                      <th className="pe-4 text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? [1, 2, 3].map(i => (
                      <tr key={i}>
                        <td colSpan={4} className="p-3"><div className="skeleton w-100" style={{height: '40px'}} /></td>
                      </tr>
                    )) : presences.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td className="ps-4 py-3 fw-bold text-dark mobile-label" data-label="Date">{new Date(p.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</td>
                        <td className="text-center fw-medium text-primary mobile-label" data-label="Entrée">{formatPresenceTime(p.check_in)}</td>
                        <td className="text-center fw-medium text-danger mobile-label" data-label="Sortie">{p.check_out ? formatPresenceTime(p.check_out) : "--:--"}</td>
                        <td className="pe-4 text-end mobile-label" data-label="Status">
                          <span className={`badge rounded-pill px-2 ${p.status === 'absent' ? 'bg-danger-subtle text-danger' : p.check_out ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`} style={{ fontSize: "0.65rem" }}>
                            {p.status === 'absent' ? 'Absent' : p.status === 'late' ? (p.check_out ? 'Retard' : 'En cours · retard') : p.check_out ? 'Ok' : 'En cours'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}