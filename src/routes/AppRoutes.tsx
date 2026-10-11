import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";

import AppLayout from "../components/layout/AppLayout";

import Login from "../modules/auth/Login";
import Home from "../Pages/Home";
import PrivacyPolicy from "../Pages/PrivacyPolicy";
import ForgotPassword from "../modules/auth/ForgotPassword";
import ResetPassword from "../modules/auth/ResetPassword";
import ChangePassword from "../modules/employee/ChangePassword";

import AdminDashboard from "../modules/admin/dashboard";
import EmployeeDashboard from "../modules/employee/dashboard";

import EmployeeList from "../modules/employees/list";
import EmployeeEdit from "../modules/employees/edit";
import EmployeeShow from "../modules/employees/show";
import EmployeeCreate from "../modules/employees/create";
import EmployeeFilePage from "../modules/employees/file";
import EmployeeArchives from "../modules/employees/archives";

import Departments from "../modules/departments/list";
import DepartmentCreate from "../modules/departments/create";
import DepartmentEdit from "../modules/departments/edit";
import DepartmentShow from "../modules/departments/show";

import ManagerCreate from "../modules/managers/create";
import ManagerEdit from "../modules/managers/edit";
import ManagerShow from "../modules/managers/show";
import ManagerList from "../modules/managers/list";

import RoleCreate from "../modules/roles/create";
import RoleEdit from "../modules/roles/edit";
import RoleShow from "../modules/roles/show";
import RoleList from "../modules/roles/list";

import TaskShow from "../modules/tasks/show";
import TaskEdit from "../modules/tasks/edit";
import TaskCreate from "../modules/tasks/create";
import TaskList from "../modules/tasks/list";

import AnnouncementShow from "../modules/announcements/show";
import AnnouncementEdit from "../modules/announcements/edit";
import AnnouncementCreate from "../modules/announcements/create";
import AnnouncementList from "../modules/announcements/list";

import AdminLeaveRequests from "../modules/admin/AdminLeaveRequests";
import AdminPresencePage from "../modules/admin/AdminPresencePage";
import PresenceLogsPage from "../modules/admin/PresenceLogsPage";

import EmployeeLeaveHistory from "../modules/employee/EmployeeLeaveHistory";
import LeaveRequestForm from "../modules/employee/LeaveRequestForm";
import EditLeaveRequest from "../modules/employee/EditLeaveRequest";
import EmployeePresencePage from "../modules/employee/EmployeePresencePage";
import EmployeeProfile from "../modules/employee/Profile";
import EmployeeTaskDetail from "../modules/employee/EmployeeTaskDetail";
import ManagerTeamTasks from "../modules/employee/ManagerTeamTasks";
import MyTasks from "../modules/employee/MyTasks";
import MyDocuments from "../modules/employee/MyDocument";
import TeamDashboard from "../modules/employee/TeamDashboard";

/**
 * Plan des routes — correspond exactement aux 3 niveaux de middleware du
 * backend (voir Hodo_Api/routes/api/{employee,manager,admin}.php) :
 *
 *   zone="self"  -> auth:sanctum seul (tout utilisateur connecté)
 *   zone="team"  -> middleware 'manager' (manager OU admin)
 *   zone="admin" -> middleware 'admin'   (admin uniquement)
 *
 * Les URLs ne changent PAS par rapport à la version précédente (toujours
 * /admin/... et /employee/...) : seule la protection par route change,
 * pour ne rien casser dans les composants déjà écrits.
 */
