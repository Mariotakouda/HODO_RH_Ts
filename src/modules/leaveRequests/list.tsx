// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { fetchLeaveRequests, deleteLeaveRequest, ApiError } from "./service";
// import type { LeaveRequest, LeaveRequestPaginatedResponse } from "./model";

// const STATUS_LABELS: Record<string, string> = {
//   pending: 'En attente',
//   approved: 'Approuvé',
//   rejected: 'Rejeté'
// };

// const TYPE_LABELS: Record<string, string> = {
//   vacances: 'Vacances',
//   maladie: 'Maladie',
//   impayé: 'Congé sans solde',
//   autres: 'Autres'
// };

// export default function LeaveRequestList() {
//   const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [page, setPage] = useState(1);
//   const [meta, setMeta] = useState<LeaveRequestPaginatedResponse['meta'] | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     load();
//   }, [search, statusFilter, page]);

//   async function load() {
//     try {
//       setLoading(true);
      
//       // Les filtres sont passés dans un objet pour la fonction de service
//       const filters: { status?: string } = {};
//       if (statusFilter) {
//         filters.status = statusFilter;
//       }
      
//       const data = await fetchLeaveRequests(search, page, filters);
//       setLeaves(data.data);
//       setMeta(data.meta);
//     } catch (error) {
//       console.error("Erreur lors du chargement des demandes:", error);
//       alert("Impossible de charger les demandes de congé.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleDelete(id: number) {
//     if (!confirm("Supprimer cette demande de congé ?")) {
//       return;
//     }
    
//     try {
//       await deleteLeaveRequest(id);
//       alert("Demande supprimée avec succès !");
//       load();
//     } catch (error: unknown) {
//       console.error("Erreur suppression:", error);
      
//       if (error instanceof ApiError) {
//           alert(`Échec de la suppression: ${error.message}`);
//       } else {
//           alert("Échec de la suppression: Une erreur inattendue est survenue.");
//       }
//     }
//   }

//   // Fonction utilitaire pour obtenir le nom complet
//   const getEmployeeName = (leave: LeaveRequest): string => {
//     if (leave.employee) {
//       return `${leave.employee.first_name} ${leave.employee.last_name || ''}`.trim();
//     }
//     return `ID: ${leave.employee_id}`;
//   };

//   // Badge de statut coloré
//   const getStatusBadge = (status: string) => {
//     const colors: Record<string, string> = {
//       pending: '#ffc107',
//       approved: '#28a745',
//       rejected: '#dc3545'
//     };
    
//     return (
//       <span style={{
//         padding: '4px 8px',
//         borderRadius: '4px',
//         backgroundColor: colors[status] || '#6c757d',
//         color: 'white',
//         fontSize: '0.875rem',
//         fontWeight: 'bold'
//       }}>
//         {STATUS_LABELS[status] || status}
//       </span>
//     );
//   };

//   // Formater les dates
//   const formatDate = (dateString: string) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     // Assurez-vous que l'affichage est correct même si l'API retourne l'heure (dateOnly)
//     // Ici, nous utilisons toLocaleDateString qui gère bien les formats
//     return date.toLocaleDateString('fr-FR');
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//         <h1 style={{ margin: 0 }}>Demandes de congé</h1>
//         <Link 
//           to="create"
//           style={{
//             padding: '10px 20px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             textDecoration: 'none',
//             borderRadius: '4px',
//             fontWeight: 'bold'
//           }}
//         >
//           + Nouvelle demande
//         </Link>
//       </div>

//       {/* Filtres */}
//       <div style={{ 
//         display: 'flex', 
//         gap: '15px', 
//         marginBottom: '20px',
//         padding: '15px',
//         backgroundColor: '#f8f9fa',
//         borderRadius: '4px'
//       }}>
//         <div style={{ flex: 1 }}>
//           <input
//             type="text"
//             placeholder="Rechercher par employé, type..."
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setPage(1);
//             }}
//             style={{
//               width: '100%',
//               padding: '8px',
//               fontSize: '1rem',
//               border: '1px solid #ced4da',
//               borderRadius: '4px'
//             }}
//           />
//         </div>
        
//         <div>
//           <select
//             value={statusFilter}
//             onChange={(e) => {
//               setStatusFilter(e.target.value);
//               setPage(1);
//             }}
//             style={{
//               padding: '8px',
//               fontSize: '1rem',
//               border: '1px solid #ced4da',
//               borderRadius: '4px',
//               minWidth: '150px'
//             }}
//           >
//             <option value="">Tous les statuts</option>
//             <option value="pending">En attente</option>
//             <option value="approved">Approuvé</option>
//             <option value="rejected">Rejeté</option>
//           </select>
//         </div>
//       </div>

