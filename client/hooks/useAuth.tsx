import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthVerifyResponse } from '@shared/api';

interface User {
  id: string;
  username: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Verify authentication status
  const { data: authData, isLoading } = useQuery({
    queryKey: ['auth-verify'],
    queryFn: async (): Promise<AuthVerifyResponse> => {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include'
      });
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  // Update user state when auth data changes
  useEffect(() => {
    if (authData?.authenticated && authData.user) {
      setUser(authData.user);
      localStorage.setItem('admin_user', JSON.stringify(authData.user));
    } else {
      setUser(null);
      localStorage.removeItem('admin_user');
    }
  }, [authData]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('admin_user');
      }
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Wrong info');
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        queryClient.invalidateQueries({ queryKey: ['auth-verify'] });
      }
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      return response.json();
    },
    onSuccess: () => {
      setUser(null);
      localStorage.removeItem('admin_user');
      queryClient.clear();
    }
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
