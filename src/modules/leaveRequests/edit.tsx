// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { getLeaveRequest, updateLeaveRequest, ApiError } from "./service";
// import { EmployeeService } from "../employees/service"; 
// import type { LeaveRequest, UpdateLeaveRequest } from "./model";
// import type { EmployeeSelect } from "../employees/model";

// // Types de congé disponibles
// const LEAVE_TYPES = [
//     { value: 'vacances', label: 'Vacances' },
//     { value: 'maladie', label: 'Maladie' },
//     { value: 'impayé', label: 'Congé sans solde' },
//     { value: 'autres', label: 'Autres' }
// ];

// const STATUS_OPTIONS = [
//     { value: 'pending', label: 'En attente' },
//     { value: 'approved', label: 'Approuvé' },
//     { value: 'rejected', label: 'Rejeté' }
// ];

// // État du formulaire basé sur LeaveRequest
// type LeaveRequestEditForm = Partial<LeaveRequest> & {
//     employee_id?: number | 0; 
//     status?: 'pending' | 'approved' | 'rejected' | string; 
// };

// export default function LeaveRequestEdit() {
//     const { id } = useParams();
//     const nav = useNavigate();
    
//     const [form, setForm] = useState<LeaveRequestEditForm>({});
//     const [employees, setEmployees] = useState<EmployeeSelect[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [errors, setErrors] = useState<Record<string, string[]>>({});
//     const [generalError, setGeneralError] = useState<string>("");

//     useEffect(() => {
//         loadData();
//     }, [id]);

//     async function loadData() {
//         try {
//             setLoading(true);
//             if (!id) throw new Error("ID manquant dans l'URL.");
            
//             const [leaveData, employeesData] = await Promise.all([
//                 getLeaveRequest(Number(id)),
//                 EmployeeService.fetchAllForSelect()
//             ]);
            
//             // Formatage des dates pour les inputs type="date"
//             setForm({ 
//                 ...leaveData,
//                 start_date: leaveData.start_date?.split("T")[0] || leaveData.start_date,
//                 end_date: leaveData.end_date?.split("T")[0] || leaveData.end_date,
//                 employee_id: Number(leaveData.employee_id) 
//             });
            
//             setEmployees(employeesData);
//         } catch (e) {
//             console.error("Erreur chargement édition:", e);
//             setGeneralError("Impossible de charger les données ou la liste des employés.");
//             // On ne redirige pas immédiatement pour laisser le message d'erreur
//         } finally {
//             setLoading(false);
//         }
//     }

//     function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
//         const { name, value } = e.target;
        
//         if (errors[name]) {
//             const newErrors = { ...errors };
//             delete newErrors[name];
//             setErrors(newErrors);
//         }
//         setGeneralError("");
        
//         setForm((prevForm) => ({ 
//             ...prevForm, 
//             [name]: name === "employee_id" ? Number(value) : value 
//         }));
//     }

//     async function handleSubmit(e: React.FormEvent) {
//         e.preventDefault();
        
//         setSaving(true);
//         setErrors({});
//         setGeneralError("");
        
//         try {
//             if (!id) throw new Error("ID de demande manquant.");

//             // Validation de base pour les champs obligatoires
//             if (!form.employee_id || !form.type || !form.start_date || !form.end_date || !form.status) {
//                 setGeneralError("Veuillez remplir tous les champs obligatoires.");
//                 setSaving(false);
//                 return;
//             }

//             // Création de l'objet de mise à jour, incluant le statut
//             const dataToSend: UpdateLeaveRequest = {
//                 employee_id: form.employee_id,
//                 type: form.type,
//                 start_date: form.start_date,
//                 end_date: form.end_date,
//                 status: form.status as 'pending' | 'approved' | 'rejected', // Assurez le type
//                 message: form.message || null,
//             };
            
//             await updateLeaveRequest(Number(id), dataToSend);
            
//             alert("✅ Demande mise à jour avec succès !");
//             nav("/admin/leave_requests");

//         } catch (error: unknown) {
//             if (error instanceof ApiError) {
//                 if (error.status === 422 && error.errors) {
//                     setErrors(error.errors);
//                     setGeneralError("Erreur de validation. Vérifiez les champs.");
//                 } else {
//                     setGeneralError(`Échec de la mise à jour: ${error.message}`);
//                 }
//             } else {
//                 setGeneralError("Une erreur inattendue est survenue.");
//             }
//         } finally {
//             setSaving(false);
//         }
//     }

//     const renderFieldError = (fieldName: string) => {
//         if (errors[fieldName]) {
//             return (
//                 <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: '500' }}>
//                     ⚠️ {errors[fieldName].join(', ')}
//                 </div>
//             );
//         }
//         return null;
//     };

//     if (loading) {
//         return (
//             <div style={{ textAlign: 'center', padding: '40px' }}>
//                 <p>⏳ Chargement des données...</p>
//             </div>
//         );
//     }

