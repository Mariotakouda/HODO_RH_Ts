import { useEffect, useState, useCallback, createContext, type ReactNode } from "react";
import { api } from "../lib/api/client";
import { errorMessage } from "../lib/api/errors";
import type { User, Employee } from "../types/auth";

export type { User, Employee };

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  setEmployee: React.Dispatch<React.SetStateAction<Employee | null>>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateLocalUserStatus: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function persistSession(user: User, employee: Employee | null) {
  localStorage.setItem("user", JSON.stringify(user));
  if (employee) {
    localStorage.setItem("employee", JSON.stringify(employee));
  } else {
    localStorage.removeItem("employee");
  }
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("employee");
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } catch {
      // On déconnecte localement même si l'appel réseau échoue.
    }
    clearSession();
    setUser(null);
    setEmployee(null);
  }, []);

  // Session expirée / token invalide détecté par l'intercepteur axios (voir lib/api/client.ts).
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setEmployee(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // Restauration de la session au chargement de l'app.
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        let parsedUser: User = JSON.parse(storedUser);
        const storedEmployee = localStorage.getItem("employee");

        if (storedEmployee) {
          const parsedEmployee: Employee = JSON.parse(storedEmployee);
          setEmployee(parsedEmployee);
          parsedUser = { ...parsedUser, employee: parsedEmployee };
        } else if (parsedUser.role === "employee" || parsedUser.role === "manager") {
          // Pas de profil employé en cache : on va le chercher.
          const { data } = await api.get("/me");
          if (data.employee) {
            setEmployee(data.employee);
            parsedUser = { ...parsedUser, employee: data.employee };
            persistSession(parsedUser, data.employee);
          }
        }

        setUser(parsedUser);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const updateLocalUserStatus = useCallback(() => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, needs_password_change: false };
      persistSession(updated, employee);
      return updated;
    });
  }, [employee]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    try {
      const { data } = await api.post("/login", { email, password });
      let userData: User = data.user;
      let employeeData: Employee | null = data.employee ?? null;

      localStorage.setItem("token", data.token);

      // Si le backend n'a pas renvoyé le profil employé au login, on le charge.
      if (!employeeData && (userData.role === "employee" || userData.role === "manager")) {
        const me = await api.get("/me").catch(() => null);
        employeeData = me?.data?.employee ?? null;
      }

      if (employeeData) {
        userData = { ...userData, employee: employeeData };
      }

      persistSession(userData, employeeData);
      setUser(userData);
      setEmployee(employeeData);

      return userData;
    } catch (err) {
      clearSession();
      throw new Error(errorMessage(err) || "Email ou mot de passe incorrect");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, employee, setEmployee, login, logout, updateLocalUserStatus, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
