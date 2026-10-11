import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployeeRole } from "./service";

interface EmployeeRoleForm {
  employee_id: number;
  role_id: number;
}

export default function EmployeeRoleCreate() {
  const nav = useNavigate();
  const [form, setForm] = useState<EmployeeRoleForm>({
    employee_id: 0,
    role_id: 0,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: Number(value) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createEmployeeRole(form);
    nav("/admin/employee_roles");
  }

  return (
    <div>
      <h1>Créer un rôle d'employé</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="employee_id"
          placeholder="ID Employé"
          value={form.employee_id}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="role_id"
          placeholder="ID Rôle"
          value={form.role_id}
          onChange={handleChange}
          required
        />
        <button type="submit">Créer</button>
      </form>
    </div>
  );
}