//     if (!form.id) {
//         return (
//             <div style={{ textAlign: 'center', padding: '40px' }}>
//                 <p>❌ Demande de congé introuvable</p>
//             </div>
//         );
//     }

//     // Le champ employé est désactivé si le statut n'est pas "pending"
//     const isEmployeeFieldDisabled = form.status !== 'pending';

//     return (
//         <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
//             <h1 style={{ marginBottom: '10px' }}>Modifier la demande #{id}</h1>
//             <p style={{ color: '#6c757d', marginBottom: '30px' }}>
//                 Utilisez ce formulaire pour ajuster les dates ou modifier le statut.
//             </p>

//             {generalError && (
//                 <div style={{
//                     padding: '15px',
//                     marginBottom: '20px',
//                     backgroundColor: '#f8d7da',
//                     color: '#721c24',
//                     border: '1px solid #f5c6cb',
//                     borderRadius: '6px',
//                     fontWeight: '500'
//                 }}>
//                     ❌ {generalError}
//                 </div>
//             )}

//             <form onSubmit={handleSubmit} style={{ 
//                 display: 'flex', 
//                 flexDirection: 'column', 
//                 gap: '20px',
//                 backgroundColor: 'white',
//                 padding: '30px',
//                 borderRadius: '8px',
//                 boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//             }}>
                
//                 {/* Employé */}
//                 <div>
//                     <label htmlFor="employee_id_edit" style={{ 
//                         display: 'block', 
//                         marginBottom: '8px', 
//                         fontWeight: '600',
//                         color: '#212529'
//                     }}>
//                         Employé <span style={{ color: '#dc3545' }}>*</span>
//                         {isEmployeeFieldDisabled && <span style={{ color: '#6c757d', fontWeight: '400', marginLeft: '10px' }}>(Non modifiable une fois traité)</span>}
//                     </label>
//                     <select 
//                         name="employee_id" 
//                         id="employee_id_edit"
//                         value={form.employee_id || 0} 
//                         onChange={handleChange} 
//                         required
//                         disabled={isEmployeeFieldDisabled} 
//                         style={{ 
//                             width: '100%', 
//                             padding: '10px 12px', 
//                             fontSize: '1rem',
//                             border: errors.employee_id ? '2px solid #dc3545' : '1px solid #ced4da',
//                             borderRadius: '6px',
//                             backgroundColor: isEmployeeFieldDisabled ? '#f0f0f0' : 'white',
//                             cursor: isEmployeeFieldDisabled ? 'not-allowed' : 'pointer'
//                         }}
//                     >
//                         <option value={0}>-- Sélectionnez un employé --</option>
//                         {employees.map(e => (
//                             <option key={e.id} value={e.id}>
//                                 {`${e.first_name} ${e.last_name || ''}`}
//                             </option>
//                         ))}
//                     </select>
//                     {renderFieldError('employee_id')}
//                 </div>
                
//                 {/* Type de congé */}
//                 <div>
//                     <label htmlFor="type_edit" style={{ 
//                         display: 'block', 
//                         marginBottom: '8px', 
//                         fontWeight: '600',
//                         color: '#212529'
//                     }}>
//                         Type de congé <span style={{ color: '#dc3545' }}>*</span>
//                     </label>
//                     <select 
//                         name="type" 
//                         id="type_edit"
//                         value={form.type || ""} 
//                         onChange={handleChange} 
//                         required
//                         style={{ 
//                             width: '100%', 
//                             padding: '10px 12px', 
//                             fontSize: '1rem',
//                             border: errors.type ? '2px solid #dc3545' : '1px solid #ced4da',
//                             borderRadius: '6px',
//                             backgroundColor: 'white',
//                             cursor: 'pointer'
//                         }}
//                     >
//                         <option value="">-- Sélectionnez un type --</option>
//                         {LEAVE_TYPES.map(type => (
//                             <option key={type.value} value={type.value}>
//                                 {type.label}
//                             </option>
//                         ))}
//                     </select>
//                     {renderFieldError('type')}
//                 </div>
                
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
//                     {/* Date de début */}
//                     <div>
//                         <label htmlFor="start_date_edit" style={{ 
//                             display: 'block', 
//                             marginBottom: '8px', 
//                             fontWeight: '600',
//                             color: '#212529'
//                         }}>
//                             Date de début <span style={{ color: '#dc3545' }}>*</span>
//                         </label>
//                         <input 
//                             type="date" 
//                             name="start_date" 
//                             id="start_date_edit"
//                             value={form.start_date || ""}
//                             onChange={handleChange} 
//                             required 
//                             style={{ 
//                                 width: '100%', 
//                                 padding: '10px 12px', 
//                                 fontSize: '1rem',
//                                 border: errors.start_date ? '2px solid #dc3545' : '1px solid #ced4da',
//                                 borderRadius: '6px'
//                             }}
//                         />
//                         {renderFieldError('start_date')}
//                     </div>
                    
