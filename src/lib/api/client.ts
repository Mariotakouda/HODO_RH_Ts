import axios from "axios";

/**
 * Instance axios unique de l'application.
 * Base URL configurable via VITE_API_URL (voir .env) : permet de changer
 * de backend (local / staging / prod) sans toucher au code.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Injecte automatiquement le token Bearer sur chaque requête.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Sur un 401 (session expirée / token invalide), on nettoie le stockage local.
// AuthContext écoute cet évènement pour rediriger vers /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("employee");
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);
