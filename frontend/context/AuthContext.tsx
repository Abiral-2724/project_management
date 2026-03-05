"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setAuth, clearAuth, getToken, getUserId } from "@/lib/api";

const defaultContext = {
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
};

const AuthContext = createContext(defaultContext);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  return ctx ?? defaultContext;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session from stored token on mount
  const loadUser = useCallback(async () => {
    const id = getUserId();
    const token = getToken();
    if (!id || !token) { setLoading(false); return; }
    try {
      const data = await api.users.getById(id);
      setUser(data.user);
    } catch {
      clearAuth(); // token expired/invalid
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  // Login → { token, id, user }
  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    setAuth(data.token, data.id ?? data.user?.id);
    setUser(data.user);
    return data.user;
  };

  // Register → { token, id, user }
  const register = async (email, password) => {
    const data = await api.auth.register(email, password);
    setAuth(data.token, data.id ?? data.user?.id);
    setUser(data.user);
    return data.user;
  };

  const logout = () => { clearAuth(); setUser(null); };

  const refreshUser = async () => {
    const id = getUserId();
    if (!id) return;
    try {
      const data = await api.users.getById(id);
      setUser(data.user);
    } catch (e) { console.error("refreshUser:", e); }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}