//                     {/* Date de fin */}
//                     <div>
//                         <label htmlFor="end_date_edit" style={{ 
//                             display: 'block', 
//                             marginBottom: '8px', 
//                             fontWeight: '600',
//                             color: '#212529'
//                         }}>
//                             Date de fin <span style={{ color: '#dc3545' }}>*</span>
//                         </label>
//                         <input 
//                             type="date" 
//                             name="end_date" 
//                             id="end_date_edit"
//                             value={form.end_date || ""}
//                             onChange={handleChange} 
//                             required 
//                             style={{ 
//                                 width: '100%', 
//                                 padding: '10px 12px', 
//                                 fontSize: '1rem',
//                                 border: errors.end_date ? '2px solid #dc3545' : '1px solid #ced4da',
//                                 borderRadius: '6px'
//                             }}
//                         />
//                         {renderFieldError('end_date')}
//                     </div>
//                 </div>
                
//                 {/* Statut */}
//                 <div>
//                     <label htmlFor="status_edit" style={{ 
//                         display: 'block', 
//                         marginBottom: '8px', 
//                         fontWeight: '600',
//                         color: '#212529'
//                     }}>
//                         Statut <span style={{ color: '#dc3545' }}>*</span>
//                     </label>
//                     <select 
//                         name="status" 
//                         id="status_edit"
//                         value={form.status || "pending"} 
//                         onChange={handleChange}
//                         style={{ 
//                             width: '100%', 
//                             padding: '10px 12px', 
//                             fontSize: '1rem',
//                             border: errors.status ? '2px solid #dc3545' : '1px solid #ced4da',
//                             borderRadius: '6px',
//                             backgroundColor: 'white',
//                             cursor: 'pointer'
//                         }}
//                     >
//                         {STATUS_OPTIONS.map(status => (
//                             <option key={status.value} value={status.value}>
//                                 {status.label}
//                             </option>
//                         ))}
//                     </select>
//                     {renderFieldError('status')}
//                 </div>
                
//                 {/* Message */}
//                 <div>
//                     <label htmlFor="message_edit" style={{ 
//                         display: 'block', 
//                         marginBottom: '8px', 
//                         fontWeight: '600',
//                         color: '#212529'
//                     }}>
//                         Message <span style={{ color: '#6c757d', fontWeight: '400' }}>(optionnel)</span>
//                     </label>
//                     <textarea 
//                         name="message" 
//                         id="message_edit"
//                         placeholder="Commentaire ou justification..."
//                         value={form.message || ""}
//                         onChange={handleChange}
//                         rows={4}
//                         style={{ 
//                             width: '100%', 
//                             padding: '10px 12px', 
//                             fontSize: '1rem', 
//                             resize: 'vertical',
//                             border: '1px solid #ced4da',
//                             borderRadius: '6px',
//                             fontFamily: 'inherit'
//                         }}
//                     />
//                     {renderFieldError('message')}
//                 </div>

//                 {/* Boutons d'action */}
//                 <div style={{ 
//                     display: 'flex', 
//                     gap: '12px', 
//                     marginTop: '10px',
//                     paddingTop: '20px',
//                     borderTop: '1px solid #dee2e6'
//                 }}>
//                     <button 
//                         type="submit" 
//                         disabled={saving}
//                         style={{ 
//                             flex: 1,
//                             padding: '12px 24px', 
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             backgroundColor: saving ? '#ccc' : '#28a745',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '6px',
//                             cursor: saving ? 'not-allowed' : 'pointer',
//                             transition: 'background-color 0.2s'
//                         }}
//                         onMouseOver={(e) => {
//                             if (!saving) {
//                                 e.currentTarget.style.backgroundColor = '#1e7e34';
//                             }
//                         }}
//                         onMouseOut={(e) => {
//                             if (!saving) {
//                                 e.currentTarget.style.backgroundColor = '#28a745';
//                             }
//                         }}
//                     >
//                         {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
//                     </button>
                    
//                     <button 
//                         type="button"
//                         onClick={() => nav("/admin/leave_requests")}
//                         disabled={saving}
//                         style={{ 
//                             padding: '12px 24px', 
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             backgroundColor: '#6c757d',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '6px',
//                             cursor: saving ? 'not-allowed' : 'pointer',
//                             transition: 'background-color 0.2s'
//                         }}
//                         onMouseOver={(e) => {
//                             if (!saving) {
//                                 e.currentTarget.style.backgroundColor = '#5a6268';
//                             }
//                         }}
//                         onMouseOut={(e) => {
//                             if (!saving) {
//                                 e.currentTarget.style.backgroundColor = '#6c757d';
//                             }
//                         }}
//                     >
//                         Annuler
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }