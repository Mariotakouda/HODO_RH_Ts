import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useResourceList } from "../../hooks/useResourceList";
import { EmployeeService } from "./service";
import type { Employee } from "./model";
import { EMPLOYEE_STATUS_CONFIG } from "../../lib/statusConfig";
import {
  Avatar,
  StatusBadge,
  PageHeader,
  Button,
  IconButton,
  SearchInput,
  DataTable,
  useConfirm,
  type Column,
} from "../../components/ui";

export default function EmployeeList() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { confirm, ConfirmDialog } = useConfirm();

  const { items, loading, search, setSearch, remove } = useResourceList<Employee>({
    fetchAll: EmployeeService.list,
    deleteOne: EmployeeService.delete,
    matches: (emp, term) =>
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term),
    deleteSuccessMessage: "Employé supprimé",
  });

  const handleDelete = async (emp: Employee) => {
    if (await confirm(`Supprimer ${emp.first_name} ${emp.last_name} ?`)) {
      await remove(emp.id);
    }
  };

  const columns: Column<Employee>[] = [
    {
      header: "Collaborateur",
      render: (emp) => (
        <div className="d-flex align-items-center">
          <Avatar photoUrl={emp.profile_photo_url ?? undefined} firstName={emp.first_name} lastName={emp.last_name ?? undefined} />
          <div className="ms-3">
            <div className="fw-bold text-dark">{emp.first_name} {emp.last_name}</div>
            <div className="small text-muted">{emp.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Département / Statut",
      render: (emp) => (
        <>
          <div className="mb-1">
            <StatusBadge status={emp.status ?? "actif"} config={EMPLOYEE_STATUS_CONFIG} />
          </div>
          <span className="small text-muted">{emp.department?.name || "N/A"}</span>
        </>
      ),
    },
    {
      header: "Actions",
      align: "center",
      render: (emp) => (
        <div className="d-flex justify-content-center gap-2">
          <IconButton icon="bi-eye" title="Voir" onClick={() => navigate(`/admin/employees/${emp.id}`)} />
          {isAdmin && (
            <>
              <IconButton
                icon="bi-pencil"
                title="Modifier"
                tone="warning"
                onClick={() => navigate(`/admin/employees/${emp.id}/edit`)}
              />
              <IconButton icon="bi-trash" title="Supprimer" tone="danger" onClick={() => handleDelete(emp)} />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container-fluid py-4 py-md-5 px-3 px-md-5 bg-light min-vh-100">
      <PageHeader
        title="Employés"
        subtitle={`Gestion des collaborateurs (${items.length})`}
        action={
          isAdmin && (
            <Button icon="bi-plus-lg" onClick={() => navigate("/admin/employees/create")}>
              Nouvel employé
            </Button>
          )
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par nom ou email..." />

      <DataTable
        items={items}
        loading={loading}
        columns={columns}
        keyField="id"
        emptyMessage={search ? `Aucun résultat pour "${search}"` : "Aucun employé trouvé."}
        renderMobileCard={(emp) => (
          <div className="card border-0 shadow-sm mb-3 rounded-4 p-3">
            <div className="d-flex align-items-center mb-3">
              <Avatar photoUrl={emp.profile_photo_url ?? undefined} firstName={emp.first_name} lastName={emp.last_name ?? undefined} size={56} />
              <div className="ms-3">
                <div className="fw-bold">{emp.first_name} {emp.last_name}</div>
                <StatusBadge status={emp.status ?? "actif"} config={EMPLOYEE_STATUS_CONFIG} />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button onClick={() => navigate(`/admin/employees/${emp.id}`)} className="btn btn-light flex-grow-1 border py-2">
                <i className="bi bi-eye" />
              </button>
              {isAdmin && (
                <>
                  <button onClick={() => navigate(`/admin/employees/${emp.id}/edit`)} className="btn btn-light border text-warning py-2">
                    <i className="bi bi-pencil" />
                  </button>
                  <button onClick={() => handleDelete(emp)} className="btn btn-light border text-danger py-2">
                    <i className="bi bi-trash" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      />

      {ConfirmDialog}
    </div>
  );
}
