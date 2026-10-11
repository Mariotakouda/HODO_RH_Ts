import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllPresences, exportPresences, fetchExportData, isToday, type EmployeePresence } from "../presences/service";
import { generatePresencePdf } from "../presences/pdf.ts";
import { errorMessage } from "../../lib/api/errors";
import toast from "react-hot-toast";

/**
 * SKELETON COMPONENT
 * Imite la structure du tableau/cartes pour éviter le saut visuel
 */
const PresenceSkeleton = () => (
  <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
    <style>{`
      @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      .skel { background: #e2e8f0; animation: pulse 1.5s infinite; border-radius: 6px; }
      .skel-card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 12px; border: 1px solid #e2e8f0; }
    `}</style>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="skel-card d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="skel" style={{ width: '40%', height: '18px' }}></div>
          <div className="skel" style={{ width: '20%', height: '24px', borderRadius: '20px' }}></div>
        </div>
        <div className="d-flex justify-content-between">
          <div className="skel" style={{ width: '30%', height: '12px' }}></div>
          <div className="skel" style={{ width: '25%', height: '12px' }}></div>
        </div>
      </div>
    ))}
  </div>
);

export default function AdminPresencePage() {
  const [presences, setPresences] = useState<EmployeePresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFrom, setPdfFrom] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [pdfTo, setPdfTo] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const loadAll = useCallback(async (dateFilter?: string) => {
    try {
      setLoading(true);
      const response = await getAllPresences(dateFilter ? { date: dateFilter } : undefined);
      const fetchedData = response.data?.data || response.data || [];
      setPresences(fetchedData);
    } catch (err) {
      console.error("Erreur chargement:", err);
      setPresences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportPdf = async () => {
    try {
      setPdfLoading(true);
      toast.loading("Génération de la fiche PDF...");
      const data = await fetchExportData(pdfFrom || undefined, pdfTo || undefined);
      if (data.rows.length === 0) {
        toast.dismiss();
        toast.error("Aucune présence sur cette période");
        return;
      }
      const reference = await generatePresencePdf(data);
      toast.dismiss();
      toast.success(`Fiche téléchargée (${reference})`);
    } catch (err) {
      toast.dismiss();
      toast.error(errorMessage(err));
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      toast.loading("Génération du CSV...");
      await exportPresences();
      toast.dismiss();
      toast.success("Fichier téléchargé avec succès");
    } catch (err) {
      toast.dismiss();
      toast.error("Échec de l'exportation");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    loadAll(date);
  };

  const resetFilter = () => {
    setSelectedDate("");
    loadAll();
  };

  const presentTodayCount = presences.filter(p => isToday(p.date) && p.status !== 'absent').length;

  return (
    <div className="admin-container">
      <style>{`
        .admin-container { padding: 20px; maxWidth: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; min-height: 100vh; box-sizing: border-box; }
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
        .actions-group { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .filter-section { background: white; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .date-input { border: 1px solid #cbd5e1; padding: 8px; border-radius: 8px; outline: none; font-size: 14px; color: #1e293b; cursor: pointer; background: white; width: 100%; box-sizing: border-box; }
        .reset-btn { background: none; border: none; color: #ef4444; font-weight: 700; cursor: pointer; font-size: 13px; white-space: nowrap; padding: 0 4px; }
        .export-btn { background: #10b981; color: white; border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); font-size: 14px; }
        .export-btn:disabled { background: #a7f3d0; cursor: not-allowed; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .stat-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 16px; }
        .table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 16px; background: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
        td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .status-active { background: #fff7ed; color: #c2410c; }
        .status-absent { background: #fee2e2; color: #b91c1c; }
        .status-late { background: #fef3c7; color: #b45309; }
        .status-done { background: #f0fdf4; color: #15803d; }

        @media (max-width: 448px) {
          .admin-container { padding: 12px; }
          .header-flex { flex-direction: column; align-items: stretch; margin-bottom: 24px; gap: 16px; }
          .actions-group { flex-direction: column; width: 100%; }
          .filter-section { width: 100%; justify-content: space-between; order: 1; }
          .export-btn { width: 100%; justify-content: center; order: 2; }
          .stats-grid { grid-template-columns: 1fr; margin-bottom: 24px; }
          .table-container { border: none; background: transparent; box-shadow: none; overflow: visible; }
          table, thead, tbody, th, td, tr { display: block; }
          thead { display: none; }
          tr { background: white; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px; padding: 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
          td { border: none; position: relative; padding: 10px 16px 10px 45%; text-align: right; min-height: 20px; }
          td:before { content: attr(data-label); position: absolute; left: 16px; width: 40%; text-align: left; font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 10px; top: 50%; transform: translateY(-50%); }
          td[data-label="Employé"] { border-bottom: 1px solid #f1f5f9; margin-bottom: 4px; padding-top: 12px; padding-bottom: 12px; }
        }
      `}</style>

      <div className="header-flex">
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Gestion des Présences</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "15px" }}>Suivi en temps réel</p>
        </div>

        <div className="actions-group">
          <Link to="/admin/presences/logs" className="export-btn" style={{ textDecoration: "none" }}>
            Journal des pointages
          </Link>
          <div className="filter-section">
            <label style={{ fontSize: 13, color: "#64748b" }}>Du</label>
            <input type="date" className="date-input" value={pdfFrom} max={pdfTo || undefined} onChange={(e) => setPdfFrom(e.target.value)} />
            <label style={{ fontSize: 13, color: "#64748b" }}>au</label>
            <input type="date" className="date-input" value={pdfTo} min={pdfFrom || undefined} onChange={(e) => setPdfTo(e.target.value)} />
          </div>
          <button className="export-btn" style={{ background: "#0f172a" }} onClick={handleExportPdf} disabled={pdfLoading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            {pdfLoading ? "Génération..." : "Fiche PDF"}
          </button>
          <button className="export-btn" onClick={handleExport} disabled={exporting || presences.length === 0}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            {exporting ? "Génération..." : "CSV"}
          </button>

          <div className="filter-section">
            <input type="date" className="date-input" value={selectedDate} onChange={handleDateChange} />
            {selectedDate && <button onClick={resetFilter} className="reset-btn">Annuler</button>}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ background: "#eff6ff", padding: "14px", borderRadius: "14px", color: "#3b82f6" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", lineHeight: 1 }}>{loading ? "..." : presentTodayCount}</div>
            <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Présents aujourd'hui</div>
          </div>
        </div>
      </div>

      {loading ? (
        <PresenceSkeleton />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employé</th>
                <th>Date</th>
                <th>Arrivée</th>
                <th>Sortie</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {presences.length > 0 ? (
                presences.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Employé" style={{ fontWeight: "700" }}>
                        {p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : `ID: ${p.employee_id}`}
                    </td>
                    <td data-label="Date">{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                    <td data-label="Arrivée" style={{ fontWeight: "600" }}>
                        {p.check_in ? new Date(p.check_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td data-label="Sortie" style={{ fontWeight: "600" }}>
                        {p.check_out ? new Date(p.check_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td data-label="Statut">
                      <span className={`status-badge ${p.status === "absent" ? "status-absent" : p.check_out ? "status-done" : "status-active"}`}>
                        {p.status === "absent" ? "Absent" : p.check_out ? "Terminée" : "En cours"}
                      </span>
                      {p.status === "late" && (
                        <span className="status-badge status-late" style={{ marginLeft: 6 }}>Retard</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Aucune donnée pour cette période.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}