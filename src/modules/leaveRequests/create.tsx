// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { createLeaveRequest, ApiError } from "./service";
// import { EmployeeService } from "../employees/service"; 
// import type { CreateLeaveRequest } from "./model";
// import type { EmployeeSelect } from "../employees/model";

// // Le formulaire utilise des chaînes de caractères pour les sélections
// interface LeaveRequestForm extends Omit<CreateLeaveRequest, 'type' | 'employee_id'> {
//     employee_id: string; 
//     type: string;
// }

// const LEAVE_TYPES = [
//     { value: 'vacances', label: 'Vacances' },
//     { value: 'maladie', label: 'Maladie' },
//     { value: 'impayé', label: 'Congé sans solde' },
//     { value: 'autres', label: 'Autres' }
// ];

// // Fonction pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
// const getTodayString = (): string => {
//     const today = new Date();
//     return today.toISOString().split('T')[0];
// };

// // Fonction pour obtenir une date dans X jours
// const getDateInDays = (days: number): string => {
//     const date = new Date();
//     date.setDate(date.getDate() + days);
//     return date.toISOString().split('T')[0];
// };

// export default function LeaveRequestCreate() {
//     const nav = useNavigate();
//     const [employees, setEmployees] = useState<EmployeeSelect[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [errors, setErrors] = useState<Record<string, string[]>>({});
//     const [generalError, setGeneralError] = useState<string>("");
    
//     const [form, setForm] = useState<LeaveRequestForm>({
//         employee_id: "",
//         type: "",
//         start_date: getTodayString(), // Date du jour par défaut
//         end_date: getDateInDays(1), // Demain par défaut
//         message: "",
//     });

//     useEffect(() => {
//         loadEmployees();
//     }, []);

//     async function loadEmployees() {
//         try {
//             const res = await EmployeeService.fetchAllForSelect();
//             setEmployees(res);
//             console.log("✅ Employés chargés:", res.length);
//         } catch (e) {
//             console.error("❌ Erreur chargement employés:", e);
//             setGeneralError("Impossible de charger la liste des employés.");
//         }
//     }

//     function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
//         const { name, value } = e.target;
        
//         // Réinitialiser les erreurs
//         if (errors[name]) {
//             const newErrors = { ...errors };
//             delete newErrors[name];
//             setErrors(newErrors);
//         }
        
//         setGeneralError("");
        
//         setForm((prevForm) => ({
//             ...prevForm,
//             [name]: value,
//         }));
//     }

//     async function handleSubmit(e: React.FormEvent) {
//         e.preventDefault();
        
//         // Validation côté client (réduit la latence)
//         const clientErrors: Record<string, string[]> = {};
        
//         if (!form.employee_id || form.employee_id === "") {
//             clientErrors.employee_id = ["Veuillez sélectionner un employé."];
//         }
        
//         if (!form.type || form.type === "") {
//             clientErrors.type = ["Veuillez sélectionner un type de congé."];
//         }
        
//         if (!form.start_date) {
//             clientErrors.start_date = ["La date de début est requise."];
//         }
        
//         if (!form.end_date) {
//             clientErrors.end_date = ["La date de fin est requise."];
//         }
        
//         if (form.start_date && form.end_date && form.start_date > form.end_date) {
//             clientErrors.end_date = ["La date de fin doit être après la date de début."];
//         }
        
//         if (Object.keys(clientErrors).length > 0) {
//             setErrors(clientErrors);
//             setGeneralError("Veuillez corriger les erreurs dans le formulaire.");
//             return;
//         }

//         setLoading(true);
//         setErrors({});
//         setGeneralError("");
        
//         try {
//             // Conversion et envoi des données (sans le statut)
//             const dataToSend: CreateLeaveRequest = {
//                 employee_id: parseInt(form.employee_id, 10),
//                 type: form.type,
//                 start_date: form.start_date,
//                 end_date: form.end_date,
//                 message: form.message || null,
//             };

//             await createLeaveRequest(dataToSend);
            
//             alert("✅ Demande de congé créée avec succès !");
//             nav("/admin/leave_requests");

//         } catch (error: unknown) {
//             if (error instanceof ApiError) {
//                 if (error.status === 422 && error.errors) {
//                     setErrors(error.errors);
//                     setGeneralError("Erreur de validation. Vérifiez les champs ci-dessous.");
//                 } else {
//                     setGeneralError(`Échec de la création: ${error.message}`);
//                 }
//             } else {
//                 setGeneralError("Une erreur inattendue est survenue.");
//             }
//         } finally {
//             setLoading(false);
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

//     return (
//         <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
//             <h1 style={{ marginBottom: '10px' }}>Créer une demande de congé</h1>
//             <p style={{ color: '#6c757d', marginBottom: '30px' }}>
//                 Remplissez le formulaire ci-dessous pour soumettre une nouvelle demande.
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

