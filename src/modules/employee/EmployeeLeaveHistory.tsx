import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Link } from 'react-router';

interface LeaveRequest {
  id: number;
  type: string;
  start_date: string;
  end_date: string;
  status: 'approved' | 'rejected' | 'en attente' | 'approuvé' | 'refusé';
  message: string;
  created_at: string;
}

export default function EmployeeLeaveHistory() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/me/leave-requests');
      setLeaves(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement de l'historique.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'approuvé') return { bg: "#ecfdf5", color: "#10b981", label: "Approuvé" };
    if (s === 'rejected' || s === 'refusé') return { bg: "#fef2f2", color: "#ef4444", label: "Refusé" };
    return { bg: "#fffbeb", color: "#f59e0b", label: "En attente" };
  };

  return (
    <div style={{ 
      backgroundColor: "#f8fafc", 
      minHeight: "100vh", 
      padding: "20px 15px", 
      fontFamily: "'Inter', sans-serif" 
    }}>
      <style>{`
        /* Animation Skeleton */
        @keyframes skeleton-loading {
          0% { background-color: #f1f5f9; }
          100% { background-color: #e2e8f0; }
        }
        .skeleton {
          animation: skeleton-loading 0.8s linear infinite alternate;
          border-radius: 6px;
        }

        @media (max-width: 448px) {
          .header-container { flex-direction: column !important; align-items: stretch !important; gap: 16px; margin-bottom: 20px !important; }
          .btn-new { width: 100%; text-align: center; box-sizing: border-box; }
          .responsive-table thead { display: none; }
          .responsive-table tr { display: block; margin-bottom: 15px; padding: 12px; border: 1px solid #e2e8f0 !important; border-radius: 12px; background: #ffffff; }
          .responsive-table td { display: flex !important; justify-content: space-between; align-items: center; padding: 10px 0 !important; border: none !important; width: 100% !important; text-align: right !important; }
          .responsive-table td:not(:last-child) { border-bottom: 1px solid #f8fafc !important; }
          .responsive-table td::before { content: attr(data-label); font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; text-align: left; flex: 1; }
          .type-cell { flex-direction: column !important; align-items: flex-end !important; }
          .type-label { margin-top: 4px; }
        }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Mes absences</h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>Historique de vos demandes</p>
          </div>
          
          <Link
            to="/employee/leave-requests/create"
            className="btn-new"
            style={{ 
              padding: "12px 24px", 
              backgroundColor: "#3b82f6", 
              color: "#fff", 
              borderRadius: "10px", 
              textDecoration: "none", 
              fontWeight: "600",
              display: "inline-block",
              boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)" 
            }}
          >
            + Nouvelle demande
          </Link>
        </div>

        {error && <div style={{ padding: "15px", backgroundColor: "#fef2f2", color: "#b91c1c", borderRadius: "8px", marginBottom: "20px", border: "1px solid #fee2e2" }}>{error}</div>}

        <div style={{ 
          backgroundColor: (loading || leaves.length > 0) ? "#fff" : "transparent", 
          borderRadius: "16px", 
          boxShadow: (loading || leaves.length > 0) ? "0 4px 6px -1px rgba(0,0,0,0.05)" : "none", 
          border: (loading || leaves.length > 0) ? "1px solid #e2e8f0" : "none",
          overflow: "hidden"
        }}>
          
          {loading ? (
            /* SKELETON STATE */
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead className="responsive-table-head">
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={thStyle}>TYPE</th>
                  <th style={thStyle}>PÉRIODE</th>
                  <th style={thStyle}>SOUMIS LE</th>
                  <th style={thStyle}>STATUT</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}><div className="skeleton" style={{ width: "80px", height: "14px" }} /></td>
                    <td style={tdStyle}><div className="skeleton" style={{ width: "140px", height: "14px" }} /></td>
                    <td style={tdStyle}><div className="skeleton" style={{ width: "70px", height: "14px" }} /></td>
                    <td style={tdStyle}><div className="skeleton" style={{ width: "90px", height: "24px", borderRadius: "99px" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : leaves.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
              <p style={{ fontSize: "16px" }}>Aucune demande de congé trouvée.</p>
            </div>
          ) : (
            /* DATA STATE */
            <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={thStyle}>TYPE</th>
                  <th style={thStyle}>PÉRIODE</th>
                  <th style={thStyle}>SOUMIS LE</th>
                  <th style={thStyle}>STATUT</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l, index) => {
                  const status = getStatusStyle(l.status);
                  return (
                    <tr key={l.id} style={{ 
                      borderBottom: index === leaves.length - 1 ? "none" : "1px solid #f1f5f9"
                    }}>
                      <td style={tdStyle} data-label="Type" className="type-cell">
                        <div className="type-label" style={{ fontWeight: "700", color: "#1e293b" }}>
                          {l.type.toUpperCase()}
                        </div>
                        {l.message && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{l.message}</div>}
                      </td>
                      <td style={tdStyle} data-label="Période">
                        <div style={{ color: "#334155", fontWeight: "600", fontSize: "13px" }}>
                          {new Date(l.start_date).toLocaleDateString('fr-FR')} <span style={{color: '#cbd5e1'}}>→</span> {new Date(l.end_date).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td style={tdStyle} data-label="Soumis le">
                        <span style={{ color: "#64748b", fontSize: "13px" }}>{new Date(l.created_at).toLocaleDateString('fr-FR')}</span>
                      </td>
                      <td style={tdStyle} data-label="Statut">
                        <span style={{
                          backgroundColor: status.bg,
                          color: status.color,
                          padding: "6px 12px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: "700",
                          display: "inline-block"
                        }}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "16px 24px",
  fontSize: "11px",
  fontWeight: "700",
  color: "#64748b",
  letterSpacing: "0.05em"
};

const tdStyle: React.CSSProperties = {
  padding: "16px 24px",
  verticalAlign: "middle"
};