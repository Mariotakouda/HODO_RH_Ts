// // src/modules/employee/EmployeeAnnouncementsView.tsx

// import { useEffect, useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { fetchMyAnnouncements, checkManagerStatus } from "../announcements/service";
// import { AuthContext } from "../../context/AuthContext";
// import type { Announcement } from "../announcements/model";
// import type { ManagerStatus } from "../announcements/service";

// export default function EmployeeAnnouncementsView() {
//   const [announcements, setAnnouncements] = useState<Announcement[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [managerStatus, setManagerStatus] = useState<ManagerStatus | null>(null);
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadData();
//   }, []);

//   async function loadData() {
//     try {
//       setLoading(true);
//       const [announcementsData, status] = await Promise.all([
//         fetchMyAnnouncements(),
//         checkManagerStatus()
//       ]);
//       setAnnouncements(announcementsData);
//       setManagerStatus(status);
//       setError("");
//     } catch (err: any) {
//       console.error("Erreur chargement annonces:", err);
//       setError("Impossible de charger les annonces");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function getAnnouncementType(announcement: Announcement): { label: string; color: string; icon: string } {
//     if (announcement.is_general) {
//       return { label: "Général", color: "#e3f2fd", icon: "🌐" };
//     }
//     if (announcement.department) {
//       return { label: `Département: ${announcement.department.name}`, color: "#fff3e0", icon: "🏢" };
//     }
//     if (announcement.employee) {
//       return { label: "Personnel", color: "#f3e5f5", icon: "👤" };
//     }
//     return { label: "Annonce", color: "#f5f5f5", icon: "📢" };
//   }

//   // 🔥 CORRECTION : Vérifier si l'utilisateur peut gérer les annonces
//   const canManageAnnouncements = user?.role === 'admin' || managerStatus?.is_manager || false;

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Chargement...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h1 className="h3 mb-0">📢 Mes Annonces</h1>
//         <div className="d-flex gap-2">
//           <button 
//             onClick={loadData} 
//             className="btn btn-outline-secondary btn-sm rounded-pill"
//           >
//             Actualiser
//           </button>
          
//           {/* 🔥 CORRECTION : Bouton créer uniquement pour admin/manager */}
//           {canManageAnnouncements && (
//             <button
//               onClick={() => navigate('/employee/announcements/create')}
//               className="btn btn-primary btn-sm rounded-pill d-flex align-items-center gap-2"
//             >
//               <span>+</span> Nouvelle annonce
//             </button>
//           )}
//         </div>
//       </div>

//       {/* 🔥 Info pour les employés simples */}
//       {!canManageAnnouncements && (
//         <div className="alert alert-info border-0 shadow-sm mb-4" role="alert">
//           <div className="d-flex align-items-center gap-2">
//             <span style={{ fontSize: '20px' }}>ℹ️</span>
//             <span>Vous consultez les annonces. Seuls les managers et administrateurs peuvent en créer.</span>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="alert alert-danger shadow-sm border-0 rounded-3 mb-4" role="alert">
//           <i className="bi bi-exclamation-triangle-fill me-2"></i>
//           {error}
//         </div>
//       )}

//       {announcements.length === 0 ? (
//         <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
//           <div className="mb-3 text-muted display-4">📭</div>
//           <p className="fs-5 text-secondary">Aucune annonce pour le moment</p>
//         </div>
//       ) : (
//         <div style={{ 
//           display: "grid", 
//           gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
//           gap: "24px" 
//         }}>
//           {announcements.map((announcement) => {
//             const type = getAnnouncementType(announcement);
//             return (
//               <div
//                 key={announcement.id}
//                 className="card border-0 shadow-sm h-100 transition-all"
//                 style={{
//                   cursor: "pointer",
//                   borderRadius: "16px",
//                   overflow: "hidden",
//                   borderLeft: `5px solid ${type.color === "#f5f5f5" ? "#dee2e6" : type.color}`
//                 }}
//                 onClick={() => navigate(`/employee/announcements/${announcement.id}`)}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = "translateY(-5px)";
//                   e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = "translateY(0)";
//                   e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
//                 }}
//               >
//                 <div className="card-body p-4 d-flex flex-column">
//                   {/* Badge de type */}
//                   <div className="mb-3">
//                     <span 
//                       className="badge py-2 px-3 rounded-pill"
//                       style={{ 
//                         backgroundColor: type.color, 
//                         color: "#333",
//                         fontSize: "11px",
//                         fontWeight: "600",
//                         letterSpacing: "0.3px"
//                       }}
//                     >
//                       {type.icon} {type.label.toUpperCase()}
//                     </span>
//                   </div>

//                   {/* Titre */}
//                   <h5 className="card-title fw-bold mb-2 text-dark">
//                     {announcement.title}
//                   </h5>

//                   {/* Aperçu du message */}
//                   <p className="card-text text-muted mb-4 flex-grow-1" style={{ 
//                     fontSize: "14px", 
//                     lineHeight: "1.6",
//                     display: "-webkit-box",
//                     WebkitLineClamp: 3,
//                     WebkitBoxOrient: "vertical",
//                     overflow: "hidden"
//                   }}>
//                     {announcement.message}
//                   </p>

//                   {/* Footer de la carte */}
//                   <div className="mt-auto d-flex align-items-center justify-content-between pt-3 border-top">
//                     <small className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: "12px" }}>
//                       <span role="img" aria-label="clock">🕒</span>
//                       {announcement.created_at 
//                         ? new Date(announcement.created_at).toLocaleDateString('fr-FR', {
//                             day: 'numeric',
//                             month: 'short',
//                           })
//                         : "-"
//                       }
//                     </small>
//                     <span className="text-primary fw-bold" style={{ fontSize: "12px" }}>
//                       Lire la suite →
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       <style>{`
//         .transition-all {
//           transition: all 0.3s ease;
//         }
//       `}</style>
//     </div>
//   );
// }