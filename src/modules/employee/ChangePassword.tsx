import { useState, useContext } from "react";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Import du contexte

export default function ChangePassword() {
    const { updateLocalUserStatus, user } = useContext(AuthContext); // Récupération de la fonction de mise à jour
    const navigate = useNavigate();
    
    const [form, setForm] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            // 1. Appel API pour changer le mot de passe en base de données
            await api.post("/change-password", form);
            
            // 2. Mise à jour de l'état local (passe needs_password_change à false dans le context et localStorage)
            updateLocalUserStatus();

            setMessage({ type: "success", text: "Votre mot de passe a été modifié ! Redirection..." });
            
            // 3. Redirection automatique après un court délai pour laisser l'utilisateur lire le message
            setTimeout(() => {
                const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
                navigate(redirectPath, { replace: true });
            }, 2000);

        } catch (err: any) {
            setMessage({ 
                type: "error", 
                text: err.response?.data?.message || "Erreur lors de la modification." 
            });
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <h3 style={{ marginTop: 0 }}>Sécurité du compte</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                Pour des raisons de sécurité, vous devez modifier le mot de passe temporaire reçu par email avant de continuer.
            </p>
            
            {message.text && (
                <div style={{ 
                    padding: '12px', 
                    borderRadius: '4px', 
                    marginBottom: '20px', 
                    fontSize: '14px',
                    backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Mot de passe actuel (reçu par email)</label>
                    <input 
                        type="password" 
                        style={inputStyle} 
                        value={form.current_password} 
                        onChange={e => setForm({ ...form, current_password: e.target.value })} 
                        required 
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Nouveau mot de passe (8 caractères min.)</label>
                    <input 
                        type="password" 
                        style={inputStyle} 
                        value={form.new_password} 
                        onChange={e => setForm({ ...form, new_password: e.target.value })} 
                        required 
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Confirmer le nouveau mot de passe</label>
                    <input 
                        type="password" 
                        style={inputStyle} 
                        value={form.new_password_confirmation} 
                        onChange={e => setForm({ ...form, new_password_confirmation: e.target.value })} 
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? "Traitement en cours..." : "Enregistrer mon nouveau mot de passe"}
                </button>
            </form>
        </div>
    );
}

// Styles
const containerStyle = { maxWidth: '450px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' as const, fontSize: '14px' };
const btnStyle = { width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', transition: 'all 0.2s' };