import { useEffect, useState, useCallback } from 'react';
import type { LeaveRequest } from '../leaveRequests/model';
import { ApiError, LeaveRequestService } from '../leaveRequests/service';

type ProcessingAction = {
    id: number;
    type: 'approve' | 'reject' | 'delete';
} | null;

// --- SKELETON POUR LE CHARGEMENT ---
const TableSkeleton = () => (
    <div className="sk-wrapper">
        <style>{`
            @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
            .sk-row { height: 80px; background: white; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; padding: 0 20px; gap: 20px; }
            .sk-cell { background: #f1f5f9; animation: pulse 1.5s infinite; border-radius: 6px; }
            @media (max-width: 992px) {
                .sk-row { flex-direction: column; height: auto; padding: 20px; align-items: flex-start; }
                .sk-cell { width: 100% !important; height: 15px !important; margin-bottom: 10px; }
            }
        `}</style>
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="sk-row">
                <div className="sk-cell" style={{ width: '20%', height: '20px' }}></div>
                <div className="sk-cell" style={{ width: '10%', height: '20px' }}></div>
                <div className="sk-cell" style={{ width: '20%', height: '20px' }}></div>
                <div className="sk-cell" style={{ width: '15%', height: '25px', borderRadius: '20px' }}></div>
                <div className="sk-cell" style={{ flexGrow: 1, height: '20px' }}></div>
            </div>
        ))}
    </div>
);

