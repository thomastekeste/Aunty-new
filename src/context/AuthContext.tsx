import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, userService, IS_DEMO_MODE } from '@/services/supabase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (IS_DEMO_MODE) {
      // No backend configured — show onboarding as a guest
      setIsLoading(false);
      return;
    }

    // Restore session on mount
    authService.getSession().then(async session => {
      if (session?.user) {
        try {
          const profile = await userService.get(session.user.id);
          setUser(profile);
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (userId) => {
      if (userId) {
        try {
          const profile = await userService.get(userId);
          setUser(profile);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const { user: authUser } = await authService.signUp(email, password);
      if (authUser) {
        const profile = await userService.create(authUser.id, name, email);
        setUser(profile);
      }
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      const { user: authUser } = await authService.signIn(email, password);
      if (authUser) {
        const profile = await userService.get(authUser.id);
        setUser(profile);
      }
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateUser = (patch: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...patch } : patch as User);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signUp, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
