import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type UserRole = "reader" | "writer" | "creator" | "publisher" | "educator" | "moderator" | "admin" | "founder";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  bio: string;
  motto: string;
  country: string;
  handle: string;
  penName: string;
  joinedAt: string;
}

interface Toast { id: string; message: string; type: "info" | "success" | "error"; }

interface AppState {
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
  mood: string;
  soundOn: boolean;
  toasts: Toast[];
  setMood: (m: string) => void;
  setSoundOn: (s: boolean) => void;
  signOut: () => Promise<void>;
  pushToast: (message: string, type?: Toast["type"]) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);
const FOUNDER_EMAILS = ["jdonough123@gmail.com", "jaydinmathew3@gmail.com"];

function roleFromUser(user: User | null): UserRole {
  if (!user) return "reader";
  if (FOUNDER_EMAILS.includes(user.email ?? "")) return "founder";
  return "writer";
}

function nameFromEmail(email: string): string {
  const handle = email.split("@")[0];
  return handle.charAt(0).toUpperCase() + handle.slice(1);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState("silence");
  const [soundOn, setSoundOn] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  async function loadProfile(sess: Session) {
    const u = sess.user;
    const { data: profile } = await supabase
      .from("profiles").select("name, handle, avatar, bio, motto, country, role, pen_name")
      .eq("id", u.id).maybeSingle();
    setUser({
      id: u.id, email: u.email ?? "",
      name: profile?.name || nameFromEmail(u.email ?? "Creator"),
      role: roleFromUser(u),
      avatar: profile?.avatar || "",
      bio: profile?.bio || "",
      motto: profile?.motto || "",
      country: profile?.country || "",
      handle: profile?.handle || "",
      penName: profile?.pen_name || "",
      joinedAt: u.created_at ?? new Date().toISOString(),
    });
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) { loadProfile(data.session).finally(() => setLoading(false)); }
      else { setLoading(false); }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        setSession(sess);
        if (sess) { await loadProfile(sess); } else { setUser(null); }
      })();
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null); setSession(null);
  }, []);

  return (
    <AppContext.Provider value={{ session, user, loading, mood, soundOn, toasts, setMood, setSoundOn, signOut, pushToast, dismissToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
