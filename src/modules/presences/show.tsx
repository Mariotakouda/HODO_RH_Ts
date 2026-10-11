// // src/modules/presences/show.tsx

// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { getPresence } from "./service";
// import type { Presence } from "./model";

// export default function PresenceShow() {
//   const { id } = useParams();
//   const [presence, setPresence] = useState<Presence | null>(null);

//   useEffect(() => {
//     getPresence(Number(id)).then(setPresence);
//   }, []);

//   if (!presence) return <p>Chargement...</p>;

//   return (
//     <div>
//       <h1>Détails de la présence #{id}</h1>

//       <p><b>Employé :</b> {presence.employee_id}</p>
//       <p><b>Date :</b> {presence.date}</p>
//       <p><b>Entrée :</b> {presence.check_in}</p>
//       <p><b>Sortie :</b> {presence.check_out}</p>
//       <p><b>Status :</b> {presence.status}</p>

//       <Link to="/admin/presences">Retour</Link>
//     </div>
//   );
// }