export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />

      {/* BUGFIX : cette redirection était câblée en dur vers /employee/dashboard
          pour n'importe quel utilisateur déjà connecté, sans regarder son rôle.
          Comme elle est réévaluée à chaque rendu (dès que `user` existe dans le
          contexte), elle entrait en concurrence avec le navigate() rôle-aware de
          Login.tsx et l'écrasait souvent pour un admin (atterrissage sur le
          dashboard self-service au lieu du dashboard admin). Même règle que
          Login.tsx ici. */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard"} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute zone="self">
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={<Navigate to={user?.role === "admin" ? "/admin/dashboard" : "/employee/dashboard"} replace />}
      />

      {/* ========== ESPACE CONNECTÉ (layout commun) ========== */}
      {/* Le layout lui-même ne demande que d'être connecté ; chaque route
          enfant applique sa propre zone (self/team/admin). */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute zone="self">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin strict */}
        <Route path="dashboard" element={<ProtectedRoute zone="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="departments" element={<ProtectedRoute zone="admin"><Departments /></ProtectedRoute>} />
        <Route path="departments/create" element={<ProtectedRoute zone="admin"><DepartmentCreate /></ProtectedRoute>} />
        <Route path="departments/:id/edit" element={<ProtectedRoute zone="admin"><DepartmentEdit /></ProtectedRoute>} />
        <Route path="departments/:id" element={<ProtectedRoute zone="admin"><DepartmentShow /></ProtectedRoute>} />

        <Route path="roles" element={<ProtectedRoute zone="admin"><RoleList /></ProtectedRoute>} />
        <Route path="roles/create" element={<ProtectedRoute zone="admin"><RoleCreate /></ProtectedRoute>} />
        <Route path="roles/:id/edit" element={<ProtectedRoute zone="admin"><RoleEdit /></ProtectedRoute>} />
        <Route path="roles/:id" element={<ProtectedRoute zone="admin"><RoleShow /></ProtectedRoute>} />

        <Route path="managers" element={<ProtectedRoute zone="admin"><ManagerList /></ProtectedRoute>} />
        <Route path="managers/create" element={<ProtectedRoute zone="admin"><ManagerCreate /></ProtectedRoute>} />
        <Route path="managers/:id/edit" element={<ProtectedRoute zone="admin"><ManagerEdit /></ProtectedRoute>} />
        <Route path="managers/:id" element={<ProtectedRoute zone="admin"><ManagerShow /></ProtectedRoute>} />

        <Route path="employees/create" element={<ProtectedRoute zone="admin"><EmployeeCreate /></ProtectedRoute>} />
        <Route path="employees/:id/edit" element={<ProtectedRoute zone="admin"><EmployeeEdit /></ProtectedRoute>} />
        <Route path="employees/:id/file" element={<ProtectedRoute zone="admin"><EmployeeFilePage /></ProtectedRoute>} />
        <Route path="archives" element={<ProtectedRoute zone="admin"><EmployeeArchives /></ProtectedRoute>} />

        {/* Équipe : manager OU admin */}
        <Route path="employees" element={<ProtectedRoute zone="team"><EmployeeList /></ProtectedRoute>} />
        <Route path="employees/:id" element={<ProtectedRoute zone="team"><EmployeeShow /></ProtectedRoute>} />

        <Route path="tasks" element={<ProtectedRoute zone="team"><TaskList /></ProtectedRoute>} />
        <Route path="tasks/create" element={<ProtectedRoute zone="team"><TaskCreate /></ProtectedRoute>} />
        <Route path="tasks/:id/edit" element={<ProtectedRoute zone="team"><TaskEdit /></ProtectedRoute>} />
        <Route path="tasks/:id" element={<ProtectedRoute zone="team"><TaskShow /></ProtectedRoute>} />

        <Route path="presences" element={<ProtectedRoute zone="team"><AdminPresencePage /></ProtectedRoute>} />
        <Route path="presences/logs" element={<ProtectedRoute zone="team"><PresenceLogsPage /></ProtectedRoute>} />

        <Route path="leave-requests" element={<ProtectedRoute zone="team"><AdminLeaveRequests /></ProtectedRoute>} />
        {/* NOTE : "leave-requests/create" et "/:id/edit" existaient ici dans
            l'ancienne version mais n'ont pas d'équivalent backend (un admin
            ne peut pas créer/éditer la demande d'un employé) — retirées. */}

        <Route path="announcements" element={<ProtectedRoute zone="team"><AnnouncementList /></ProtectedRoute>} />
        <Route path="announcements/create" element={<ProtectedRoute zone="team"><AnnouncementCreate /></ProtectedRoute>} />
        <Route path="announcements/:id/edit" element={<ProtectedRoute zone="team"><AnnouncementEdit /></ProtectedRoute>} />
        <Route path="announcements/:id" element={<ProtectedRoute zone="team"><AnnouncementShow /></ProtectedRoute>} />
      </Route>

      {/* ========== ESPACE PERSONNEL (self-service, tout utilisateur connecté) ========== */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute zone="self">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="presences" element={<EmployeePresencePage />} />

        {/* "Consultation de sa liste de missions et tâches à accomplir" (cahier
            des charges, Espace Employé) — self-service, GET /me/tasks. */}
        <Route path="my-tasks" element={<MyTasks />} />
        <Route path="documents" element={<MyDocuments />} />

        {/* "Tableau de bord décisionnel : vue d'ensemble sur le statut de son
            département" (cahier des charges, Espace Manager) — manager/admin. */}
        <Route path="team-dashboard" element={<ProtectedRoute zone="team"><TeamDashboard /></ProtectedRoute>} />

        <Route path="leave-requests" element={<EmployeeLeaveHistory />} />
        <Route path="leave-requests/create" element={<LeaveRequestForm />} />
        <Route path="leave-requests/edit/:id" element={<EditLeaveRequest />} />

        {/* Détail d'UNE tâche : self-service (l'employé consulte/soumet son rapport). */}
        <Route path="tasks/:id" element={<EmployeeTaskDetail />} />

        {/* ATTENTION (voir CHANGELOG_FRONTEND.md) : ces 3 routes réutilisent le même
            TaskList/TaskCreate/TaskEdit que /admin/tasks, qui appellent toujours
            l'endpoint d'équipe (GET/POST/PUT /tasks, middleware 'manager' côté
            backend). Elles ne fonctionnent donc que pour un manager/admin — pas
            pour un simple employé, même si l'URL est sous /employee. Protégées
            en zone "team" pour refléter ça fidèlement ; un vrai écran "mes
            tâches" pour les employés simples reste à créer (voir changelog). */}
        <Route path="tasks" element={<ProtectedRoute zone="team"><TaskList /></ProtectedRoute>} />
        <Route path="tasks/create" element={<ProtectedRoute zone="team"><TaskCreate /></ProtectedRoute>} />
        <Route path="tasks/:id/edit" element={<ProtectedRoute zone="team"><TaskEdit /></ProtectedRoute>} />

        {/* Vue d'équipe : manager OU admin uniquement (avant, accessible à tout
            employé par erreur — la page appelle /manager/team-tasks côté API,
            qui renvoie 403 pour un simple employé). */}
        <Route path="team-tasks" element={<ProtectedRoute zone="team"><ManagerTeamTasks /></ProtectedRoute>} />

        <Route path="announcements" element={<AnnouncementList />} />
        <Route path="announcements/:id" element={<AnnouncementShow />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
