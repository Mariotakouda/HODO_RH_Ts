// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { getLeaveRequest } from "./service";
// import type { LeaveRequest } from "./model";

// export default function LeaveRequestShow() {
//   const { id } = useParams();
//   const [leave, setLeave] = useState<LeaveRequest | null>(null);

//   useEffect(() => {
//     getLeaveRequest(Number(id)).then(setLeave).catch(console.error);
//   }, [id]); // Ajout de [id] dans les dépendances pour une bonne pratique

//   if (!leave) return <p>Chargement...</p>;

//   // Fonction pour afficher le nom complet ou l'ID si le nom est manquant
//   const employeeName = leave.employee
//     ? `${leave.employee.first_name} ${leave.employee.last_name || ''}`
//     : `ID: ${leave.employee_id}`; // Solution de repli

//   return (
//     <div>
//       <h1>Détails de la demande #{id}</h1>

//       {/* 🎯 Affichage du nom de l'employé au lieu de l'ID */}
//       <p><b>Employé :</b> {employeeName}</p>
      
//       {/* L'ID de l'employé peut être affiché à des fins de débogage si nécessaire */}
//       {/* <p><b>ID Employé :</b> {leave.employee_id}</p> */} 
      
//       <p><b>Type :</b> {leave.type}</p>
//       <p><b>Date début :</b> {leave.start_date}</p>
//       <p><b>Date fin :</b> {leave.end_date}</p>
//       <p><b>Status :</b> {leave.status}</p>
//       <p><b>Message :</b> {leave.message}</p>

//       <Link to="/admin/leave_requests">Retour</Link>
//     </div>
//   );
// }