export default function AdminLeaveRequests() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingAction, setProcessingAction] = useState<ProcessingAction>(null);

    const sortRequests = (data: LeaveRequest[]) => {
        return [...data].sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime();
        });
    };

    const fetchLeaveRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await LeaveRequestService.fetchAllAdmin();
            setRequests(sortRequests(data));
        } catch (err: unknown) {
            setError("Erreur lors du chargement des demandes.");
        } finally {
            setTimeout(() => setLoading(false), 600);
        }
    }, []);

    useEffect(() => { fetchLeaveRequests(); }, [fetchLeaveRequests]);

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        const actionLabel = action === 'approve' ? 'APPROUVER' : 'REJETER';
        const comment = window.prompt(`Voulez-vous ${actionLabel} cette demande ?`, "");
        if (comment === null) return;

        setProcessingAction({ id, type: action });
        try {
            const updatedRequest = action === 'approve'
                ? await LeaveRequestService.approve(id, comment)
                : await LeaveRequestService.reject(id, comment);
            
            setRequests(prev => sortRequests(
                prev.map(req => req.id === id ? { ...updatedRequest, employee: req.employee } : req)
            ));
        } catch (err: unknown) {
            setError(err instanceof ApiError ? err.message : `Échec de l'action.`);
        } finally {
            setProcessingAction(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Supprimer définitivement cette demande ?")) return;
        setProcessingAction({ id, type: 'delete' });
        try {
            await LeaveRequestService.delete(id); 
            setRequests(prev => prev.filter(req => req.id !== id));
        } catch (err: unknown) {
            setError("Échec de la suppression.");
        } finally {
            setProcessingAction(null);
        }
    };

    return (
        <div className="admin-container">
            <style>{`
                .admin-container { padding: 20px; max-width: 1250px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; min-height: 100vh; }
                .page-header { margin-bottom: 25px; }
                .page-title { font-size: 26px; font-weight: 800; color: #0f172a; }

                /* ALERTES */
                .alert-error { 
                    background: #fef2f2; border: 1px solid #fee2e2; color: #991b1b; 
                    padding: 12px 16px; border-radius: 12px; margin-bottom: 20px; 
                    display: flex; align-items: center; justify-content: space-between; font-weight: 500;
                }

                /* TABLEAU CARD */
                .table-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
                table { width: 100%; border-collapse: collapse; }
                th { padding: 16px 20px; background: #f8fafc; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; text-align: left; }
                td { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                
                .row-pending { background-color: #fffbeb; }
                .emp-name { font-weight: 700; color: #1e293b; display: block; }
                .emp-id { font-size: 12px; color: #94a3b8; }
                
                .badge { padding: 5px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .badge-approved { background: #dcfce7; color: #15803d; }
                .badge-rejected { background: #fee2e2; color: #b91c1c; }
                .badge-pending { background: #fef3c7; color: #b45309; }
                
                .comment-box.admin { background: #eff6ff; border: 1px solid #dbeafe; padding: 10px; border-radius: 8px; font-size: 13px; color: #1e40af; margin-top: 8px; }

                .actions-cell { display: flex; gap: 8px; flex-wrap: wrap; }
                .btn-icon { border: none; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .btn-approve { background: #10b981; color: white; }
                .btn-reject { background: #ef4444; color: white; }
                .btn-delete { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

                /* RESPONSIVITÉ : TABLEAU -> CARTES */
                @media (max-width: 992px) {
                    table, thead, tbody, th, td, tr { display: block; }
                    thead tr { position: absolute; top: -9999px; left: -9999px; }
                    tr { border-bottom: 8px solid #f1f5f9; padding: 10px 0; }
                    td { 
                        border: none; position: relative; padding: 12px 20px 12px 45% !important; 
                        text-align: right; font-size: 13px; border-bottom: 1px inset #f8fafc;
                    }
                    td::before {
                        content: attr(data-label); position: absolute; left: 20px; width: 40%; 
                        text-align: left; font-weight: 800; font-size: 10px; color: #94a3b8; text-transform: uppercase;
                    }
                    .actions-cell { justify-content: flex-end; padding-top: 10px; }
                }
            `}</style>

            <div className="page-header">
                <h1 className="page-title">Gestion des congés</h1>
            </div>

            {error && (
                <div className="alert-error">
                    <span>⚠️ {error}</span>
                    <button style={{background:'none', border:'none', cursor:'pointer', fontSize: '18px'}} onClick={() => setError(null)}>&times;</button>
                </div>
            )}

            <div className="table-card">
                {loading ? <TableSkeleton /> : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employé</th>
                                    <th>Type</th>
                                    <th>Période</th>
                                    <th>Statut</th>
                                    <th>Détails</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req.id} className={req.status === 'pending' ? 'row-pending' : ''}>
                                        <td data-label="Employé">
                                            <span className="emp-name">{req.employee ? `${req.employee.first_name} ${req.employee.last_name}` : 'Inconnu'}</span>
                                            {/* <span className="emp-id">Matricule: {req.employee_id}</span> */}
                                        </td>
                                        <td data-label="Type"><strong>{req.type}</strong></td>
                                        <td data-label="Période">
                                            <div style={{fontSize: '13px'}}>Du {req.start_date}</div>
                                            <div style={{fontSize: '13px'}}>Au {req.end_date}</div>
                                        </td>
                                        <td data-label="Statut">
                                            <span className={`badge badge-${req.status}`}>
                                                {req.status === 'pending' ? 'En attente' : req.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                                            </span>
                                        </td>
                                        <td data-label="Détails" style={{maxWidth: '250px'}}>
                                            <div className="small text-muted italic">"{req.message || 'Sans motif'}"</div>
                                            {req.admin_comment && (
                                                <div className="comment-box admin">
                                                    <strong>Note :</strong> {req.admin_comment}
                                                </div>
                                            )}
                                        </td>
                                        <td data-label="Actions">
                                            <div className="actions-cell">
                                                {req.status === 'pending' ? (
                                                    <>
                                                        <button onClick={() => handleAction(req.id, 'approve')} disabled={!!processingAction} className="btn-icon btn-approve">Approuver</button>
                                                        <button onClick={() => handleAction(req.id, 'reject')} disabled={!!processingAction} className="btn-icon btn-reject">Rejeter</button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleDelete(req.id)} disabled={!!processingAction} className="btn-icon btn-delete">Supprimer</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}