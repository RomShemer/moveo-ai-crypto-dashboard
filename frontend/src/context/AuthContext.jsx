import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  //STATE
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [loading, setLoading] = useState(true);

  //LOAD USER ON REFRESH
  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiRequest("/api/me");
        setUser(res.user);
        localStorage.setItem("user", JSON.stringify(res.user));
      } catch (err) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, [token]);

  //ACTIONS
  async function login({ email, password }) {
    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setAuth(res);
    return res.user;
  }

  async function signup({ name, email, password }) {
    const res = await apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    setAuth(res);
    return res.user;
  }

  function logout() {
    clearAuth();
  }

  //HELPERS
  function setAuth(res) {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  }

  function clearAuth() {
    setUser(null);
    setToken(null);
    setLoading(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  const isAuthenticated = !!user;
  const needsOnboarding = isAuthenticated && !user?.onboardingCompleted;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,      
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated,
        needsOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
