"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { getCurrentUser, getCurrentSession, signOut as supabaseSignOut } from "./supabase";
import { getUser, getUserRoles } from "./db";

interface UserWithRoles {
  id: string;
  email: string;
  githubUsername?: string | null;
  roles: string[];
}

interface AuthContextType {
  user: UserWithRoles | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refetchUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const { session: userSession, error: sessionError } = await getCurrentSession();
      if (sessionError) throw sessionError;
      setSession(userSession);

      if (userSession?.user?.id) {
        const dbUser = await getUser(userSession.user.id);
        if (dbUser) {
          const roles = await getUserRoles(dbUser.id);
          setUser({
            id: dbUser.id,
            email: dbUser.email || "",
            githubUsername: dbUser.githubUsername,
            roles,
          });
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error: signOutError } = await supabaseSignOut();
      if (signOutError) throw signOutError;
      setUser(null);
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) ?? false;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signOut: handleSignOut,
        refetchUser: fetchUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthContext;
