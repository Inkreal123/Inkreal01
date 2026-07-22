import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { Loader2, Bell, CheckCheck, BellOff } from "lucide-react";

interface NotificationRow {
  id: string;
  user_id: string;
  type: string | null;
  message: string | null;
  read: boolean;
  created_at: string;
}

type Tab = "All" | "Unread";

export default function NotificationsPage() {
  const { user } = useApp();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("All");

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setNotifications((data ?? []) as NotificationRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  async function markAllRead() {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  async function markRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  }

  const filtered = tab === "All" ? notifications : notifications.filter((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-accent-400" /> Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-lg border border-ink-800 px-3 py-1.5 text-sm text-ink-300 hover:border-accent-400 hover:text-accent-400 transition"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {(["All", "Unread"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              tab === t ? "bg-accent-400 text-ink-950 font-medium" : "border border-ink-800 text-ink-400 hover:border-accent-400"
            }`}
          >
            {t}
            {t === "Unread" && unreadCount > 0 && <span className="ml-1.5 text-xs">({unreadCount})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BellOff className="h-12 w-12 text-ink-700 mx-auto mb-3" />
          <p className="text-ink-400 text-lg">No notifications.</p>
          <p className="text-ink-500 text-sm mt-1">{tab === "Unread" ? "You're all caught up." : "You have no notifications yet."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`border rounded-lg p-4 cursor-pointer transition ${
                n.read ? "border-ink-800 bg-ink-900/30" : "border-accent-400/40 bg-accent-400/5 hover:border-accent-400/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className={`text-sm ${n.read ? "text-ink-400" : "text-ink-100"}`}>{n.message || "Notification"}</p>
                  <p className="text-xs text-ink-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.read && <span className="h-2 w-2 rounded-full bg-accent-400 flex-shrink-0 mt-2" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
