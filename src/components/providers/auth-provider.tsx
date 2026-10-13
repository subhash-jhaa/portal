"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout as logoutRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import type { CurrentUser } from "@/lib/types/auth";
const AuthContext = createContext<{
  user: CurrentUser;
  role: CurrentUser["role"];
  logout: () => Promise<void>;
  loggingOut: boolean;
  logoutError: string;
} | null>(null);
export function AuthProvider({
  user: initialUser,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState(initialUser);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const navigating = useRef(false);
  const router = useRouter();
  const expire = useCallback(() => {
    if (navigating.current) return;
    navigating.current = true;
    router.replace("/login?reason=session-expired");
    router.refresh();
  }, [router]);
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const data = await getCurrentUser(controller.signal);
        if (mounted) setUser(data.user);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) expire();
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("growmer:session-expired", expire);
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(onVisible, 60000);
    void refresh();
    return () => {
      mounted = false;
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("growmer:session-expired", expire);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [expire]);
  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logoutRequest();
      router.replace("/login?reason=logged-out");
      router.refresh();
    } catch {
      setLogoutError("Unable to sign out. Please retry.");
      setLoggingOut(false);
    }
  };
  return (
    <AuthContext.Provider
      value={{ user, role: user.role, logout, loggingOut, logoutError }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useCurrentUser() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error(
      "useCurrentUser must be used inside the protected AuthProvider",
    );
  return context;
}
