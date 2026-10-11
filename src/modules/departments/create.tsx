import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { DepartmentService } from "./service";
import { api } from "../../lib/api/client";
import { errorMessage } from "../../lib/api/errors";
import { PageHeader, Button, InputField, SelectField, TextareaField, FormSkeleton } from "../../components/ui";

interface Manager {
  id: number;
  full_name: string;
}

export default function DepartmentCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "", manager_id: "" });
  const [managers, setManagers] = useState<Manager[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/managers")
      .then((res) => setManagers(Array.isArray(res.data.data) ? res.data.data : res.data))
      .catch(() => setManagers([]))
      .finally(() => setInitialLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await DepartmentService.create({
        name: form.name,
        description: form.description || undefined,
        manager_id: form.manager_id ? Number(form.manager_id) : undefined,
      });
      toast.success("Département créé avec succès");
      navigate("/admin/departments");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container py-4 py-md-5">
        <FormSkeleton fields={2} />
      </div>
    );
  }

  return (
    <div className="container py-4 py-md-5" style={{ maxWidth: 640 }}>
      <PageHeader title="Nouveau département" />

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card border-0 shadow-sm p-4 rounded-4">
        <InputField
          label="Nom du département"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <TextareaField
          label="Description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <SelectField
          label="Manager"
          value={form.manager_id}
          onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
        >
          <option value="">Aucun</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>{m.full_name}</option>
          ))}
        </SelectField>

        <div className="d-flex gap-2 mt-3">
          <Button type="submit" loading={loading}>Créer le département</Button>
          <Button type="button" variant="light" onClick={() => navigate(-1)}>Annuler</Button>
        </div>
      </form>
    </div>
  );
}
