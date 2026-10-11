import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import maintenu
import { api } from "../../api/axios";
import "./login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await api.post("/forgot-password", { email });
      setMsg({ type: "success", text: res.data.message });
    } catch (err: any) {
      setMsg({ 
        type: "error", 
        text: err.response?.data?.message || "Une erreur est survenue." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button onClick={() => navigate("/login")} className="back-button">
          <span>← Retour</span>
        </button>
        <h2 className="login-title">Récupération</h2>
        <p className="login-subtitle">Entrez votre email pour recevoir un lien de réinitialisation.</p>

        {msg.text && (
          <div className={msg.type === "success" ? "success-message" : "error-message"} 
               style={{ 
                 padding: '10px', 
                 borderRadius: '5px', 
                 marginBottom: '15px',
                 backgroundColor: msg.type === 'success' ? '#d4edda' : '#f8d7da',
                 color: msg.type === 'success' ? '#155724' : '#721c24'
               }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="votre@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
        </form>

        {/* ✅ Utilisation de Link pour résoudre l'erreur TS */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Vous vous en souvenez ? <Link to="/login" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}