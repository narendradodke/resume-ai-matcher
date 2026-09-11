"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  User,
  getStoredUser,
  setAuthTokens,
  clearAuthTokens,
  isAuthenticated as checkIsAuth,
} from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load user from storage or verify with /auth/me on mount
  const refreshUser = useCallback(async () => {
    if (!checkIsAuth()) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Fast initial hydration from localStorage
    const cachedUser = getStoredUser();
    if (cachedUser) {
      setUser(cachedUser);
    }

    // Verify token with backend
    try {
      const res = await api.get("/auth/me");
      if (res.data?.success && res.data?.data) {
        const freshUser: User = res.data.data;
        setUser(freshUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_user", JSON.stringify(freshUser));
        }
      }
    } catch {
      clearAuthTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data?.success && response.data?.data) {
        const { access_token, refresh_token, user: loggedUser } = response.data.data;
        setAuthTokens(access_token, refresh_token, loggedUser);
        setUser(loggedUser);
        router.push("/dashboard");
      } else {
        throw new Error(response.data?.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const signupRes = await api.post("/auth/signup", { name, email, password });
      if (!signupRes.data?.success) {
        throw new Error(signupRes.data?.error || "Registration failed");
      }
      // Automatically log in upon signup
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    clearAuthTokens();
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
  };
}
