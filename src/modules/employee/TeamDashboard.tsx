import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../lib/api/client";
import { errorMessage } from "../../lib/api/errors";
import { StatusBadge } from "../../components/ui";
import { TASK_STATUS_CONFIG, LEAVE_STATUS_CONFIG } from "../../lib/statusConfig";
import { ActionCard, DonutChart, EmptyLine, Panel, RowItem, StackedBar, StatCard } from "../../components/dashboard/widgets";
import { AuthContext } from "../../context/AuthContext";

interface TeamSummary {
  department?: { id: number; name: string } | null;
  message?: string;
  stats?: {
    team_size: number;
    present_today: number;
    tasks_pending: number;
    tasks_in_progress: number;
    tasks_completed: number;
    leave_requests_pending: number;
  };
  today?: {
    total: number;
    present: number;
    late: number;
    absent: number;
    on_leave: number;
    not_checked_in: number;
  };
  recent?: {
    leave_requests: Array<{ id: number; type: string; start_date: string; end_date: string; status: string; employee: { first_name: string; last_name: string } }>;
    tasks: Array<{ id: number; title: string; status: string; due_date: string | null; employee: { first_name: string; last_name: string } }>;
  };
}

const day = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-FR");
};

/**
 * "Tableau de bord décisionnel : vue d'ensemble sur le statut de son
 * département" — cahier des charges, Espace Manager. Distinct du dashboard
 * personnel (/me/dashboard-summary, mes propres tâches/présences/congés) :
 * ici ce sont les chiffres de TOUTE l'équipe du manager.
 */
export default function TeamDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState<TeamSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/manager/dashboard-summary")
      .then((res) => setData(res.data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dash">
        <header className="dash__header">
          <h1>Tableau de bord</h1>
          <p>Chargement de votre équipe…</p>
        </header>
        <section className="dash__stats">
          {[1, 2, 3, 4].map((i) => <div key={i} className="stat stat--skeleton" />)}
        </section>
      </div>
    );
  }

  if (!data?.stats) {
    return (
      <div className="dash">
        <div className="dash__error">
          <i className="bi bi-diagram-3" />
          <p>{data?.message || "Vous n'avez pas de département assigné."}</p>
        </div>
      </div>
    );
  }

  const { stats, recent, department, today } = data;

  return (
    <div className="dash">
      <header className="dash__header">
        <h1>Tableau de bord — {department?.name}</h1>
        <p>
          Bonjour, <strong>{user?.name || "Manager"}</strong> — voici l'état de votre équipe.
        </p>
      </header>

      {/* ----- Indicateurs ----- */}
      <section className="dash__stats">
        <StatCard icon="bi-people" label="Membres de l'équipe" value={stats.team_size} hint="Effectif actif" to="/admin/employees" />
        <StatCard icon="bi-person-check" label="Présents aujourd'hui" value={stats.present_today} hint={`Sur ${stats.team_size} membre${stats.team_size > 1 ? "s" : ""}`} to="/admin/presences" />
        <StatCard icon="bi-hourglass-split" label="Tâches en cours" value={stats.tasks_in_progress} hint={`${stats.tasks_pending} en attente`} to="/admin/tasks" />
        <StatCard icon="bi-airplane" label="Congés à traiter" value={stats.leave_requests_pending} hint="Demandes en attente" to="/admin/leave-requests" />
      </section>

      <div className="dash__grid dash__grid--even">
        {/* ----- Présences du jour ----- */}
        {today && (
          <Panel icon="bi-people" title="Présences de l'équipe aujourd'hui" linkTo="/admin/presences" linkLabel="Voir le détail">
            <DonutChart
              total={today.total}
              centerLabel="Membres"
              segments={[
                { label: "Présents", value: today.present + today.late, color: "#2563eb", note: today.late > 0 ? `dont ${today.late} en retard` : "" },
                { label: "Absents", value: today.absent, color: "#dc2626" },
                { label: "En congé", value: today.on_leave, color: "#f59e0b" },
                { label: "Pas encore pointés", value: today.not_checked_in, color: "#cbd5e1" },
              ]}
            />
          </Panel>
        )}

        {/* ----- Avancement des tâches ----- */}
        <Panel icon="bi-bar-chart-steps" title="Avancement des tâches" linkTo="/admin/tasks">
          <StackedBar
            parts={[
              { label: "En attente", value: stats.tasks_pending, color: "#cbd5e1" },
              { label: "En cours", value: stats.tasks_in_progress, color: "#2563eb" },
              { label: "Terminées", value: stats.tasks_completed, color: "#16a34a" },
            ]}
          />
        </Panel>

        {/* ----- Congés en attente ----- */}
        <Panel icon="bi-airplane" title="Congés en attente" linkTo="/admin/leave-requests">
          {!recent?.leave_requests.length ? (
            <EmptyLine text="Aucune demande en attente." />
          ) : (
            recent.leave_requests.map((lr) => (
              <RowItem
                key={lr.id}
                title={`${lr.employee.first_name} ${lr.employee.last_name}`}
                sub={`${lr.type} · ${day(lr.start_date)} → ${day(lr.end_date)}`}
                right={<StatusBadge status={lr.status} config={LEAVE_STATUS_CONFIG} />}
              />
            ))
          )}
        </Panel>

        {/* ----- Tâches récentes ----- */}
        <Panel icon="bi-check2-square" title="Tâches récentes de l'équipe" linkTo="/admin/tasks">
          {!recent?.tasks.length ? (
            <EmptyLine text="Aucune tâche pour le moment." />
          ) : (
            recent.tasks.map((t) => (
              <RowItem
                key={t.id}
                title={t.title}
                sub={`${t.employee.first_name} ${t.employee.last_name}${t.due_date ? ` · échéance ${day(t.due_date)}` : ""}`}
                right={<StatusBadge status={t.status} config={TASK_STATUS_CONFIG} />}
              />
            ))
          )}
        </Panel>
      </div>

      {/* ----- Actions rapides ----- */}
      <section>
        <h2 className="dash__section-title"><i className="bi bi-lightning-charge" /> Actions rapides</h2>
        <div className="actions">
          <ActionCard to="/admin/tasks/create" icon="bi-check2-square" title="Créer une tâche" text="Assigner une tâche à un collaborateur" />
          <ActionCard to="/admin/leave-requests" icon="bi-airplane" title="Traiter les congés" text="Valider ou refuser une demande de congé" />
          <ActionCard to="/admin/presences" icon="bi-calendar-check" title="Présences" text="Suivre les pointages de l'équipe" />
          <ActionCard to="/admin/announcements/create" icon="bi-megaphone" title="Publier une annonce" text="Partager une information avec l'équipe" />
        </div>
      </section>
    </div>
  );
}