import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";

export default function EditLeaveRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Champs alignés sur le modèle backend LeaveRequest : type, start_date, end_date, message
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    type: "paid",
    message: ""
  });

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const res = await api.get(`/me/leave-requests/${id}`);
        const leave = res.data;

        if (leave.status !== "pending") {
          alert("Cette demande a déjà été traitée et ne peut plus être modifiée.");
          navigate("/employee/leave-requests");
          return;
        }

        setFormData({
          start_date: leave.start_date,
          end_date: leave.end_date,
          type: leave.type || "paid",
          message: leave.message || ""
        });
      } catch (err) {
        console.error("Erreur de chargement", err);
        setError("Impossible de charger cette demande.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeave();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.put(`/me/leave-requests/${id}`, formData);
      alert("Demande mise à jour avec succès");
      navigate("/employee/leave-requests");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Chargement...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "20px", cursor: "pointer", border: "none", background: "none", color: "#0066cc" }}>
        ← Retour
      </button>

      <div style={{ padding: "30px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Modifier ma demande de congé</h2>

        {error && (
          <div style={{ padding: "12px", borderRadius: "6px", marginBottom: "15px", backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Type de congé</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="paid">Congé Payé</option>
              <option value="sick">Congé Maladie</option>
              <option value="unpaid">Congé Sans Solde</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Date de début</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Date de fin</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Message / Commentaire</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Expliquez brièvement la raison de votre absence..."
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", height: "100px", resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%", padding: "12px",
              backgroundColor: "#0066cc", color: "white",
              border: "none", borderRadius: "5px", fontWeight: "bold",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? "Mise à jour en cours..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </div>
  );
}
