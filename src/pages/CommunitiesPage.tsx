import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { Loader2, Search, Users, LogIn, LogOut } from "lucide-react";

interface CommunityRow {
  id: string;
  name: string;
  type: string | null;
  members: number;
  region: string | null;
  description: string | null;
  cover: string | null;
}

export default function CommunitiesPage() {
  const { user } = useApp();
  const [communities, setCommunities] = useState<CommunityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .order("members", { ascending: false })
      .limit(50);
    setCommunities((data ?? []) as CommunityRow[]);

    if (user) {
      const { data: memberships } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user.id);
      setJoinedIds(new Set((memberships ?? []).map((m: { community_id: string }) => m.community_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function toggleJoin(community: CommunityRow) {
    if (!user) return;
    if (joinedIds.has(community.id)) {
      await supabase.from("community_members").delete().eq("community_id", community.id).eq("user_id", user.id);
      await supabase.from("communities").update({ members: Math.max(0, community.members - 1) }).eq("id", community.id);
      setJoinedIds((prev) => { const n = new Set(prev); n.delete(community.id); return n; });
      setCommunities((prev) => prev.map((c) => c.id === community.id ? { ...c, members: Math.max(0, c.members - 1) } : c));
    } else {
      await supabase.from("community_members").insert({ community_id: community.id, user_id: user.id, role: "member" });
      await supabase.from("communities").update({ members: community.members + 1 }).eq("id", community.id);
      setJoinedIds((prev) => new Set(prev).add(community.id));
      setCommunities((prev) => prev.map((c) => c.id === community.id ? { ...c, members: c.members + 1 } : c));
    }
  }

  const filtered = communities.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-serif font-bold">Communities</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search communities…"
          className="w-full rounded-lg border border-ink-800 bg-ink-900 pl-10 pr-4 py-2.5 text-ink-100 placeholder-ink-500 outline-none focus:border-accent-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-ink-700 mx-auto mb-3" />
          <p className="text-ink-400 text-lg">No communities yet.</p>
          <p className="text-ink-500 text-sm mt-1">Be the first to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="border border-ink-800 rounded-xl p-4 bg-ink-900/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-ink-100">{c.name}</h3>
                    {c.type && <span className="text-xs text-accent-400 border border-accent-400/30 rounded-full px-2 py-0.5">{c.type}</span>}
                  </div>
                  {c.description && <p className="text-sm text-ink-400 mt-1">{c.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-ink-500">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.members} members</span>
                    {c.region && <span>📍 {c.region}</span>}
                  </div>
                </div>
                <button
                  onClick={() => toggleJoin(c)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition flex-shrink-0 ${
                    joinedIds.has(c.id)
                      ? "border border-ink-800 text-ink-400 hover:border-red-400/50"
                      : "bg-accent-400 text-ink-950 font-medium"
                  }`}
                >
                  {joinedIds.has(c.id) ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {joinedIds.has(c.id) ? "Leave" : "Join"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
