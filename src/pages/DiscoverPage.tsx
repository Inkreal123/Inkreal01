import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { GENRES } from "../lib/data";
import { Loader2, Search, UserPlus, UserCheck, Sparkles, BookOpen } from "lucide-react";

interface BookRow {
  id: string;
  title: string;
  author_name: string | null;
  cover: string | null;
  genre: string | null;
  rating: number | null;
  reads: number | null;
}

interface CreatorRow {
  id: string;
  name: string;
  handle: string | null;
  avatar: string | null;
  bio: string | null;
  followers: number | null;
  verified: boolean | null;
}

export default function DiscoverPage() {
  const { user } = useApp();
  const [books, setBooks] = useState<BookRow[]>([]);
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    const [booksRes, creatorsRes] = await Promise.all([
      supabase.from("books").select("id, title, author_name, cover, genre, rating, reads").limit(50),
      supabase.from("creators").select("id, name, handle, avatar, bio, followers, verified").limit(50),
    ]);
    setBooks(booksRes.data ?? []);
    setCreators(creatorsRes.data ?? []);

    if (user) {
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);
      setFollowingIds(new Set((follows ?? []).map((f: { following_id: string }) => f.following_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function toggleFollow(creatorId: string) {
    if (!user) return;
    if (followingIds.has(creatorId)) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", creatorId);
      setFollowingIds((prev) => { const n = new Set(prev); n.delete(creatorId); return n; });
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: creatorId });
      setFollowingIds((prev) => new Set(prev).add(creatorId));
    }
  }

  const filteredBooks = books.filter((b) => {
    const genreMatch = genre === "All" || b.genre === genre;
    const searchMatch = !search || b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author_name ?? "").toLowerCase().includes(search.toLowerCase());
    return genreMatch && searchMatch;
  });

  const filteredCreators = creators.filter((c) => {
    const searchMatch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.handle ?? "").toLowerCase().includes(search.toLowerCase());
    return searchMatch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold">Discover</h1>
        <div className="flex items-center gap-1.5 text-xs text-ink-500">
          <Sparkles className="h-3 w-3" />
          <span>AI recommendations coming soon</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books and creators…"
          className="w-full rounded-lg border border-ink-800 bg-ink-900 pl-10 pr-4 py-2.5 text-ink-100 placeholder-ink-500 outline-none focus:border-accent-400"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {["All", ...GENRES].map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm transition ${
              genre === g
                ? "bg-accent-400 text-ink-950 font-medium"
                : "border border-ink-800 text-ink-400 hover:border-accent-400 hover:text-accent-400"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent-400" />
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-lg font-serif font-semibold mb-3">Books</h2>
            {filteredBooks.length === 0 ? (
              <p className="text-ink-500 text-center py-8">No books found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredBooks.map((b) => (
                  <div key={b.id} className="book-3d border border-ink-800 rounded-lg overflow-hidden bg-ink-900/50">
                    <div className="aspect-[3/4] bg-ink-800 overflow-hidden">
                      {b.cover ? <img src={b.cover} alt={b.title} className="h-full w-full object-cover" /> : null}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-ink-100 truncate">{b.title}</p>
                      <p className="text-xs text-ink-500 truncate">{b.author_name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-ink-400">
                        {b.genre && <span>{b.genre}</span>}
                        {b.rating != null && <span>★ {b.rating}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-serif font-semibold mb-3">Creators</h2>
            {filteredCreators.length === 0 ? (
              <p className="text-ink-500 text-center py-8">No creators found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCreators.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 border border-ink-800 rounded-lg p-4 bg-ink-900/50">
                    <div className="h-12 w-12 rounded-full bg-ink-800 overflow-hidden flex-shrink-0">
                      {c.avatar ? <img src={c.avatar} alt={c.name} className="h-full w-full object-cover" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-ink-100 truncate">{c.name}</p>
                        {c.verified && <span className="text-accent-400 text-xs">✓</span>}
                      </div>
                      <p className="text-xs text-ink-500 truncate">@{c.handle}</p>
                      <p className="text-xs text-ink-400">{c.followers ?? 0} followers</p>
                    </div>
                    <button
                      onClick={() => toggleFollow(c.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${
                        followingIds.has(c.id)
                          ? "border border-ink-800 text-ink-400"
                          : "bg-accent-400 text-ink-950 font-medium"
                      }`}
                    >
                      {followingIds.has(c.id) ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      {followingIds.has(c.id) ? "Following" : "Follow"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
