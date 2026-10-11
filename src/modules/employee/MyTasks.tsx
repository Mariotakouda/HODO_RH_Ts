import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api/client";
import { useResourceList } from "../../hooks/useResourceList";
import { TASK_STATUS_CONFIG } from "../../lib/statusConfig";
import type { Task } from "../tasks/model";
import { PageHeader, StatusBadge, SearchInput, DataTable, type Column } from "../../components/ui";

/**
 * "Consultation de sa liste de missions et tâches à accomplir" — cahier des
 * charges, Espace Employé. Utilise /me/tasks (self-service), contrairement à
 * modules/tasks/list.tsx qui appelle /tasks (réservé manager/admin).
 */
export default function MyTasks() {
  const navigate = useNavigate();

  const { items, loading, search, setSearch } = useResourceList<Task>({
    fetchAll: async () => {
      const res = await api.get("/me/tasks");
      return res.data.data ?? res.data;
    },
    matches: (task, term) => task.title.toLowerCase().includes(term),
  });

  const columns: Column<Task>[] = [
    {
      header: "Mission",
      render: (t) => (
        <button
          className="btn btn-link p-0 fw-bold text-dark text-decoration-none text-start"
          onClick={() => navigate(`/employee/tasks/${t.id}`)}
        >
          {t.title}
        </button>
      ),
    },
    {
      header: "Échéance",
      render: (t) => (t.due_date ? new Date(t.due_date).toLocaleDateString("fr-FR") : <span className="text-muted">—</span>),
    },
    { header: "Statut", render: (t) => <StatusBadge status={t.status} config={TASK_STATUS_CONFIG} /> },
  ];

  return (
    <div className="container-fluid py-4 py-md-5 px-3 px-md-5 bg-light min-vh-100">
      <PageHeader title="Mes tâches" subtitle={`${items.length} mission(s) assignée(s)`} />

      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une mission..." />

      <DataTable
        items={items}
        loading={loading}
        columns={columns}
        keyField="id"
        emptyMessage={search ? `Aucun résultat pour "${search}"` : "Aucune mission pour le moment."}
        renderMobileCard={(t) => (
          <div
            className="card border-0 shadow-sm mb-3 rounded-4 p-3"
            role="button"
            onClick={() => navigate(`/employee/tasks/${t.id}`)}
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="fw-bold">{t.title}</span>
              <StatusBadge status={t.status} config={TASK_STATUS_CONFIG} />
            </div>
            <div className="small text-muted">
              {t.due_date ? `Échéance : ${new Date(t.due_date).toLocaleDateString("fr-FR")}` : "Pas d'échéance"}
            </div>
          </div>
        )}
      />
    </div>
  );
}
