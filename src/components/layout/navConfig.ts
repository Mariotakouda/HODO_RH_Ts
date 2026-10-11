export interface NavItem {
  label: string;
  path: string;
  icon: string; // classe bootstrap-icons, ex: "bi-speedometer2"
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/**
 * Construit le menu complet selon le rôle — UNE SEULE fonction, pour éviter
 * le bug précédent (3 listes statiques concaténées sans dédoublonnage, qui
 * faisait apparaître "Tableau de bord" jusqu'à 3 fois pour un admin et
 * "Annonces" 2 fois avec le même libellé).
 *
 * Règle d'or : chaque lien n'apparaît qu'UNE fois, même si plusieurs rôles
 * y auraient techniquement droit.
 */
export function getNavSections(isAdmin: boolean, isManager: boolean): NavSection[] {
  // --- ADMIN : pas de fiche Employee -> aucun écran self-service personnel
  // (pas de "Mes tâches"/"Mes présences"/"Mes congés", voir cahier des
  // charges : l'admin est garant du paramétrage, pas un employé de terrain).
  if (isAdmin) {
    return [
      {
        items: [{ label: "Tableau de bord", path: "/admin/dashboard", icon: "bi-speedometer2" }],
      },
      {
        title: "Équipe",
        items: [
          { label: "Employés", path: "/admin/employees", icon: "bi-people" },
          { label: "Tâches", path: "/admin/tasks", icon: "bi-list-task" },
          { label: "Présences", path: "/admin/presences", icon: "bi-calendar3" },
          { label: "Congés à traiter", path: "/admin/leave-requests", icon: "bi-airplane-engines" },
          { label: "Gérer les annonces", path: "/admin/announcements", icon: "bi-megaphone-fill" },
        ],
      },
      {
        title: "Administration",
        items: [
          { label: "Départements", path: "/admin/departments", icon: "bi-diagram-3" },
          { label: "Managers", path: "/admin/managers", icon: "bi-person-badge" },
          { label: "Rôles", path: "/admin/roles", icon: "bi-shield-lock" },
          { label: "Archives", path: "/admin/archives", icon: "bi-archive" },
        ],
      },
    ];
  }

  // --- MANAGER : a une fiche Employee (self-service complet) + gestion d'équipe.
  if (isManager) {
    return [
      {
        items: [
          { label: "Tableau de bord", path: "/employee/dashboard", icon: "bi-speedometer2" },
          { label: "Mon profil", path: "/employee/profile", icon: "bi-person-circle" },
          { label: "Mon dossier", path: "/employee/documents", icon: "bi-folder2-open" },
          { label: "Mes tâches", path: "/employee/my-tasks", icon: "bi-check2-square" },
          { label: "Mes présences", path: "/employee/presences", icon: "bi-calendar-check" },
          { label: "Mes congés", path: "/employee/leave-requests", icon: "bi-airplane" },
          { label: "Annonces", path: "/employee/announcements", icon: "bi-megaphone" },
        ],
      },
      {
        title: "Équipe",
        items: [
          { label: "Tableau de bord équipe", path: "/employee/team-dashboard", icon: "bi-diagram-3-fill" },
          { label: "Employés", path: "/admin/employees", icon: "bi-people" },
          { label: "Tâches", path: "/admin/tasks", icon: "bi-list-task" },
          { label: "Présences", path: "/admin/presences", icon: "bi-calendar3" },
          { label: "Congés à traiter", path: "/admin/leave-requests", icon: "bi-airplane-engines" },
          { label: "Gérer les annonces", path: "/admin/announcements", icon: "bi-megaphone-fill" },
        ],
      },
    ];
  }

  // --- EMPLOYÉ simple : self-service uniquement.
  return [
    {
      items: [
        { label: "Tableau de bord", path: "/employee/dashboard", icon: "bi-speedometer2" },
        { label: "Mon profil", path: "/employee/profile", icon: "bi-person-circle" },
          { label: "Mon dossier", path: "/employee/documents", icon: "bi-folder2-open" },
        { label: "Mes tâches", path: "/employee/my-tasks", icon: "bi-check2-square" },
        { label: "Mes présences", path: "/employee/presences", icon: "bi-calendar-check" },
        { label: "Mes congés", path: "/employee/leave-requests", icon: "bi-airplane" },
        { label: "Annonces", path: "/employee/announcements", icon: "bi-megaphone" },
      ],
    },
  ];
}
