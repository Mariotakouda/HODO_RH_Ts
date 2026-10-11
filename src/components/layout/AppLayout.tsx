import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useConfirm } from "../ui/ConfirmDialog";
import { getNavSections } from "./navConfig";
import "./AppLayout.css";

/**
 * Layout unique de l'application connectée.
 * Remplace AdminLayout.tsx + EmployeeLayout.tsx (2164 lignes à eux deux,
 * presque identiques) : une seule implémentation, le menu affiché dépend
 * simplement du rôle de l'utilisateur connecté.
 */
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAdmin, isManager, logout } = useAuth();
  const { confirm, ConfirmDialog } = useConfirm();
  const location = useLocation();
  const navigate = useNavigate();

  // On ne réinitialise le menu que lorsqu'on franchit le seuil mobile / bureau :
  // un simple redimensionnement (barre d'adresse du téléphone, clavier...) ne doit pas
  // rouvrir ou refermer le menu à la place de l'utilisateur.
  useEffect(() => {
    let wasDesktop = window.innerWidth > 1024;
    const handleResize = () => {
      const desktop = window.innerWidth > 1024;
      setIsMobile(!desktop);
      if (desktop !== wasDesktop) {
        wasDesktop = desktop;
        setSidebarOpen(desktop);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sur mobile, le menu se referme dès qu'on choisit une page.
  useEffect(() => {
    if (window.innerWidth <= 1024) setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (await confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await logout();
      navigate("/login");
    }
  };

  // Un seul endroit construit le menu, par rôle, sans doublon (voir
  // navConfig.ts — l'ancienne version concaténait 3 listes séparées,
  // d'où le "Tableau de bord" répété jusqu'à 3 fois pour un admin).
  const sections = getNavSections(isAdmin, isManager);

  // Fil d'Ariane (affichage uniquement) : rubrique du menu correspondant à l'URL courante.
  const currentItem = sections
    .flatMap((section) => section.items)
    .filter((item) => location.pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0];
  const rootLabel = isAdmin ? "Administration" : isManager ? "Espace manager" : "Espace employé";

  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";
  const roleLabel = isAdmin ? "ADMINISTRATEUR" : isManager ? "MANAGER" : "EMPLOYÉ";

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : "sidebar--collapsed"}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="logo-icon">H</div>
            {sidebarOpen && <h1 className="logo-text">HODO</h1>}
          </div>
          {isMobile && sidebarOpen && (
            <button type="button" className="sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu">
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        <nav className="sidebar__nav">
          {sections.map((section, i) => (
            <div key={section.title ?? i}>
              {i > 0 && <div className="nav-separator" />}
              {sidebarOpen && section.title && <p className="nav-section-title">{section.title}</p>}
              {section.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={!sidebarOpen ? item.label : ""}
                    className={`nav-item ${isActive ? "nav-item--active" : ""}`}
                  >
                    <i className={`bi ${item.icon} nav-item__icon`} />
                    {sidebarOpen && <span className="nav-item__label">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="user-info">
            <div className="user-avatar">{initial}</div>
            {sidebarOpen && (
              <div className="user-details">
                <p className="user-name">{user?.name}</p>
                <p className="user-role">{roleLabel}</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Se déconnecter">
            <i className="bi bi-box-arrow-right" />
            {sidebarOpen && <span>Se déconnecter</span>}
          </button>
        </div>
      </aside>

      {isMobile && sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <div className={`main-container ${sidebarOpen ? "main-container--shifted" : ""}`}>
        <header className="header">
          <div className="header__left">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="menu-toggle"
              aria-label="Afficher/masquer le menu"
            >
              <i className="bi bi-list" />
            </button>
            <nav className="crumbs" aria-label="Fil d'Ariane">
              <i className="bi bi-house-door" />
              <span className="crumbs__sep" />
              <span>{rootLabel}</span>
              {currentItem && (
                <>
                  <span>/</span>
                  <strong>{currentItem.label}</strong>
                </>
              )}
            </nav>
          </div>

          <div className="header__right">
            <span className="header__badge">{roleLabel}</span>
            <div className="header__user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="header__avatar">{initial}</div>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown__header">
                    <div className="user-dropdown__avatar">{initial}</div>
                    <div>
                      <p className="user-dropdown__name">{user?.name}</p>
                      <p className="user-dropdown__email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="user-dropdown__divider" />
                  {/* Un admin n'a pas de fiche Employee -> pas de "Mon profil" self-service pour lui. */}
                  {!isAdmin && (
                    <Link to="/employee/profile" className="user-dropdown__item">
                      <i className="bi bi-person" /> <span>Mon profil</span>
                    </Link>
                  )}
                  <button className="user-dropdown__item" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right" /> <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>

      {ConfirmDialog}
    </div>
  );
}