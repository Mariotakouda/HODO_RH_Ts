import { useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="hero-container">
      <div className="hero-overlay"></div>

      <nav className="hero-nav fade-in-down">
        <div className="logo-wrapper" onClick={() => navigate("/")} style={{cursor: 'pointer'}}>
          {/* Chemin direct depuis le dossier public */}
          <img src="/images/HODO.png" alt="HODO" className="hero-logo" />
        </div>
        <button onClick={() => navigate("/login")} className="nav-login-btn">
          Connexion
        </button>
      </nav>

      <main className="hero-content">
        <h1 className="hero-title fade-in-up">
          Optimisez la gestion de votre <span className="highlight">entreprise</span>
        </h1>
        <p className="hero-description fade-in-up delay-1">
          La plateforme centralisée HODO vous permet de piloter vos activités, 
          gérer vos équipes et suivre vos performances en temps réel.
        </p>
        
        <div className="hero-actions fade-in-up delay-2">
          <button onClick={() => navigate("/login")} className="cta-button">
            Accéder à la plateforme
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </main>

      <footer className="hero-footer fade-in">
        © 2025 HODO. Tous droits réservés.
      </footer>
    </div>
  );
}