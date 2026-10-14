"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  const client = useQueryClient();
  const [transition, setTransition] = useState<"ending" | "switching" | null>(
    null,
  );
  const clearWorkspace = useCallback(() => {
    void client.cancelQueries();
    client.clear();
  }, [client]);
  const expire = useCallback(() => {
    if (navigating.current) return;
    navigating.current = true;
    setTransition("ending");
    clearWorkspace();
    router.replace("/login?reason=session-expired");
    router.refresh();
  }, [router, clearWorkspace]);
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    let inFlight = false;
    const refresh = async () => {
      if (inFlight || navigating.current) return;
      inFlight = true;
      try {
        const data = await getCurrentUser(controller.signal);
        if (!mounted || navigating.current) return;
        if (
          data.user.id !== initialUser.id ||
          data.user.role !== initialUser.role
        ) {
          navigating.current = true;
          setTransition("switching");
          clearWorkspace();
          router.refresh();
          return;
        }
        setUser(data.user);
      } catch (error) {
        if (mounted && error instanceof ApiError && error.status === 401)
          expire();
      } finally {
        inFlight = false;
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
  }, [expire, initialUser.id, initialUser.role, clearWorkspace, router]);
  const logout = async () => {
    if (loggingOut || navigating.current) return;
    navigating.current = true;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logoutRequest();
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        navigating.current = false;
        setLogoutError("Unable to sign out. Please retry.");
        setLoggingOut(false);
        return;
      }
    }
    setTransition("ending");
    clearWorkspace();
    router.replace("/login?reason=logged-out");
    router.refresh();
  };
  return (
    <AuthContext.Provider
      value={{ user, role: user.role, logout, loggingOut, logoutError }}
    >
      {transition ? (
        <div
          role="status"
          className="grid min-h-screen place-items-center bg-background p-6 text-sm text-muted-foreground"
        >
          {transition === "switching"
            ? "Updating your workspace…"
            : "Returning to sign in…"}
        </div>
      ) : (
        children
      )}
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
