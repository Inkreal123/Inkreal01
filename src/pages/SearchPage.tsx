import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { Loader2, Search, BookOpen, Users, MessageSquare, UsersRound, Clock, X } from "lucide-react";

type Tab = "Books" | "Creators" | "Posts" | "Communities";

interface BookResult { id: string; title: string; author_name: string | null; cover: string | null; genre: string | null; }
interface CreatorResult { id: string; name: string; handle: string | null; avatar: string | null; bio: string | null; }
interface PostResult { id: string; body: string | null; created_at: string; author_name?: string | null; }
interface CommunityResult { id: string; name: string; members: number; description: string | null; }

export default function SearchPage() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>("Books");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<BookResult[] | CreatorResult[] | PostResult[] | CommunityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(query), 350);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query]);

  const loadRecentSearches = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("search_history")
      .select("query")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setRecentSearches((data ?? []).map((d: { query: string }) => d.query));
  }, [user]);

  useEffect(() => { loadRecentSearches(); }, [loadRecentSearches]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }

    async function search() {
      setLoading(true);
      if (user) {
        await supabase.from("search_history").insert({ user_id: user.id, query: debouncedQuery.trim() });
      }

      let data: BookResult[] | CreatorResult[] | PostResult[] | CommunityResult[] | null = null;
      const q = debouncedQuery.trim();

      if (tab === "Books") {
        const res = await supabase.from("books").select("id, title, author_name, cover, genre").ilike("title", `%${q}%`).limit(20);
        data = res.data as BookResult[];
      } else if (tab === "Creators") {
        const res = await supabase.from("creators").select("id, name, handle, avatar, bio").ilike("name", `%${q}%`).limit(20);
        data = res.data as CreatorResult[];
      } else if (tab === "Posts") {
        const res = await supabase
          .from("user_posts")
          .select("id, body, created_at, profiles:user_id ( name )")
          .ilike("body", `%${q}%`)
          .order("created_at", { ascending: false })
          .limit(20);
        data = (res.data ?? []).map((p: Record<string, unknown>) => {
          const profile = p.profiles as { name: string | null } | null;
          return { id: p.id as string, body: p.body as string | null, created_at: p.created_at as string, author_name: profile?.name ?? null };
        }) as PostResult[];
      } else if (tab === "Communities") {
        const res = await supabase.from("communities").select("id, name, members, description").ilike("name", `%${q}%`).limit(20);
        data = res.data as CommunityResult[];
      }

      setResults(data ?? []);
      setLoading(false);
      loadRecentSearches();
    }

    search();
  }, [debouncedQuery, tab, user, loadRecentSearches]);

  const tabs: { label: Tab; icon: typeof BookOpen }[] = [
    { label: "Books", icon: BookOpen },
    { label: "Creators", icon: Users },
    { label: "Posts", icon: MessageSquare },
    { label: "Communities", icon: UsersRound },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-serif font-bold">Search</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search InkReal…"
          className="w-full rounded-lg border border-ink-800 bg-ink-900 pl-10 pr-10 py-2.5 text-ink-100 placeholder-ink-500 outline-none focus:border-accent-400"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-200">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={() => setTab(t.label)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition ${
              tab === t.label ? "bg-accent-400 text-ink-950 font-medium" : "border border-ink-800 text-ink-400 hover:border-accent-400"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {!debouncedQuery.trim() && recentSearches.length > 0 && (
        <div>
          <p className="text-sm text-ink-500 flex items-center gap-1.5 mb-2"><Clock className="h-3.5 w-3.5" /> Recent Searches</p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s, i) => (
              <button
                key={i}
                onClick={() => setQuery(s)}
                className="rounded-full border border-ink-800 px-3 py-1.5 text-sm text-ink-300 hover:border-accent-400 hover:text-accent-400 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-400" /></div>
      ) : !debouncedQuery.trim() ? (
        <p className="text-ink-500 text-center py-8 text-sm">Start typing to search across InkReal.</p>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-400 text-lg">No results found.</p>
          <p className="text-ink-500 text-sm mt-1">Try a different search term or tab.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tab === "Books" && (results as BookResult[]).map((b) => (
            <div key={b.id} className="flex items-center gap-3 border border-ink-800 rounded-lg p-3 bg-ink-900/50">
              <div className="h-14 w-10 rounded bg-ink-800 overflow-hidden flex-shrink-0">
                {b.cover ? <img src={b.cover} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-100">{b.title}</p>
                <p className="text-xs text-ink-500">{b.author_name} · {b.genre}</p>
              </div>
            </div>
          ))}
          {tab === "Creators" && (results as CreatorResult[]).map((c) => (
            <div key={c.id} className="flex items-center gap-3 border border-ink-800 rounded-lg p-3 bg-ink-900/50">
              <div className="h-10 w-10 rounded-full bg-ink-800 overflow-hidden flex-shrink-0">
                {c.avatar ? <img src={c.avatar} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-100">{c.name}</p>
                <p className="text-xs text-ink-500">@{c.handle}</p>
              </div>
            </div>
          ))}
          {tab === "Posts" && (results as PostResult[]).map((p) => (
            <div key={p.id} className="border border-ink-800 rounded-lg p-3 bg-ink-900/50">
              <p className="text-sm text-ink-200 line-clamp-2">{p.body}</p>
              <p className="text-xs text-ink-500 mt-1">{p.author_name} · {new Date(p.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {tab === "Communities" && (results as CommunityResult[]).map((c) => (
            <div key={c.id} className="border border-ink-800 rounded-lg p-3 bg-ink-900/50">
              <p className="text-sm font-medium text-ink-100">{c.name}</p>
              <p className="text-xs text-ink-500">{c.members} members · {c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
