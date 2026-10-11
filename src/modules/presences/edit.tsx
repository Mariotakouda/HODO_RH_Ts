// // src/modules/presences/edit.tsx

// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { getPresence, updatePresence } from "./service";

// export default function PresenceEdit() {
//   const { id } = useParams();
//   const nav = useNavigate();
//   const [form, setForm] = useState<any>({});

//   useEffect(() => {
//     getPresence(Number(id)).then((data) => setForm(data));
//   }, []);

//   function handleChange(e: any) {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }

//   async function handleSubmit(e: any) {
//     e.preventDefault();
//     await updatePresence(Number(id), form);
//     nav("/admin/presences");
//   }

//   return (
//     <div>
//       <h1>Modifier présence #{id}</h1>

//       <form onSubmit={handleSubmit}>
//         <input name="employee_id" value={form.employee_id || ""} onChange={handleChange} required />

//         <input type="date" name="date" value={form.date || ""} onChange={handleChange} required />

//         <input type="time" name="check_in" value={form.check_in || ""} onChange={handleChange} />
//         <input type="time" name="check_out" value={form.check_out || ""} onChange={handleChange} />

//         <select name="status" value={form.status || "present"} onChange={handleChange}>
//           <option value="present">Présent</option>
//           <option value="absent">Absent</option>
//           <option value="late">En retard</option>
//         </select>

//         <button type="submit">Enregistrer</button>
//       </form>
//     </div>
//   );
// }