//       {/* Tableau */}
//       {loading ? (
//         <div style={{ textAlign: 'center', padding: '40px' }}>
//           <p>Chargement...</p>
//         </div>
//       ) : leaves.length === 0 ? (
//         <div style={{ 
//           textAlign: 'center', 
//           padding: '40px',
//           backgroundColor: '#f8f9fa',
//           borderRadius: '4px'
//         }}>
//           <p>Aucune demande de congé trouvée.</p>
//         </div>
//       ) : (
//         <>
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ 
//               width: '100%', 
//               borderCollapse: 'collapse',
//               backgroundColor: 'white',
//               boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
//             }}>
//               <thead>
//                 <tr style={{ backgroundColor: '#f8f9fa' }}>
//                   <th style={tableHeaderStyle}>ID</th>
//                   <th style={tableHeaderStyle}>Employé</th>
//                   <th style={tableHeaderStyle}>Type</th>
//                   <th style={tableHeaderStyle}>Date début</th>
//                   <th style={tableHeaderStyle}>Date fin</th>
//                   <th style={tableHeaderStyle}>Statut</th>
//                   <th style={tableHeaderStyle}>Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {leaves.map((leave) => (
//                   <tr key={leave.id} style={{ borderBottom: '1px solid #dee2e6' }}>
//                     <td style={tableCellStyle}>{leave.id}</td>
//                     <td style={tableCellStyle}>{getEmployeeName(leave)}</td>
//                     <td style={tableCellStyle}>{TYPE_LABELS[leave.type] || leave.type}</td>
//                     <td style={tableCellStyle}>{formatDate(leave.start_date)}</td>
//                     <td style={tableCellStyle}>{formatDate(leave.end_date)}</td>
//                     <td style={tableCellStyle}>{getStatusBadge(leave.status)}</td>
//                     <td style={tableCellStyle}>
//                       <div style={{ display: 'flex', gap: '8px' }}>
//                         <Link 
//                           to={`${leave.id}`}
//                           style={actionLinkStyle('#17a2b8')}
//                         >
//                           Voir
//                         </Link>
//                         <Link 
//                           to={`${leave.id}/edit`}
//                           style={actionLinkStyle('#ffc107')}
//                         >
//                           Modifier
//                         </Link>
//                         <button 
//                           onClick={() => handleDelete(leave.id)}
//                           style={{
//                             ...actionButtonStyle,
//                             backgroundColor: '#dc3545'
//                           }}
//                         >
//                           Supprimer
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {meta && meta.last_page > 1 && (
//             <div style={{ 
//               display: 'flex', 
//               justifyContent: 'center', 
//               alignItems: 'center',
//               gap: '10px',
//               marginTop: '20px',
//               padding: '15px'
//             }}>
//               <button 
//                 disabled={page <= 1} 
//                 onClick={() => setPage(page - 1)}
//                 style={{
//                   padding: '8px 16px',
//                   backgroundColor: page <= 1 ? '#e9ecef' : '#007bff',
//                   color: page <= 1 ? '#6c757d' : 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: page <= 1 ? 'not-allowed' : 'pointer',
//                   fontSize: '0.875rem'
//                 }}
//               >
//                 ← Précédent
//               </button>
              
//               <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
//                 Page {meta.current_page} sur {meta.last_page}
//               </span>
              
//               <button
//                 disabled={page >= meta.last_page}
//                 onClick={() => setPage(page + 1)}
//                 style={{
//                   padding: '8px 16px',
//                   backgroundColor: page >= meta.last_page ? '#e9ecef' : '#007bff',
//                   color: page >= meta.last_page ? '#6c757d' : 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: page >= meta.last_page ? 'not-allowed' : 'pointer',
//                   fontSize: '0.875rem'
//                 }}
//               >
//                 Suivant →
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// // Styles réutilisables (inchangés)
// const tableHeaderStyle: React.CSSProperties = {
//   padding: '12px',
//   textAlign: 'left',
//   fontWeight: 'bold',
//   borderBottom: '2px solid #dee2e6'
// };

// const tableCellStyle: React.CSSProperties = {
//   padding: '12px'
// };

// const actionLinkStyle = (color: string): React.CSSProperties => ({
//   padding: '4px 8px',
//   backgroundColor: color,
//   color: 'white',
//   textDecoration: 'none',
//   borderRadius: '3px',
//   fontSize: '0.875rem',
//   display: 'inline-block'
// });

// const actionButtonStyle: React.CSSProperties = {
//   padding: '4px 8px',
//   color: 'white',
//   border: 'none',
//   borderRadius: '3px',
//   fontSize: '0.875rem',
//   cursor: 'pointer'
// };