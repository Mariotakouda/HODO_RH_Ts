import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { DepartmentService } from "./service";
import type { Department } from "./model";
import { errorMessage } from "../../lib/api/errors";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  PageHeader,
  Button,
  IconButton,
  SearchInput,
  DataTable,
  Pagination,
  useConfirm,
  type Column,
} from "../../components/ui";

export default function DepartmentList() {
  const navigate = useNavigate();
  const { confirm, ConfirmDialog } = useConfirm();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await DepartmentService.list(page, debouncedSearch);
      setDepartments(res.data);
      setLastPage(res.meta.last_page);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleDelete = async (dept: Department) => {
    if (await confirm(`Supprimer le département "${dept.name}" ?`)) {
      try {
        await DepartmentService.remove(dept.id);
        toast.success("Département supprimé");
        load();
      } catch (err) {
        toast.error(errorMessage(err));
      }
    }
  };

  const columns: Column<Department>[] = [
    { header: "Nom", render: (d) => <span className="fw-bold text-dark">{d.name}</span> },
    {
      header: "Manager",
      render: (d) => d.manager ? d.manager.full_name : <span className="text-muted">Aucun</span>,
    },
    {
      header: "Actions",
      align: "center",
      render: (d) => (
        <div className="d-flex justify-content-center gap-2">
          <IconButton icon="bi-eye" title="Voir" onClick={() => navigate(`/admin/departments/${d.id}`)} />
          <IconButton icon="bi-pencil" tone="warning" title="Modifier" onClick={() => navigate(`/admin/departments/${d.id}/edit`)} />
          <IconButton icon="bi-trash" tone="danger" title="Supprimer" onClick={() => handleDelete(d)} />
        </div>
      ),
    },
  ];

  return (
    <div className="container-fluid py-4 py-md-5 px-3 px-md-5 bg-light min-vh-100">
      <PageHeader
        title="Départements"
        subtitle="Organisation de l'entreprise"
        action={
          <Button icon="bi-plus-lg" onClick={() => navigate("/admin/departments/create")}>
            Nouveau département
          </Button>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un département..." />

      <DataTable
        items={departments}
        loading={loading}
        columns={columns}
        keyField="id"
        emptyMessage="Aucun département trouvé."
        renderMobileCard={(d) => (
          <div className="card border-0 shadow-sm mb-3 rounded-4 p-3">
            <div className="fw-bold mb-1">{d.name}</div>
            <div className="small text-muted mb-3">
              {d.manager ? `Manager : ${d.manager.full_name}` : "Aucun manager"}
            </div>
            <div className="d-flex gap-2">
              <button onClick={() => navigate(`/admin/departments/${d.id}`)} className="btn btn-light flex-grow-1 border py-2">
                <i className="bi bi-eye" />
              </button>
              <button onClick={() => navigate(`/admin/departments/${d.id}/edit`)} className="btn btn-light border text-warning py-2">
                <i className="bi bi-pencil" />
              </button>
              <button onClick={() => handleDelete(d)} className="btn btn-light border text-danger py-2">
                <i className="bi bi-trash" />
              </button>
            </div>
          </div>
        )}
      />

      <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />

      {ConfirmDialog}
    </div>
  );
}
