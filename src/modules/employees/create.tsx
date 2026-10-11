import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api } from "../../lib/api/client";
import { errorMessage, toApiError } from "../../lib/api/errors";
import { EmployeeService } from "./service";
import type { EmployeeFormData } from "./model";
import { PageHeader, Button, FormSkeleton, InputField, SelectField } from "../../components/ui";

interface Option {
  id: number;
  name: string;
}

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  contract_type: "CDI",
  hire_date: "",
  salary_base: 0,
  department_id: "" as string | number,
  role_ids: [] as number[],
  status: "actif",
};

export default function EmployeeCreate() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Option[]>([]);
  const [roles, setRoles] = useState<Option[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    Promise.all([
      api.get("/departments/list").then((res) => res.data.data || res.data),
      api.get("/roles").then((res) => res.data.data || res.data),
    ])
      .then(([deps, rolesList]) => {
        setDepartments(deps);
        setRoles(rolesList);
      })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setInitialLoading(false));
  }, []);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.first_name.trim()) next.first_name = "Le prénom est requis";
    if (!form.last_name.trim()) next.last_name = "Le nom est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Format d'email invalide";
    if (!form.hire_date) next.hire_date = "La date d'embauche est requise";
    if (!form.salary_base || form.salary_base <= 0) next.salary_base = "Le salaire doit être supérieur à 0";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: EmployeeFormData = {
        ...form,
        department_id: form.department_id === "" ? undefined : Number(form.department_id),
      };
      const result = await EmployeeService.create(payload);
      if (result.invitation_sent) {
        toast.success(`${form.first_name} a été recruté(e). Un lien d'activation a été envoyé par email.`);
      } else {
        toast(result.message, { icon: "⚠️", duration: 8000 });
      }
      navigate("/admin/employees");
    } catch (err) {
      const apiError = toApiError(err);
      if (apiError.errors) {
        setErrors(Object.fromEntries(Object.entries(apiError.errors).map(([k, v]) => [k, v[0]])));
      }
      toast.error(apiError.message || "Une erreur est survenue lors du recrutement.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container py-4 py-md-5">
        <FormSkeleton fields={4} />
      </div>
    );
  }

  const toggleRole = (roleId: number, checked: boolean) => {
    setForm((f) => ({
      ...f,
      role_ids: checked ? [...f.role_ids, roleId] : f.role_ids.filter((id) => id !== roleId),
    }));
  };

  return (
    <div className="container py-4 py-md-5">
      <PageHeader title="Recruter un employé" />

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm p-4 rounded-4">
              <h5 className="mb-4 fw-bold text-dark">État civil &amp; Contact</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <InputField
                    label="Prénom"
                    required
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    error={errors.first_name}
                  />
                </div>
                <div className="col-md-6">
                  <InputField
                    label="Nom"
                    required
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    error={errors.last_name}
                  />
                </div>
                <div className="col-md-6">
                  <InputField
                    label="Email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    error={errors.email}
                  />
                </div>
                <div className="col-md-6">
                  <InputField
                    label="Téléphone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <hr className="my-4 opacity-25" />

              <h5 className="mb-3 fw-bold text-dark">Rôles attribués</h5>
              <div className="d-flex flex-wrap gap-2">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className={`btn btn-sm px-3 py-2 rounded-pill border ${
                      form.role_ids.includes(role.id) ? "btn-primary border-primary" : "btn-outline-light text-dark"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      className="d-none"
                      checked={form.role_ids.includes(role.id)}
                      onChange={(e) => toggleRole(role.id, e.target.checked)}
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm p-4 mb-4 rounded-4">
              <h5 className="mb-3 fw-bold text-dark">Poste &amp; Contrat</h5>

              <SelectField
                label="Département"
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              >
                <option value="">Non assigné</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </SelectField>

              <SelectField
                label="Type de contrat"
                required
                value={form.contract_type}
                onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
              </SelectField>

              <InputField
                label="Date d'embauche"
                type="date"
                required
                value={form.hire_date}
                onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
                error={errors.hire_date}
              />

              <InputField
                label="Salaire de base (XOF)"
                type="number"
                required
                value={form.salary_base || ""}
                onChange={(e) => setForm({ ...form, salary_base: Number(e.target.value) })}
                error={errors.salary_base}
              />
            </div>

            <div className="d-grid gap-2">
              <Button type="submit" loading={loading} className="py-3">
                Finaliser le recrutement
              </Button>
              <Button type="button" variant="light" className="py-3" onClick={() => navigate(-1)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
