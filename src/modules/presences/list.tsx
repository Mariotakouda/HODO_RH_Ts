// // src/modules/presences/list.tsx

// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { fetchPresences, deletePresence } from "./service";
// import type { Presence } from "./model";

// export default function PresenceList() {
//   const [presences, setPresences] = useState<Presence[]>([]);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [meta, setMeta] = useState<any>(null);

//   async function load() {
//     const data = await fetchPresences(search, page);
//     setPresences(data.data);
//     setMeta(data.meta);
//   }

//   useEffect(() => {
//     load();
//   }, [search, page]);

//   async function handleDelete(id: number) {
//     if (confirm("Voulez-vous vraiment supprimer cette présence ?")) {
//       await deletePresence(id);
//       load();
//     }
//   }

//   return (
//     <div>
//       <h1>Liste des présences</h1>

//       <div>
//         <input
//           placeholder="Recherche..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//         <Link to="create">Ajouter</Link>
//       </div>

//       <table border={1} width="100%">
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>ID Employé</th>
//             <th>Date</th>
//             <th>Entrée</th>
//             <th>Sortie</th>
//             <th>Status</th>
//             <th>Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {presences.map((p) => (
//             <tr key={p.id}>
//               <td>{p.id}</td>
//               <td>{p.employee_id}</td>
//               <td>{p.date}</td>
//               <td>{p.check_in}</td>
//               <td>{p.check_out}</td>
//               <td>{p.status}</td>
//               <td>
//                 <Link to={`${p.id}`}>Voir</Link> |{" "}
//                 <Link to={`${p.id}/edit`}>Modifier</Link> |{" "}
//                 <button onClick={() => handleDelete(p.id)}>Supprimer</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {meta && (
//         <div>
//           <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
//             Précédent
//           </button>
//           <span> Page {meta.current_page} / {meta.last_page} </span>
//           <button
//             disabled={page >= meta.last_page}
//             onClick={() => setPage(page + 1)}
//           >
//             Suivant
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