//             {employees.length === 0 && !loading && (
//                 <div style={{
//                     padding: '15px',
//                     marginBottom: '20px',
//                     backgroundColor: '#fff3cd',
//                     color: '#856404',
//                     border: '1px solid #ffeeba',
//                     borderRadius: '6px'
//                 }}>
//                     ⚠️ Aucun employé disponible. Veuillez d'abord créer des employés.
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
//                     <label htmlFor="employee_id" style={{ 
//                         display: 'block', 
//                         marginBottom: '8px', 
//                         fontWeight: '600',
//                         color: '#212529'
//                     }}>
//                         Employé <span style={{ color: '#dc3545' }}>*</span>
//                     </label>
//                     <select 
//                         name="employee_id" 
//                         id="employee_id"
//                         value={form.employee_id} 
//                         onChange={handleChange} 
//                         required
//                         style={{ 
//                             width: '100%', 
//                             padding: '10px 12px', 
//                             fontSize: '1rem',
//                             border: errors.employee_id ? '2px solid #dc3545' : '1px solid #ced4da',
//                             borderRadius: '6px',
//                             backgroundColor: 'white',
//                             cursor: 'pointer'
//                         }}
//                     >
//                         <option value="">-- Sélectionnez un employé --</option>
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
//                     <label htmlFor="type" style={{ 
//                         display: 'block', 
//                         marginBottom: '8px', 
//                         fontWeight: '600',
//                         color: '#212529'
//                     }}>
//                         Type de congé <span style={{ color: '#dc3545' }}>*</span>
//                     </label>
//                     <select 
//                         name="type" 
//                         id="type"
//                         value={form.type} 
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
//                         <label htmlFor="start_date" style={{ 
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
//                             id="start_date"
//                             value={form.start_date}
//                             onChange={handleChange} 
//                             required 
//                             min={getTodayString()}
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
//                         <label htmlFor="end_date" style={{ 
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
//                             id="end_date"
//                             value={form.end_date}
//                             onChange={handleChange} 
//                             required 
//                             min={form.start_date || getTodayString()}
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
                
//                 {/* Message */}
//                 <div>
//                     <label htmlFor="message" style={{ 
//                         display: 'block', 
//                         marginBottom: '8px', 
//                         fontWeight: '600',
//                         color: '#212529'
//                     }}>
//                         Message <span style={{ color: '#6c757d', fontWeight: '400' }}>(optionnel)</span>
//                     </label>
//                     <textarea 
//                         name="message" 
//                         id="message"
//                         placeholder="Commentaire ou justification de votre demande..."
//                         value={form.message ?? ""}
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
//                         disabled={loading || employees.length === 0}
//                         style={{ 
//                             flex: 1,
//                             padding: '12px 24px', 
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             backgroundColor: (loading || employees.length === 0) ? '#ccc' : '#007bff',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '6px',
//                             cursor: (loading || employees.length === 0) ? 'not-allowed' : 'pointer',
//                             transition: 'background-color 0.2s'
//                         }}
//                         onMouseOver={(e) => {
//                             if (!loading && employees.length > 0) {
//                                 e.currentTarget.style.backgroundColor = '#0056b3';
//                             }
//                         }}
//                         onMouseOut={(e) => {
//                             if (!loading && employees.length > 0) {
//                                 e.currentTarget.style.backgroundColor = '#007bff';
//                             }
//                         }}
//                     >
//                         {loading ? '⏳ Création en cours...' : '✅ Créer la demande'}
//                     </button>
                    
//                     <button 
//                         type="button"
//                         onClick={() => nav("/admin/leave_requests")}
//                         disabled={loading}
//                         style={{ 
//                             padding: '12px 24px', 
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             backgroundColor: '#6c757d',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '6px',
//                             cursor: loading ? 'not-allowed' : 'pointer',
//                             transition: 'background-color 0.2s'
//                         }}
//                         onMouseOver={(e) => {
//                             if (!loading) {
//                                 e.currentTarget.style.backgroundColor = '#5a6268';
//                             }
//                         }}
//                         onMouseOut={(e) => {
//                             if (!loading) {
//                                 e.currentTarget.style.backgroundColor = '#6c757d';
//                             }
//                         }}
//                     >
//                         Annuler
//                     </button>
//                 </div>
//             </form>

//             <div style={{
//                 marginTop: '20px',
//                 padding: '15px',
//                 backgroundColor: '#e7f3ff',
//                 border: '1px solid #b3d9ff',
//                 borderRadius: '6px',
//                 fontSize: '0.875rem',
//                 color: '#004085'
//             }}>
//                 💡 <strong>Astuce :</strong> La demande sera initialement en statut "En attente". Un administrateur devra la traiter.
//             </div>
//         </div>
//     );
// }