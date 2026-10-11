import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { EmployeeService } from "./service";
import { toast } from "react-hot-toast";

// --- Composant Squelette pour le formulaire ---
const EditSkeleton = () => (
    <div className="container py-4 py-md-5">
        <div className="skeleton mb-4" style={{ width: '200px', height: '32px', borderRadius: '8px' }}></div>
        <div className="row g-4">
            <div className="col-12 col-lg-8">
                <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
                    <div className="skeleton mb-4" style={{ width: '30%', height: '24px' }}></div>
                    <div className="row g-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="col-md-6">
                                <div className="skeleton mb-2" style={{ width: '40%', height: '15px' }}></div>
                                <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: '6px' }}></div>
                            </div>
                        ))}
                    </div>
                    <hr className="my-4 opacity-25" />
                    <div className="skeleton mb-3" style={{ width: '25%', height: '24px' }}></div>
                    <div className="d-flex flex-wrap gap-2">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton rounded-pill" style={{ width: '80px', height: '32px' }}></div>)}
                    </div>
                </div>
            </div>
            <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
                    <div className="skeleton mb-4" style={{ width: '60%', height: '24px' }}></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="mb-3">
                            <div className="skeleton mb-2" style={{ width: '50%', height: '15px' }}></div>
                            <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: '6px' }}></div>
                        </div>
                    ))}
                </div>
                <div className="skeleton rounded-4" style={{ width: '100%', height: '55px' }}></div>
            </div>
        </div>
    </div>
);

export default function EmployeeEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [departments, setDepartments] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        hire_date: "",
        salary_base: 0,
        contract_type: "CDI",
        department_id: 0,
        role_ids: [] as number[],
        status: "actif"
    });

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get("/departments/list").then(res => res.data.data || res.data),
            api.get("/roles").then(res => res.data.data || res.data),
            EmployeeService.get(Number(id))
        ]).then(([deps, rolesList, empRes]) => {
            setDepartments(deps);
            setRoles(rolesList);
            
            // L'API renvoie directement l'employé (pas d'enveloppe { data })
            const emp = empRes;
            setForm({
                first_name: emp.first_name || "",
                last_name: emp.last_name || "",
                email: emp.email || "",
                phone: emp.phone || "",
                hire_date: emp.hire_date || "",
                salary_base: Number(emp.salary_base) || 0,
                contract_type: emp.contract_type || "CDI",
                department_id: emp.department_id || 0,
                role_ids: emp.roles ? emp.roles.map((r: any) => r.id) : [],
                status: emp.status || "actif"
            });
        })
        .catch(() => toast.error("Erreur de chargement"))
        .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await EmployeeService.update(Number(id), form);
            toast.success("Profil mis à jour avec succès");
            navigate(`/admin/employees`);
        } catch (err) {
            toast.error("Erreur lors de la modification.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <>
            <style>{`
                .skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: skeleton-loading 1.5s infinite ease-in-out;
                }
                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
            <EditSkeleton />
        </>
    );

    return (
        <div className="container py-4 py-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                    <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm me-3 border-0 shadow-sm rounded-3">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h2 className="fw-bold text-dark mb-0 h4">Modifier le Profil</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    {/* Colonne Gauche : Identité et Rôles */}
                    <div className="col-12 col-lg-8">
                        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
                            <h5 className="mb-4 d-flex align-items-center fw-bold text-dark">
                                <span className="bg-primary bg-opacity-10 p-2 rounded-3 me-2">
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0d6efd" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </span>
                                Identité & Contact
                            </h5>
                            
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Prénom</label>
                                    <input type="text" className="form-control border-light-subtle shadow-none" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Nom</label>
                                    <input type="text" className="form-control border-light-subtle shadow-none" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Email professionnel</label>
                                    <input type="email" className="form-control border-light-subtle shadow-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Téléphone</label>
                                    <input type="text" className="form-control border-light-subtle shadow-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                                </div>
                            </div>

                            <hr className="my-4 opacity-25" />

                            <h5 className="mb-4 d-flex align-items-center fw-bold text-dark">
                                <span className="bg-info bg-opacity-10 p-2 rounded-3 me-2">
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0dcaf0" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </span>
                                Rôles & Accès
                            </h5>
                            <div className="d-flex flex-wrap gap-2">
                                {roles.map(role => (
                                    <label key={role.id} className={`btn btn-sm px-3 py-2 rounded-pill border transition-all ${form.role_ids.includes(role.id) ? 'btn-primary shadow-sm border-primary' : 'btn-outline-light text-dark border-light-subtle'}`}>
                                        <input type="checkbox" className="d-none" checked={form.role_ids.includes(role.id)}
                                            onChange={e => {
                                                const ids = e.target.checked ? [...form.role_ids, role.id] : form.role_ids.filter(rid => rid !== role.id);
                                                setForm({...form, role_ids: ids});
                                            }} />
                                        {role.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Colonne Droite : Administratif */}
                    <div className="col-12 col-lg-4">
                        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
                            <h5 className="mb-4 fw-bold text-dark">Détails RH</h5>
                            
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Statut actuel</label>
                                <select className="form-select border-light-subtle shadow-none" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                    <option value="actif">En poste</option>
                                    <option value="demission">Démission</option>
                                    <option value="renvoyer">Renvoyé</option>
                                    <option value="retraite">Retraité</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Département</label>
                                <select className="form-select border-light-subtle shadow-none" value={form.department_id} onChange={e => setForm({...form, department_id: Number(e.target.value)})}>
                                    <option value="0">Aucun</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Type de contrat</label>
                                <select className="form-select border-light-subtle shadow-none" value={form.contract_type} onChange={e => setForm({...form, contract_type: e.target.value})}>
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="Stage">Stage</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Salaire de base (XOF)</label>
                                <input type="number" className="form-control border-light-subtle shadow-none" value={form.salary_base} onChange={e => setForm({...form, salary_base: Number(e.target.value)})} />
                            </div>
                        </div>

                        <div className="d-grid gap-2">
                            <button type="submit" disabled={submitting} className="btn btn-primary py-3 fw-bold rounded-4 shadow-sm">
                                {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : "Mettre à jour le profil"}
                            </button>
                            <button type="button" onClick={() => navigate(-1)} className="btn btn-light py-3 fw-semibold text-muted rounded-4 border-0">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}