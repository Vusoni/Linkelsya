"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  email: string;
  name?: string;
  subscriptionStatus?: "active" | "trialing" | "canceled" | "past_due" | null;
  subscriptionExpiresAt?: number | null;
  isSubscribed?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSubscribed: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  refreshSubscription: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "linkelsya_auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, forceUpdate] = useState(0);

  const signInMutation = useMutation(api.auth.signIn);
  const signUpMutation = useMutation(api.auth.signUp);
  const signOutMutation = useMutation(api.auth.signOut);
  const updateProfileMutation = useMutation(api.auth.updateProfile);
  
  // Use the subscription-aware query
  const user = useQuery(
    api.auth.getCurrentUserWithSubscription,
    token ? { token } : "skip"
  );

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await signInMutation({ email, password });
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const result = await signUpMutation({ email, password, name });
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
  };

  const signOut = async () => {
    if (token) {
      await signOutMutation({ token });
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    if (token) {
      await updateProfileMutation({ token, ...data });
    }
  };

  const refreshSubscription = () => {
    // Force a re-render to pick up any subscription changes
    forceUpdate((n) => n + 1);
  };

  const isSubscribed = user?.isSubscribed ?? false;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isLoading || (token !== null && user === undefined),
        isSubscribed,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth() {
  const { user, isLoading, isSubscribed } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/auth";
    }
  }, [user, isLoading]);

  return { user, isLoading, isSubscribed };
}

export function useRequireSubscription() {
  const { user, isLoading, isSubscribed } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        window.location.href = "/auth";
      } else if (!isSubscribed) {
        window.location.href = "/subscribe";
      }
    }
  }, [user, isLoading, isSubscribed]);

  return { user, isLoading, isSubscribed };
}
