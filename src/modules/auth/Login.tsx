import { useState, type FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { useAuth } from "../../hooks/useAuth";
import type { User } from "../../types/auth";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const redirectAfterLogin = (loggedInUser: User) => {
    if (loggedInUser.needs_password_change) {
      navigate("/change-password", { replace: true });
      return;
    }

    // BUGFIX : un admin n'a pas de fiche Employee associée (pas de pointage,
    // pas de tâches personnelles...). /employee/dashboard appelle /me et
    // /me/dashboard-summary, qui exigent un employé -> 404 pour un admin.
    // L'admin a son propre tableau de bord global, séparé.
    if (loggedInUser.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/employee/dashboard", { replace: true });
    }
  };

  useEffect(() => {
    if (user) redirectAfterLogin(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      redirectAfterLogin(await login(email, password));
    } catch (err: any) {
      setError(err.message || "Identifiants incorrects");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button onClick={() => navigate("/")} className="back-button" title="Retour à l'accueil">
          <i className="bi bi-arrow-left" />
          <span>Retour</span>
        </button>

        <h2 className="login-title">Connexion</h2>
        <p className="login-subtitle">Accédez à votre espace personnel HODO</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Adresse email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-input password-field"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <Link to="/privacy-policy" style={{ fontSize: "0.75rem", color: "#94a3b8", textDecoration: "none" }}>
              Politique de confidentialité
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
