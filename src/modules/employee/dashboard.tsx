import { useEffect, useState, useContext, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../api/axios";
import { StatusBadge } from "../../components/ui";
import { LEAVE_STATUS_CONFIG, PRESENCE_STATUS_CONFIG, TASK_STATUS_CONFIG } from "../../lib/statusConfig";
import { ActionCard, EmptyLine, Panel, RowItem, StatCard } from "../../components/dashboard/widgets";

// --- Types ---
interface Presence { id: number; date: string; status: string; }
interface Task { id: number; title: string; due_date?: string; status: string; }
interface LeaveRequest { id: number; start_date: string; end_date: string; status: string; }
interface Announcement {
  id: number;
  title: string;
  created_at: string;
  is_general: boolean;
  department?: { name: string };
}
interface Stats {
  tasks_open: number;
  tasks_completed: number;
  leave_pending: number;
  days_present_30: number;
  days_late_30: number;
}
interface TodayPresence { id: number; check_in: string | null; check_out: string | null; status: string; }

const EMPTY_STATS: Stats = { tasks_open: 0, tasks_completed: 0, leave_pending: 0, days_present_30: 0, days_late_30: 0 };

// --- Utilitaires ---
const day = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-FR");
};
// "2026-10-10 08:02:11" ou "2026-10-10T08:02:11Z" -> "08:02" (heure du serveur)
const hhmm = (value?: string | null) => (value ? value.slice(11, 16) : "");

