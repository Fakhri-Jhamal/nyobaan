import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (data: { bio?: string; avatar?: string; banner?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("forum_token"),
    isAuthenticated: false,
    isLoading: true,
  });

  const normalizeUser = (data: any): User => ({
    ...data,
    id: data._id || data.id,
    joinedCommunities: (data.joinedCommunities || []).map((id: any) =>
      typeof id === "object" ? (id._id || id.id || id.toString()) : id.toString()
    ),
    savedPosts: (data.savedPosts || []).map((id: any) =>
      typeof id === "object" ? (id._id || id.id || id.toString()) : id.toString()
    ),
  });

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("forum_token");
      if (!token) {
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const res = await api.get("/auth/me");
      setState({
        user: normalizeUser(res.data),
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("forum_token");
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (token: string, user: User) => {
    localStorage.setItem("forum_token", token);
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem("forum_token");
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  /** Update the logged-in user's profile (bio, avatar, banner) */
  const updateProfile = useCallback(async (data: { bio?: string; avatar?: string; banner?: string }) => {
    const res = await api.put("/users/profile", data);
    setState((prev) => ({
      ...prev,
      user: prev.user ? normalizeUser({ ...prev.user, ...res.data }) : null,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, checkAuth, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
