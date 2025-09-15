import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(null);
  const [expiresIn, setExpiresIn] = useState(null);

  // Verificar si hay un usuario logueado al cargar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      logout(); // Limpiar datos corruptos
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);

      // Aquí harías la llamada a tu API
      // const response = await fetch('/api/login', { ... });

      const response = await axios.post(
        `http://localhost:3002/auth/login`,
        credentials
      );

      console.log("Login response:", response.data);

      const data = response.data;

      // Simulación de autenticación
      if (data.status) {
        const userData = data.user;

        const token = data.accessToken;
        const refreshToken = data.refreshToken;
        const expiresIn = data.expiresIn;

        // Guardar en localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));

        setIsAuthenticated(true);
        setUser(userData);
        setRefreshToken(refreshToken);
        setExpiresIn(expiresIn);

        return { success: true };
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    refreshToken,
    expiresIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
