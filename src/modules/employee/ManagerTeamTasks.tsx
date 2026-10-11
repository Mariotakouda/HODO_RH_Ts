import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';

// --- ICONS SVG ---
const Icons = {
    Users: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><circle cx="19" cy="11" r="2"/></svg>,
    Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
    Empty: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
};

// --- TYPES ---
interface Task {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    due_date: string;
    employee: {
        id: number;
        first_name: string;
        last_name: string;
        department?: { name: string; };
    };
}

interface Stats {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
}

// --- SKELETON COMPONENT ---
const ManagerTasksSkeleton = () => (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <style>{`
            @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
            .skel { background: #e2e8f0; animation: pulse 1.5s infinite; border-radius: 6px; }
        `}</style>
        <div className="d-flex justify-content-between mb-4">
            <div className="skel" style={{ width: '250px', height: '40px' }}></div>
            <div className="skel" style={{ width: '160px', height: '40px' }}></div>
        </div>
        <div className="row g-3 mb-4">
            {[1, 2, 3, 4].map(i => (
                <div className="col-6 col-md-3" key={i}>
                    <div className="p-4 bg-white border rounded-4 shadow-sm">
                        <div className="skel mb-2" style={{ width: '40%', height: '12px' }}></div>
                        <div className="skel" style={{ width: '70%', height: '24px' }}></div>
                    </div>
                </div>
            ))}
        </div>
        <div className="skel mb-4" style={{ width: '100%', height: '300px', borderRadius: '16px' }}></div>
    </div>
);

// --- MAIN COMPONENT ---
export default function ManagerTeamTasks() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    const fetchTeamTasks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/manager/team-tasks');
            setTasks(response.data.data || []);
            setStats(response.data.stats || { total: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 });
        } catch (err: any) {
            if (err.response?.status === 403) navigate('/employee/tasks');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchTeamTasks();
    }, [fetchTeamTasks]);

    const handleDelete = async (taskId: number) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cette mission ?")) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(prev => prev.filter(t => t.id !== taskId));
            setStats(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (err) {
            alert("Erreur lors de la suppression.");
        }
    };

    const getStatusStyle = (status: string) => {
        const styles = {
            pending: { bg: '#fff7ed', color: '#9a3412', label: 'En attente' },
            in_progress: { bg: '#eff6ff', color: '#1e40af', label: 'En cours' },
            completed: { bg: '#f0fdf4', color: '#166534', label: 'Terminée' },
            cancelled: { bg: '#fef2f2', color: '#991b1b', label: 'Annulée' }
        };
        return styles[status as keyof typeof styles] || styles.pending;
    };

    const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

    if (loading) return <ManagerTasksSkeleton />;

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', color: '#1e293b' }}>
            <style>{`
                @media (max-width: 448px) {
                    .responsive-table thead { display: none; }
                    .responsive-table tr { display: block; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 15px; background: #fff; overflow: hidden; }
                    .responsive-table td { display: block; padding: 10px 15px !important; border: none !important; }
                    .responsive-table td:last-child { background: #f8fafc; border-top: 1px solid #eee !important; text-align: center !important; }
                }
                .btn-filter.active { background: #fff !important; color: #2563eb !important; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            `}</style>

            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
                        <Icons.Users /> Gestion de l'Équipe
                    </h2>
                    <p className="text-muted small mb-0">Supervisez les missions de vos collaborateurs</p>
                </div>
                <Link to="/employee/tasks/create" className="btn btn-primary fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2">
                    <Icons.Plus /> Nouvelle Mission
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Total', value: stats.total, color: '#475569' },
                    { label: 'Attente', value: stats.pending, color: '#d97706' },
                    { label: 'En cours', value: stats.in_progress, color: '#2563eb' },
                    { label: 'Terminées', value: stats.completed, color: '#059669' }
                ].map((s, i) => (
                    <div className="col-6 col-md-3" key={i}>
                        <div className="p-3 bg-white border-0 shadow-sm rounded-4 h-100">
                            <div className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>{s.label}</div>
                            <div className="h4 fw-bold mb-0" style={{ color: s.color }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="d-flex gap-1 mb-4 p-1 bg-light rounded-3 overflow-auto">
                {['all', 'pending', 'in_progress', 'completed'].map(k => (
                    <button 
                        key={k} 
                        onClick={() => setFilter(k)}
                        className={`btn btn-sm px-3 py-2 border-0 btn-filter ${filter === k ? 'active' : 'text-muted'}`}
                        style={{ fontWeight: 600, transition: '0.3s', borderRadius: '8px' }}
                    >
                        {k === 'all' ? 'Toutes' : k === 'pending' ? 'Attente' : k === 'in_progress' ? 'En cours' : 'Fait'}
                    </button>
                ))}
            </div>

            {/* Table Card */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 responsive-table">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 border-0 small text-muted text-uppercase">Mission / Description</th>
                                <th className="px-4 py-3 border-0 small text-muted text-uppercase">Assigné à</th>
                                <th className="px-4 py-3 border-0 small text-muted text-uppercase">Statut</th>
                                <th className="px-4 py-3 border-0 small text-muted text-uppercase text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-5">
                                        <Icons.Empty />
                                        <p className="text-muted mt-2">Aucune mission pour ce statut.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map(task => {
                                    const style = getStatusStyle(task.status);
                                    return (
                                        <tr key={task.id}>
                                            <td className="px-4 py-3">
                                                <div className="fw-bold text-dark">{task.title}</div>
                                                <div className="small text-muted text-truncate" style={{ maxWidth: '300px' }}>{task.description}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="fw-semibold small">{task.employee.first_name} {task.employee.last_name}</div>
                                                <div className="text-primary" style={{ fontSize: '0.7rem' }}>{task.employee.department?.name || 'Service'}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="badge border-0 px-2 py-1" style={{ backgroundColor: style.bg, color: style.color, fontSize: '0.7rem' }}>
                                                    {style.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <div className="d-flex justify-content-center justify-content-md-end gap-2">
                                                    <Link to={`/employee/tasks/${task.id}`} className="btn btn-light btn-sm rounded-2 border shadow-sm"><Icons.Eye /></Link>
                                                    <Link to={`/employee/tasks/${task.id}/edit`} className="btn btn-light btn-sm rounded-2 border shadow-sm text-warning"><Icons.Edit /></Link>
                                                    <button onClick={() => handleDelete(task.id)} className="btn btn-light btn-sm rounded-2 border shadow-sm text-danger"><Icons.Trash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}