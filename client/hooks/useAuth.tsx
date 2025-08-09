import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthVerifyResponse } from "@shared/api";

interface User {
  id: string;
  username: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isWarningShown: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isWarningShown, setIsWarningShown] = useState(false);
  const queryClient = useQueryClient();

  // Auto-logout configuration
  const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
  const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before logout

  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Verify authentication status
  const { data: authData, isLoading } = useQuery({
    queryKey: ["auth-verify"],
    queryFn: async (): Promise<AuthVerifyResponse> => {
      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      });
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Update user state when auth data changes
  useEffect(() => {
    if (authData?.authenticated && authData.user) {
      setUser(authData.user);
      localStorage.setItem("admin_user", JSON.stringify(authData.user));
    } else {
      setUser(null);
      localStorage.removeItem("admin_user");
    }
  }, [authData]);

  // Create a ref to store the logout function so we can call it from timeouts
  const logoutRef = useRef<(() => Promise<void>) | null>(null);

  // Reset idle timeout
  const resetIdleTimeout = useCallback(() => {
    if (!user) return; // Only track activity when user is logged in

    lastActivityRef.current = Date.now();
    setIsWarningShown(false);

    // Clear existing timeouts
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timeout (show warning 2 minutes before logout)
    warningTimeoutRef.current = setTimeout(() => {
      setIsWarningShown(true);
    }, IDLE_TIMEOUT - WARNING_TIME);

    // Set logout timeout
    activityTimeoutRef.current = setTimeout(async () => {
      console.log("Auto-logout due to inactivity");
      try {
        if (logoutRef.current) {
          await logoutRef.current();
        }
      } catch (error) {
        console.error("Error during auto-logout:", error);
      }
    }, IDLE_TIMEOUT);
  }, [user, IDLE_TIMEOUT, WARNING_TIME]);

  // Track user activity
  const handleActivity = useCallback(() => {
    resetIdleTimeout();
  }, [resetIdleTimeout]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the idle timeout
    resetIdleTimeout();

    // Cleanup function with stable reference to events
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
        activityTimeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
    };
  }, [user, handleActivity, resetIdleTimeout]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("admin_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("admin_user");
      }
    }
  }, []);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      return response.json();
    },
    onSuccess: () => {
      // Clear activity timeouts
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }

      setUser(null);
      setIsWarningShown(false);
      localStorage.removeItem("admin_user");
      queryClient.clear();
    },
  });

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Store logout function in ref so it can be called from timeouts
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  const loginMutation = useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Wrong info");
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        queryClient.invalidateQueries({ queryKey: ["auth-verify"] });
      }
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const extendSession = () => {
    resetIdleTimeout();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    isWarningShown,
    login,
    logout,
    extendSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
