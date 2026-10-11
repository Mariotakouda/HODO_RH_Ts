import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        
        {/* Navigation simple */}
        <nav style={navStyle}>
          <button onClick={() => navigate(-1)} style={backButtonStyle}>
            ← Retour
          </button>
        </nav>

        <header style={headerStyle}>
          <h1 style={titleStyle}>politique de Confidentialité</h1>
          <p style={dateStyle}>Mis à jour le 2 février 2026</p>
        </header>

        <main style={contentStyle}>
          <section>
            <h2 style={sectionTitleStyle}>1. Introduction</h2>
            <p style={textStyle}>
              Cette politique détaille la gestion de vos données personnelles au sein du SIRH HODO. 
              En tant qu'employé, la protection de vos informations est notre priorité.
            </p>
          </section>

          <section>
            <h2 style={sectionTitleStyle}>2. Données collectées</h2>
            <p style={textStyle}>
              Nous collectons uniquement les données nécessaires à la gestion RH : 
              identité (nom, matricule), poste occupé, présences et logs de sécurité.
            </p>
          </section>

          <section>
            <h2 style={sectionTitleStyle}>3. Accès aux données</h2>
            <p style={textStyle}>
              L'accès est strictement limité : l'employé voit ses données, le manager suit son équipe, 
              et le <strong>superviseur</strong> (prestataire technique) n'intervient que pour la maintenance.
            </p>
          </section>

          {/* Zone des boutons d'action */}
          <div style={actionContainerStyle}>
            <button 
              onClick={() => navigate("/")} 
              style={refuseButtonStyle}
            >
              Refuser
            </button>
            <button 
              onClick={() => navigate("/login")} 
              style={acceptButtonStyle}
            >
              Accepter et continuer
            </button>
          </div>
        </main>

        <footer style={footerStyle}>
          © 2026 HODO HRMS
        </footer>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: "#1a1a1a",
};

const wrapperStyle: React.CSSProperties = {
  width: "90%",
  maxWidth: "600px",
  // Espace en haut de page (remplace les <br />)
  paddingTop: "150px", 
  paddingBottom: "80px",
};

const navStyle: React.CSSProperties = { 
  marginBottom: "32px" 
};

const backButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#007AFF",
  fontSize: "16px",
  cursor: "pointer",
  padding: 0,
};

const headerStyle: React.CSSProperties = { 
  marginBottom: "40px" 
};

const titleStyle: React.CSSProperties = { 
  fontSize: "32px", 
  fontWeight: "700", 
  margin: "0 0 8px 0",
  letterSpacing: "-0.5px"
};

const dateStyle: React.CSSProperties = { 
  fontSize: "14px", 
  color: "#86868b" 
};

const contentStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};

const sectionTitleStyle: React.CSSProperties = { 
  fontSize: "18px", 
  fontWeight: "600", 
  marginBottom: "12px" 
};

const textStyle: React.CSSProperties = { 
  fontSize: "16px", 
  lineHeight: "1.5", 
  color: "#3c3c43" 
};

const actionContainerStyle: React.CSSProperties = {
  marginTop: "20px",
  paddingTop: "40px",
  display: "flex",
  gap: "16px",
  borderTop: "1px solid #f2f2f7",
};

const acceptButtonStyle: React.CSSProperties = {
  flex: 2,
  backgroundColor: "#007AFF",
  color: "white",
  border: "none",
  padding: "14px 20px",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
};

const refuseButtonStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: "#f2f2f7",
  color: "#ff3b30",
  border: "none",
  padding: "14px 20px",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
};

const footerStyle: React.CSSProperties = {
  marginTop: "64px",
  textAlign: "center",
  color: "#86868b",
  fontSize: "13px",
};