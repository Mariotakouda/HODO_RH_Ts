import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { api } from "../../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Dashboard.css";

// ---------- Types ----------

interface PersonRef {
  first_name?: string;
  last_name?: string;
}

interface DashboardStats {
  emp: number;
  dep: number;
  task: number;
  leave: number;
  managers: number;
  roles: number;
  announcements: number;
  presences: number;
  tasks_in_progress?: number;
  leave_pending?: number;
}

interface TodayBreakdown {
  total: number;
  present: number;
  late: number;
  absent: number;
  on_leave: number;
  not_checked_in: number;
}

interface RecentData {
  employees: { id: number; first_name: string; last_name: string; email: string; created_at?: string }[];
  announcements: { id: number; title: string; message?: string; created_at?: string }[];
  tasks?: { id: number; title: string; updated_at?: string; employee?: PersonRef | null }[];
  leave_requests?: { id: number; start_date: string; end_date: string; created_at?: string; employee?: PersonRef | null }[];
}

interface ActivityItem {
  key: string;
  icon: string;
  tone: "blue" | "green" | "violet" | "amber";
  title: string;
  text: string;
  time: number;
}

const EMPTY_STATS: DashboardStats = { emp: 0, dep: 0, task: 0, leave: 0, managers: 0, roles: 0, announcements: 0, presences: 0 };
const EMPTY_TODAY: TodayBreakdown = { total: 0, present: 0, late: 0, absent: 0, on_leave: 0, not_checked_in: 0 };
const EMPTY_RECENT: RecentData = { employees: [], announcements: [], tasks: [], leave_requests: [] };

// ---------- Utilitaires ----------

