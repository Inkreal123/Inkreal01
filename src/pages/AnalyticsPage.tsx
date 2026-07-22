import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { Loader2, TrendingUp, Eye, Heart, MessageCircle, Server, Shield, Flag } from "lucide-react";

interface TelemetryRow { id: string; region: string | null; cpu: number; memory: number; latency: number; db_load: number; uptime: number; }
interface AuthLogRow { id: string; email: string | null; event: string | null; location: string | null; success: boolean; timestamp: string; }
interface ModerationRow { id: string; content: string | null; author: string | null; type: string | null; status: string | null; severity: string | null; timestamp: string; }

export default function AnalyticsPage() {
  const { user } = useApp();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalReads, setTotalReads] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; value: number }[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryRow[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLogRow[]>([]);
  const [moderation, setModeration] = useState<ModerationRow[]>([]);

  const isFounder = user?.role === "founder";

  const loadData = useCallback(async () => {
    if (!user) return;
    const [postsRes, _likesRes, _commentsRes, readsRes] = await Promise.all([
      supabase.from("user_posts").select("id, likes_count, comments_count, created_at").eq("user_id", user.id),
      supabase.from("likes").select("id", { count: "exact", head: true }).in("post_id",
        (await supabase.from("user_posts").select("id").eq("user_id", user.id)).data?.map((p: { id: string }) => p.id) ?? []),
      supabase.from("post_comments").select("id", { count: "exact", head: true }).in("post_id",
        (await supabase.from("user_posts").select("id").eq("user_id", user.id)).data?.map((p: { id: string }) => p.id) ?? []),
      supabase.from("books").select("reads").eq("user_id", user.id),
    ]);

    const userPosts = (postsRes.data ?? []) as { id: string; likes_count: number; comments_count: number; created_at: string }[];
    setPosts(userPosts.length);
    setTotalLikes(userPosts.reduce((sum, p) => sum + (p.likes_count ?? 0), 0));
    setTotalComments(userPosts.reduce((sum, p) => sum + (p.comments_count ?? 0), 0));
    setTotalReads((readsRes.data ?? []).reduce((sum: number, b: { reads: number | null }) => sum + (b.reads ?? 0), 0));

    const days: { day: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString("en", { weekday: "short" });
      const count = userPosts.filter((p) => {
        if (!p.created_at) return false;
        const pd = new Date(p.created_at);
        return pd.toDateString() === d.toDateString();
      }).length;
      days.push({ day: dayStr, value: count });
    }
    setWeeklyData(days);

    if (isFounder) {
      const [telRes, authRes, modRes] = await Promise.all([
        supabase.from("telemetry").select("*").order("id", { ascending: false }).limit(20),
        supabase.from("auth_logs").select("*").order("timestamp", { ascending: false }).limit(20),
        supabase.from("moderation").select("*").order("timestamp", { ascending: false }).limit(20),
      ]);
      setTelemetry((telRes.data ?? []) as TelemetryRow[]);
      setAuthLogs((authRes.data ?? []) as AuthLogRow[]);
      setModeration((modRes.data ?? []) as ModerationRow[]);
    }

    setLoading(false);
  }, [user, isFounder]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-400" /></div>;
  }

  const maxVal = Math.max(...weeklyData.map((d) => d.value), 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-serif font-bold">Analytics</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Posts", value: posts, icon: TrendingUp },
          { label: "Total Reads", value: totalReads, icon: Eye },
          { label: "Likes", value: totalLikes, icon: Heart },
          { label: "Comments", value: totalComments, icon: MessageCircle },
        ].map((s) => (
          <div key={s.label} className="border border-ink-800 rounded-lg p-4 bg-ink-900/50">
            <s.icon className="h-5 w-5 text-accent-400 mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 7-day chart */}
      <div className="border border-ink-800 rounded-xl p-4 bg-ink-900/50">
        <h3 className="text-sm font-medium text-ink-200 mb-4">Posts · Last 7 Days</h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {weeklyData.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t bg-accent-400/80 hover:bg-accent-400 transition-all"
                  style={{ height: `${(d.value / maxVal) * 100}%`, minHeight: d.value > 0 ? "8px" : "2px" }}
                />
              </div>
              <span className="text-xs text-ink-500">{d.day}</span>
              <span className="text-xs text-ink-400">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement */}
      <div className="border border-ink-800 rounded-xl p-4 bg-ink-900/50">
        <h3 className="text-sm font-medium text-ink-200 mb-3">Engagement Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink-500">Avg. likes per post</span>
            <span className="text-ink-100">{posts > 0 ? Math.round(totalLikes / posts) : 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-500">Avg. comments per post</span>
            <span className="text-ink-100">{posts > 0 ? Math.round(totalComments / posts) : 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-500">Engagement rate</span>
            <span className="text-ink-100">{posts > 0 ? Math.round(((totalLikes + totalComments) / posts) * 10) / 10 : 0}</span>
          </div>
        </div>
      </div>

      {/* Founder panels */}
      {isFounder && (
        <>
          <div className="border border-accent-400/30 rounded-xl p-4 bg-accent-400/5">
            <p className="text-xs text-accent-400 font-medium">FOUNDER ACCESS</p>
          </div>

          {/* Infrastructure */}
          <div className="border border-ink-800 rounded-xl p-4 bg-ink-900/50">
            <h3 className="text-sm font-medium text-ink-200 mb-3 flex items-center gap-2">
              <Server className="h-4 w-4 text-accent-400" /> Infrastructure · Telemetry
            </h3>
            {telemetry.length === 0 ? (
              <p className="text-ink-500 text-sm">No telemetry data.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {telemetry.map((t) => (
                  <div key={t.id} className="flex justify-between text-xs border-b border-ink-800 pb-1">
                    <span className="text-ink-400">{t.region || "—"}</span>
                    <span className="text-ink-300">CPU: {t.cpu}% · Mem: {t.memory}% · Lat: {t.latency}ms · DB: {t.db_load}% · Up: {t.uptime}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security */}
          <div className="border border-ink-800 rounded-xl p-4 bg-ink-900/50">
            <h3 className="text-sm font-medium text-ink-200 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent-400" /> Security · Auth Logs
            </h3>
            {authLogs.length === 0 ? (
              <p className="text-ink-500 text-sm">No auth logs.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {authLogs.map((l) => (
                  <div key={l.id} className="flex justify-between text-xs border-b border-ink-800 pb-1">
                    <span className="text-ink-400">{l.email || "—"}</span>
                    <span className={l.success ? "text-emerald-400" : "text-red-400"}>
                      {l.event} · {l.location || "—"} · {new Date(l.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Moderation */}
          <div className="border border-ink-800 rounded-xl p-4 bg-ink-900/50">
            <h3 className="text-sm font-medium text-ink-200 mb-3 flex items-center gap-2">
              <Flag className="h-4 w-4 text-accent-400" /> Moderation
            </h3>
            {moderation.length === 0 ? (
              <p className="text-ink-500 text-sm">No moderation items.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {moderation.map((m) => (
                  <div key={m.id} className="flex justify-between text-xs border-b border-ink-800 pb-1">
                    <span className="text-ink-400">{m.author || "—"}</span>
                    <span className="text-ink-300">{m.type} · {m.status} · {m.severity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