export default function EmployeeDashboard() {
  const { user, employee, setEmployee } = useContext(AuthContext);

  const [data, setData] = useState<{
    presences: Presence[];
    tasks: Task[];
    leaves: LeaveRequest[];
    announcements: Announcement[];
    stats: Stats;
    today: TodayPresence | null;
  }>({ presences: [], tasks: [], leaves: [], announcements: [], stats: EMPTY_STATS, today: null });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Si le profil employé n'est pas encore en contexte, on le charge en parallèle.
        const profilePromise = !employee?.id ? api.get("/me") : Promise.resolve(null);
        const summaryPromise = api.get("/me/dashboard-summary");

        const [meRes, summaryRes] = await Promise.all([profilePromise, summaryPromise]);

        if (!isMounted) return;

        if (meRes && "data" in meRes && meRes.data.employee && setEmployee) {
          setEmployee(meRes.data.employee);
        }

        const { presences, tasks, leave_requests, announcements, stats, today } = summaryRes.data;

        setData({
          presences: presences || [],
          tasks: tasks || [],
          leaves: leave_requests || [],
          announcements: announcements || [],
          stats: { ...EMPTY_STATS, ...stats },
          today: today || null,
        });

        // Gestion du cache local pour les annonces
        if (announcements?.length > 0) {
          const lastRead = localStorage.getItem("last_announcement_read");
          setHasNewAnnouncements(!lastRead || announcements[0].created_at > lastRead);
        }
      } catch {
        if (isMounted) setError("Erreur de chargement des données.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // employee?.id volontairement exclu : évite les boucles infinies

  const markAnnouncementsAsRead = () => {
    if (data.announcements.length > 0) {
      localStorage.setItem("last_announcement_read", data.announcements[0].created_at);
      setHasNewAnnouncements(false);
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employee) return;
    const formData = new FormData();
    formData.append("profile_photo", file);
    try {
      setUploading(true);
      const response = await api.post("/me/profile-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (setEmployee && response.data.url) {
        const updated = { ...employee, profile_photo_url: response.data.url };
        setEmployee(updated);
        localStorage.setItem("employee", JSON.stringify(updated));
      }
    } catch {
      setError("Erreur upload photo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Pointage du jour
  const today = data.today;
  let todayChip = <span className="chip chip--slate">Pas encore pointé</span>;
  if (today?.check_in && today.check_out) {
    todayChip = <span className="chip chip--green">Journée terminée · {hhmm(today.check_in)} – {hhmm(today.check_out)}</span>;
  } else if (today?.check_in) {
    todayChip = (
      <span className={`chip ${today.status === "late" ? "chip--amber" : "chip--blue"}`}>
        Arrivée à {hhmm(today.check_in)}{today.status === "late" ? " · en retard" : " · en cours"}
      </span>
    );
  }
  const canCheckIn = !today?.check_in;

  const fullName = `${employee?.first_name ?? ""} ${employee?.last_name ?? ""}`.trim();

  return (
    <div className="dash">
      <div className="dash__top">
        <header className="dash__header">
          <h1>Tableau de bord</h1>
          <p>
            Bonjour, <strong>{user?.name || "Utilisateur"}</strong> — voici le résumé de votre activité.
          </p>
        </header>
        <div className="dash__tools">
          <Link to="/employee/announcements" onClick={markAnnouncementsAsRead} className="iconbtn" aria-label="Annonces">
            <i className="bi bi-bell" />
            {hasNewAnnouncements && <span className="iconbtn__dot" />}
          </Link>
        </div>
      </div>

      {error && <div className="dash__error" style={{ margin: "0 0 16px", padding: 16 }}>{error}</div>}

      {/* ----- Profil ----- */}
      <section className="profile">
        <div className="profile__avatar">
          <div className="profile__photo">
            {loading ? null : uploading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : employee?.profile_photo_url ? (
              <img src={employee.profile_photo_url} alt="Profil" />
            ) : (
              <span>{employee?.first_name?.[0]}{employee?.last_name?.[0]}</span>
            )}
          </div>
          <label className="profile__camera" htmlFor="avatar-upload" title="Changer la photo">
            <i className="bi bi-camera" />
            <input type="file" id="avatar-upload" onChange={handlePhotoUpload} accept="image/*" />
          </label>
        </div>

        <div className="profile__info">
          <div className="profile__field"><span>Collaborateur</span><strong>{loading ? "…" : fullName || "—"}</strong></div>
          <div className="profile__field"><span>Département</span><strong>{loading ? "…" : employee?.department?.name || "Général"}</strong></div>
          <div className="profile__field"><span>Poste actuel</span><strong>{loading ? "…" : employee?.roles?.[0]?.name || "Membre"}</strong></div>
          <div className="profile__field"><span>Statut</span><strong style={{ color: "#15803d" }}>Actif</strong></div>
        </div>

        <div className="profile__today">
          {loading ? null : todayChip}
          {!loading && canCheckIn && <Link to="/employee/presences" className="btn-flat">Pointer mon arrivée</Link>}
          {!loading && today?.check_in && !today.check_out && <Link to="/employee/presences" className="btn-flat">Pointer ma sortie</Link>}
        </div>
      </section>

      {/* ----- Indicateurs ----- */}
      <section className="dash__stats">
        {loading ? (
          [1, 2, 3, 4].map((i) => <div key={i} className="stat stat--skeleton" />)
        ) : (
          <>
            <StatCard icon="bi-hourglass-split" label="Tâches en cours" value={data.stats.tasks_open} hint="À traiter" to="/employee/my-tasks" />
            <StatCard icon="bi-check2-square" label="Tâches terminées" value={data.stats.tasks_completed} hint="Au total" to="/employee/my-tasks" />
            <StatCard
              icon="bi-person-check"
              label="Jours de présence"
              value={data.stats.days_present_30}
              hint={data.stats.days_late_30 > 0 ? `30 derniers jours · ${data.stats.days_late_30} retard(s)` : "30 derniers jours"}
              to="/employee/presences"
            />
            <StatCard icon="bi-calendar-event" label="Congés en attente" value={data.stats.leave_pending} hint="Demandes en cours" to="/employee/leave-requests" />
          </>
        )}
      </section>

      <div className="dash__grid dash__grid--even">
        {/* ----- Missions ----- */}
        <Panel icon="bi-check2-square" title="Mes tâches" linkTo="/employee/my-tasks">
          {loading ? (
            <EmptyLine text="Chargement…" />
          ) : data.tasks.length === 0 ? (
            <EmptyLine text="Aucune tâche pour le moment." />
          ) : (
            data.tasks.slice(0, 4).map((t) => (
              <RowItem
                key={t.id}
                to={`/employee/tasks/${t.id}`}
                title={t.title}
                sub={`Échéance : ${day(t.due_date)}`}
                right={<StatusBadge status={t.status} config={TASK_STATUS_CONFIG} />}
              />
            ))
          )}
        </Panel>

        {/* ----- Présences ----- */}
        <Panel icon="bi-calendar-check" title="Historique de présence" linkTo="/employee/presences">
          {loading ? (
            <EmptyLine text="Chargement…" />
          ) : data.presences.length === 0 ? (
            <EmptyLine text="Aucune donnée de présence." />
          ) : (
            data.presences.slice(0, 4).map((p) => (
              <RowItem key={p.id} title={day(p.date)} right={<StatusBadge status={p.status} config={PRESENCE_STATUS_CONFIG} />} />
            ))
          )}
        </Panel>

        {/* ----- Congés ----- */}
        <Panel icon="bi-airplane" title="Demandes de congés" linkTo="/employee/leave-requests">
          <Link to="/employee/leave-requests/create" className="btn-flat btn-flat--block">Nouvelle demande</Link>
          {loading ? (
            <EmptyLine text="Chargement…" />
          ) : data.leaves.length === 0 ? (
            <EmptyLine text="Aucune demande." />
          ) : (
            data.leaves.slice(0, 3).map((l) => (
              <RowItem
                key={l.id}
                title={`Du ${day(l.start_date)} au ${day(l.end_date)}`}
                right={<StatusBadge status={l.status} config={LEAVE_STATUS_CONFIG} />}
              />
            ))
          )}
        </Panel>

        {/* ----- Annonces ----- */}
        <Panel icon="bi-megaphone" title="Annonces récentes" linkTo="/employee/announcements">
          {loading ? (
            <EmptyLine text="Chargement…" />
          ) : data.announcements.length === 0 ? (
            <EmptyLine text="Aucune communication." />
          ) : (
            data.announcements.slice(0, 4).map((a) => (
              <RowItem
                key={a.id}
                title={a.title}
                sub={a.is_general ? "Annonce générale" : "Annonce du département"}
                right={<span className="rowitem__date">{day(a.created_at)}</span>}
              />
            ))
          )}
        </Panel>
      </div>

      {/* ----- Actions rapides ----- */}
      <section>
        <h2 className="dash__section-title"><i className="bi bi-lightning-charge" /> Actions rapides</h2>
        <div className="actions">
          <ActionCard to="/employee/presences" icon="bi-clock" title="Pointer" text="Enregistrer mon arrivée ou ma sortie" />
          <ActionCard to="/employee/leave-requests/create" icon="bi-airplane" title="Demander un congé" text="Soumettre une nouvelle demande" />
          <ActionCard to="/employee/my-tasks" icon="bi-check2-square" title="Mes tâches" text="Consulter et mettre à jour mes missions" />
          <ActionCard to="/employee/documents" icon="bi-folder2-open" title="Mon dossier" text="Déposer mes pièces et documents" />
        </div>
      </section>
    </div>
  );
}