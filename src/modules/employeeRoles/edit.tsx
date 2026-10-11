// src/modules/employee_roles/edit.tsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployeeRole, updateEmployeeRole } from "./service";

export default function EmployeeRoleEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState<any>({});

  const loadRole = useCallback(async () => {
    if (!id) return;
    const employeeRole = await getEmployeeRole(Number(id));
    setForm(employeeRole);
  }, [id]);

  useEffect(() => {
    loadRole();
  }, [loadRole]);

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    await updateEmployeeRole(Number(id), { employee_id: Number(form.employee_id), role_id: Number(form.role_id) });
    nav("/admin/employee_roles");
  }

  return (
    <div>
      <h1>Modifier rôle #{id}</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="employee_id"
          value={form.employee_id || ""}
          onChange={handleChange}
          required
        />
        <input
          name="role_id"
          value={form.role_id || ""}
          onChange={handleChange}
          required
        />
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
}
