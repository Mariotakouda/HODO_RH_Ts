// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { createPresence } from "./service";

// interface PresenceForm {
//   employee_id: number;
//   date: string;
//   check_in: string;
//   check_out: string;
//   status: string;
// }

// export default function PresenceCreate() {
//   const nav = useNavigate();

//   const [form, setForm] = useState<PresenceForm>({
//     employee_id: 0,
//     date: "",
//     check_in: "",
//     check_out: "",
//     status: "present",
//   });

//   function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
//     const { name, value } = e.target;
//     setForm({
//       ...form,
//       [name]: name === "employee_id" ? Number(value) : value,
//     });
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     await createPresence(form);
//     nav("/admin/presences");
//   }

//   return (
//     <div>
//       <h1>Créer une présence</h1>

//       <form onSubmit={handleSubmit}>
//         <input type="number" name="employee_id" placeholder="ID employé" onChange={handleChange} required />
//         <input type="date" name="date" onChange={handleChange} required />
//         <input type="time" name="check_in" onChange={handleChange} />
//         <input type="time" name="check_out" onChange={handleChange} />

//         <select name="status" onChange={handleChange}>
//           <option value="present">Présent</option>
//           <option value="absent">Absent</option>
//           <option value="late">En retard</option>
//         </select>

//         <button type="submit">Créer</button>
//       </form>
//     </div>
//   );
// }
