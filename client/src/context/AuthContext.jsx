import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("sweety_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("sweety_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const savedToken = localStorage.getItem("sweety_token");
      if (savedToken) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data.user);
          localStorage.setItem("sweety_user", JSON.stringify(res.data.user));
        } catch (err) {
          console.warn("Auth check failed:", err.message);
          logout();
        }
      }
      setLoading(false);
    }

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem("sweety_token", receivedToken);
    localStorage.setItem("sweety_user", JSON.stringify(receivedUser));
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem("sweety_token", receivedToken);
    localStorage.setItem("sweety_user", JSON.stringify(receivedUser));
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("sweety_token");
    localStorage.removeItem("sweety_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

