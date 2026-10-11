import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/axios";
import "./login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    token: "",
    email: "",
    password: "",
    password_confirmation: ""
  });

  useEffect(() => {
    // On extrait automatiquement le token et l'email de l'URL envoyée par Laravel
    setForm(prev => ({
      ...prev,
      token: searchParams.get("token") || "",
      email: searchParams.get("email") || ""
    }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/reset-password", form);
      setMsg({ type: "success", text: "Mot de passe réinitialisé ! Redirection..." });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setMsg({ 
        type: "error", 
        text: err.response?.data?.message || "Le lien est invalide ou a expiré." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Nouveau mot de passe</h2>
        <p className="login-subtitle">Veuillez saisir votre nouveau mot de passe.</p>

        {msg.text && (
          <div style={{ 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            backgroundColor: msg.type === 'success' ? '#d4edda' : '#f8d7da',
            color: msg.type === 'success' ? '#155724' : '#721c24'
          }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Nouveau mot de passe</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="8 caractères minimum"
              onChange={e => setForm({...form, password: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmer le mot de passe</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="Répétez le mot de passe"
              onChange={e => setForm({...form, password_confirmation: e.target.value})} 
              required 
            />
          </div>
          <button type="submit" className="login-button" disabled={loading || !form.token}>
            {loading ? "Traitement..." : "Réinitialiser le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}