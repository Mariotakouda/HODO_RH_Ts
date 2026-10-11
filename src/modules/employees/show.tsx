import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useParams, Link } from "react-router-dom";
import { EmployeeService } from "./service";
import type { Employee } from "./model";

// --- Composant Squelette spécifique au profil ---
const ProfileSkeleton = () => (
    <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
        <div className="skeleton mb-4" style={{ width: '150px', height: '24px', borderRadius: '4px' }}></div>
        
        {/* Header Skeleton */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
                <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                    <div className="skeleton rounded-circle" style={{ width: '120px', height: '120px' }}></div>
                    <div className="flex-grow-1 text-center text-md-start">
                        <div className="skeleton mb-3" style={{ width: '250px', height: '32px' }}></div>
                        <div className="skeleton" style={{ width: '180px', height: '20px' }}></div>
                    </div>
                    <div className="skeleton rounded-3" style={{ width: '140px', height: '40px' }}></div>
                </div>
            </div>
        </div>

        {/* Grid Skeleton */}
        <div className="row g-4">
            {[1, 2].map(i => (
                <div key={i} className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px', height: '200px' }}>
                        <div className="skeleton mb-4" style={{ width: '40%', height: '25px' }}></div>
                        <div className="skeleton mb-3" style={{ width: '80%', height: '20px' }}></div>
                        <div className="skeleton" style={{ width: '60%', height: '20px' }}></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default function EmployeeShow() {
    const { id } = useParams();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role?.toLowerCase() === "admin";
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (id) {
            EmployeeService.get(Number(id))
                .then(res => setEmployee(res))
                .catch(err => console.error("Erreur chargement employé:", err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const getInitials = () => {
        return `${employee?.first_name?.charAt(0) || ''}${employee?.last_name?.charAt(0) || ''}`.toUpperCase();
    };

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { label: string, class: string }> = {
            actif: { label: 'En poste', class: 'bg-success text-success border-success' },
            demission: { label: 'Démission', class: 'bg-warning text-dark border-warning' },
            renvoyer: { label: 'Renvoyé', class: 'bg-danger text-danger border-danger' },
            retraite: { label: 'Retraité', class: 'bg-info text-info border-info' }
        };
        const config = configs[status] || configs.actif;
        return (
            <span className={`badge rounded-pill px-3 py-2 bg-opacity-10 border ${config.class}`}>
                {config.label}
            </span>
        );
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
            <ProfileSkeleton />
        </>
    );

    if (!employee) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-warning">Employé introuvable.</div>
                <Link to="/admin/employees" className="btn btn-primary">Retour à la liste</Link>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
            {/* Barre de navigation haute */}
            <div className="mb-4">
                <Link to="/admin/employees" className="text-decoration-none d-inline-flex align-items-center text-muted fw-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="me-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à l'annuaire
                </Link>
            </div>

            {/* Header Profil */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                    <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                        <div className="flex-shrink-0">
                            {employee.profile_photo_url ? (
                                <img 
                                    src={employee.profile_photo_url} 
                                    className="rounded-circle border border-4 border-white shadow-sm" 
                                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                    alt="Profil"
                                />
                            ) : (
                                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                                     style={{ width: '120px', height: '120px', fontSize: '40px', background: '#2563eb' }}>
                                    {getInitials()}
                                </div>
                            )}
                        </div>

                        <div className="text-center text-md-start flex-grow-1">
                            <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-2">
                                <h1 className="h2 fw-bold text-dark mb-0">{employee.first_name} {employee.last_name}</h1>
                                <div className="d-flex gap-2 justify-content-center">
                                    {getStatusBadge(employee.status)}
                                    <span className="badge bg-light text-secondary border rounded-pill px-3 py-2">
                                        {employee.contract_type || 'Type non défini'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-muted d-flex align-items-center justify-content-center justify-content-md-start mb-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="me-2 text-primary">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {employee.department?.name || 'Aucun département'}
                            </p>
                        </div>

                        <div className="mt-3 mt-md-0">
                            {isAdmin && (
                                <div className="d-flex gap-2">
                                    <Link to={`/admin/employees/${employee.id}/file`} className="btn btn-primary px-4 py-2 d-flex align-items-center shadow-sm" style={{ borderRadius: '10px' }}>
                                        Dossier
                                    </Link>
                                    <Link to={`/admin/employees/${employee.id}/edit`} className="btn btn-dark px-4 py-2 d-flex align-items-center shadow-sm" style={{ borderRadius: '10px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="me-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                            </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grille d'informations */}
            <div className="row g-4">
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center text-dark">
                                <span className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#4e73df" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                Coordonnées
                            </h5>
                            <div className="mb-3">
                                <label className="text-muted small d-block mb-1">Email professionnel</label>
                                <span className="fw-medium text-dark">{employee.email}</span>
                            </div>
                            <div className="mb-0">
                                <label className="text-muted small d-block mb-1">Téléphone</label>
                                <span className="fw-medium text-dark">{employee.phone || 'Non renseigné'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center text-dark">
                                <span className="bg-success bg-opacity-10 p-2 rounded-3 me-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#198754" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                Détails administratifs
                            </h5>
                            <div className="row">
                                <div className="col-sm-6 mb-3">
                                    <label className="text-muted small d-block mb-1">Date d'embauche</label>
                                    <span className="fw-medium text-dark">
                                        {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('fr-FR') : 'Non renseignée'}
                                    </span>
                                </div>
                                <div className="col-sm-6 mb-3">
                                    <label className="text-muted small d-block mb-1">Salaire mensuel</label>
                                    <span className="fw-medium text-dark">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(employee.salary_base ?? 0)}
                                    </span>
                                </div>
                                <div className="col-12">
                                    <label className="text-muted small d-block mb-1">Rôles système</label>
                                    <div className="d-flex gap-2 mt-1 flex-wrap">
                                        {employee.roles && employee.roles.length > 0 ? (
                                            employee.roles.map((role: any) => (
                                                <span key={role.id} className="badge bg-light text-secondary border px-2 py-1 fw-normal">
                                                    {role.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-muted small italic">Aucun rôle spécifique</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}