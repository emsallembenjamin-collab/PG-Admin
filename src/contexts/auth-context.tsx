"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  goldpayApi,
  setAuthToken,
  clearAuthToken,
  AUTH_TOKEN_KEY,
  type AuthUser,
} from "@/lib/goldpay-api";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_USER_KEY = "goldpay_admin_user";

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function writeUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;

  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearStoredSession() {
  clearAuthToken();
  writeUser(null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const clearSession = useCallback((redirectToSignIn = false) => {
    clearStoredSession();
    setTokenState(null);
    setUser(null);

    if (redirectToSignIn) {
      router.replace("/auth/sign-in");
    }
  }, [router]);

  useEffect(() => {
    const storedToken = readToken();
    const storedUser = readUser();
    let isActive = true;

    setTokenState(storedToken);
    setUser(storedUser);

    if (!storedToken) {
      if (storedUser) {
        writeUser(null);
      }
      setIsLoading(false);
      return;
    }

    goldpayApi.auth
      .me()
      .then((currentUser) => {
        if (!isActive) return;
        setUser(currentUser);
        writeUser(currentUser);
      })
      .catch(() => {
        if (!isActive) return;
        clearSession();
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [clearSession]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession(true);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== AUTH_TOKEN_KEY && event.key !== AUTH_USER_KEY) {
        return;
      }

      setTokenState(readToken());
      setUser(readUser());
    };

    window.addEventListener("goldpay-unauthorized", handleUnauthorized);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("goldpay-unauthorized", handleUnauthorized);
      window.removeEventListener("storage", handleStorage);
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await goldpayApi.auth.login(email.trim(), password);
    setAuthToken(res.access_token);
    setTokenState(res.access_token);
    writeUser(res.user);
    setUser(res.user);
    router.replace("/");
  }, [router]);

  const logout = useCallback(() => {
    clearSession(true);
  }, [clearSession]);

  const value: AuthContextValue = {
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    token,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
