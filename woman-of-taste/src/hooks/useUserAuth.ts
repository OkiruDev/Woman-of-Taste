import { useState, useEffect, useCallback } from "react";

export interface UserProfile {
  id: number;
  userId: number;
  fullName: string | null;
  preferredName: string | null;
  profilePhotoUrl: string | null;
  shortBio: string | null;
  city: string | null;
  professionOrTitle: string | null;
  companyOrVenture: string | null;
  linkedinUrl: string | null;
  instagramHandle: string | null;
  whatBringsYou: string | null;
  dietaryRequirements: string | null;
  mobileNumber: string | null;
  profileStatus: "draft" | "submitted" | "approved" | "declined" | "waitlisted";
  profileRole: "attendee" | "speaker" | "host";
  hideFromDirectory: boolean;
  visibilityPrefs: Record<string, boolean>;
}

export interface AuthUser {
  id: number;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  authProvider: string;
}

const TOKEN_KEY = "wot_user_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path: string, options?: RequestInit) {
  const token = getStoredToken();
  return fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options?.headers as Record<string, string>) ?? {}),
    },
  });
}

export function useUserAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getStoredToken();
    if (!token) { setLoading(false); return; }
    try {
      const r = await apiFetch("/auth/me");
      if (r.ok) {
        const d = await r.json();
        setUser(d.user);
        setProfile(d.profile);
      } else {
        clearStoredToken();
        setUser(null);
        setProfile(null);
      }
    } catch {
      setUser(null); setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (identifier: string, password: string) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const d = await r.json();
    if (d.ok) { setStoredToken(d.token); setUser(d.user); await refresh(); }
    return d;
  }, [refresh]);

  const register = useCallback(async (emailOrPhone: string, password: string) => {
    const isEmail = emailOrPhone.includes("@");
    const body = isEmail
      ? { email: emailOrPhone, password }
      : { phone: emailOrPhone, password };
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (d.ok) { setStoredToken(d.token); setUser(d.user); await refresh(); }
    return d;
  }, [refresh]);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const r = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const d = await r.json();
    if (d.ok) { setStoredToken(d.token); setUser(d.user); await refresh(); }
    return d;
  }, [refresh]);

  const logout = useCallback(() => {
    clearStoredToken(); setUser(null); setProfile(null);
  }, []);

  return { user, profile, loading, login, register, loginWithGoogle, logout, refresh };
}