const fullName = (p?: PersonRef | null) => `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim() || "Un employé";

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  return `Il y a ${days} jours`;
}

const percent = (value: number, total: number) =>
  total > 0 ? `${((value / total) * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %` : "—";

// ---------- Page ----------

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [today, setToday] = useState<TodayBreakdown>(EMPTY_TODAY);
  const [recent, setRecent] = useState<RecentData>(EMPTY_RECENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // UN SEUL APPEL : /dashboard-summary
      const response = await api.get("/dashboard-summary");
      setStats({ ...EMPTY_STATS, ...response.data.stats });
      setToday({ ...EMPTY_TODAY, ...response.data.today });
      setRecent({ ...EMPTY_RECENT, ...response.data.recent });
    } catch {
      setError("Erreur lors du chargement des données du dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Fil d'activité : fusion des dernières données reçues, du plus récent au plus ancien.
  const activity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    recent.employees.forEach((e) =>
      items.push({
        key: `emp-${e.id}`,
        icon: "bi-person-plus",
        tone: "blue",
        title: "Nouvel employé",
        text: `${fullName(e)} a rejoint l'organisation`,
        time: Date.parse(e.created_at ?? "") || 0,
      })
    );
    (recent.tasks ?? []).forEach((t) =>
      items.push({
        key: `task-${t.id}`,
        icon: "bi-check2-square",
        tone: "green",
        title: "Tâche terminée",
        text: `« ${t.title} » — ${fullName(t.employee)}`,
        time: Date.parse(t.updated_at ?? "") || 0,
      })
    );
    recent.announcements.forEach((a) =>
      items.push({
        key: `ann-${a.id}`,
        icon: "bi-megaphone",
        tone: "violet",
        title: "Nouvelle annonce",
        text: `« ${a.title} » a été publiée`,
        time: Date.parse(a.created_at ?? "") || 0,
      })
    );
    (recent.leave_requests ?? []).forEach((l) =>
      items.push({
        key: `leave-${l.id}`,
        icon: "bi-calendar-event",
        tone: "amber",
        title: "Demande de congé",
        text: `${fullName(l.employee)} · du ${shortDate(l.start_date)} au ${shortDate(l.end_date)}`,
        time: Date.parse(l.created_at ?? "") || 0,
      })
    );

    return items.filter((i) => i.time > 0).sort((a, b) => b.time - a.time).slice(0, 6);
  }, [recent]);

  if (error && !loading) {
    return (
      <div className="dash">
        <div className="dash__error">
          <i className="bi bi-exclamation-triangle" />
          <p>{error}</p>
          <button onClick={loadDashboardData} className="dash__btn">Actualiser</button>
        </div>
      </div>
    );
  }

  const presentTotal = today.present + today.late;
  const segments = [
    { label: "Présents", value: presentTotal, color: "#2563eb", note: today.late > 0 ? `dont ${today.late} en retard` : "" },
    { label: "Absents", value: today.absent, color: "#dc2626", note: "" },
    { label: "En congé", value: today.on_leave, color: "#f59e0b", note: "" },
    { label: "Pas encore pointés", value: today.not_checked_in, color: "#cbd5e1", note: "" },
  ];

  return (
    <div className="dash">
      <header className="dash__header">
        <h1>Tableau de bord</h1>
        <p>
          Bonjour, <strong>{user?.name || "Administrateur"}</strong> — voici le résumé de votre organisation.
        </p>
      </header>

      {/* ----- Indicateurs ----- */}
      <section className="dash__stats">
        {loading
          ? [1, 2, 3, 4].map((i) => <div key={i} className="stat stat--skeleton" />)
          : (
            <>
              <StatCard icon="bi-people" label="Employés" value={stats.emp} hint="Effectif actif" to="/admin/employees" />
              <StatCard icon="bi-building" label="Départements" value={stats.dep} hint="Au total" to="/admin/departments" />
              <StatCard
                icon="bi-check2-square"
                label="Tâches en cours"
                value={stats.tasks_in_progress ?? stats.task}
                hint={`Sur ${stats.task} tâche${stats.task > 1 ? "s" : ""} au total`}
                to="/admin/tasks"
              />
              <StatCard
                icon="bi-calendar-event"
                label="Congés en attente"
                value={stats.leave_pending ?? stats.leave}
                hint="Demandes à traiter"
                to="/admin/leave-requests"
              />
            </>
          )}
      </section>

      <div className="dash__grid">
        {/* ----- Activité récente ----- */}
        <section className="panel">
          <div className="panel__head">
            <h2><i className="bi bi-clock-history" /> Activité récente</h2>
            <Link to="/admin/employees">Voir les employés <i className="bi bi-arrow-right" /></Link>
          </div>
          {loading ? (
            <p className="panel__empty">Chargement…</p>
          ) : activity.length === 0 ? (
            <p className="panel__empty">Aucune activité récente.</p>
          ) : (
            <ul className="feed">
              {activity.map((item) => (
                <li key={item.key} className="feed__item">
                  <span className={`feed__icon feed__icon--${item.tone}`}><i className={`bi ${item.icon}`} /></span>
                  <div className="feed__body">
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                  <time>{timeAgo(item.time)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ----- Présences du jour ----- */}
        <section className="panel">
          <div className="panel__head">
            <h2><i className="bi bi-people" /> Présences aujourd'hui</h2>
            <Link to="/admin/presences">Voir le détail <i className="bi bi-arrow-right" /></Link>
          </div>
          {loading ? (
            <p className="panel__empty">Chargement…</p>
          ) : (
            <div className="presence">
              <Donut segments={segments} total={today.total} />
              <ul className="legend">
                {segments.map((s) => (
                  <li key={s.label}>
                    <span className="legend__dot" style={{ background: s.color }} />
                    <span className="legend__label">
                      {s.label}
                      {s.note && <small>{s.note}</small>}
                    </span>
                    <strong>{s.value}</strong>
                    <span className="legend__pct">{percent(s.value, today.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* ----- Autres compteurs ----- */}
      {!loading && (
        <section className="dash__minis">
          <MiniStat label="Managers" value={stats.managers} to="/admin/managers" />
          <MiniStat label="Rôles" value={stats.roles} to="/admin/roles" />
          <MiniStat label="Annonces" value={stats.announcements} to="/admin/announcements" />
          <MiniStat label="Pointages enregistrés" value={stats.presences} to="/admin/presences" />
        </section>
      )}

      {/* ----- Actions rapides ----- */}
      <section>
        <h2 className="dash__section-title"><i className="bi bi-lightning-charge" /> Actions rapides</h2>
        <div className="actions">
          <ActionCard to="/admin/employees/create" icon="bi-person-plus" title="Ajouter un employé" text="Enregistrer un nouveau membre de l'équipe" />
          <ActionCard to="/admin/announcements/create" icon="bi-megaphone" title="Publier une annonce" text="Partager une information avec votre équipe" />
          <ActionCard to="/admin/tasks/create" icon="bi-check2-square" title="Créer une tâche" text="Assigner une tâche à un collaborateur" />
          <ActionCard to="/admin/leave-requests" icon="bi-calendar-event" title="Traiter les congés" text="Valider ou refuser une demande de congé" />
        </div>
      </section>
    </div>
  );
}

// ---------- Composants ----------

function StatCard({ icon, label, value, hint, to }: { icon: string; label: string; value: number; hint: string; to: string }) {
  return (
    <Link to={to} className="stat">
      <span className="stat__icon"><i className={`bi ${icon}`} /></span>
      <div className="stat__body">
        <span className="stat__label">{label}</span>
        <span className="stat__value">{value}</span>
        <span className="stat__hint">{hint}</span>
      </div>
    </Link>
  );
}

function MiniStat({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link to={to} className="mini">
      <span>{label}</span>
      <strong>{value}</strong>
    </Link>
  );
}

function ActionCard({ to, icon, title, text }: { to: string; icon: string; title: string; text: string }) {
  return (
    <Link to={to} className="action">
      <span className="action__icon"><i className={`bi ${icon}`} /></span>
      <div className="action__body">
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
      <i className="bi bi-chevron-right action__chevron" />
    </Link>
  );
}

function Donut({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const size = 168;
  const stroke = 24;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const arcs = segments
    .filter((s) => s.value > 0 && total > 0)
    .reduce<{ label: string; color: string; length: number; offset: number }[]>((acc, s) => {
      const previous = acc[acc.length - 1];
      acc.push({
        label: s.label,
        color: s.color,
        length: (s.value / total) * circumference,
        offset: previous ? previous.offset + previous.length : 0,
      });
      return acc;
    }, []);

  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Répartition des présences du jour">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef1f6" strokeWidth={stroke} />
          {arcs.map((a) => (
            <circle
              key={a.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={`${a.length} ${circumference - a.length}`}
              strokeDashoffset={-a.offset}
            />
          ))}
        </g>
      </svg>
      <div className="donut__center">
        <strong>{total}</strong>
        <span>Employés actifs</span>
      </div>
    </div>
  );
}