import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { Loader2, BookOpen, Flame, Bookmark, ShoppingCart, Play } from "lucide-react";

interface LibraryItem {
  id: string;
  user_id: string;
  work_id: string;
  status: string;
  progress: number | null;
  added_at: string;
  books: {
    id: string;
    title: string;
    author_name: string | null;
    cover: string | null;
    genre: string | null;
  } | null;
}

interface StreakRow {
  id: string;
  current_streak: number;
  longest_streak: number;
  last_read_date: string | null;
  total_minutes: number;
}

type Tab = "Reading" | "Purchased" | "Wishlist" | "Rented";

const TABS: Tab[] = ["Reading", "Purchased", "Wishlist", "Rented"];

export default function LibraryPage() {
  const { user } = useApp();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [streak, setStreak] = useState<StreakRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Reading");

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [itemsRes, streakRes] = await Promise.all([
      supabase
        .from("library_items")
        .select(`
          id, user_id, work_id, status, progress, added_at,
          books!library_items_work_id_fkey ( id, title, author_name, cover, genre )
        `)
        .eq("user_id", user.id)
        .order("added_at", { ascending: false }),
      supabase
        .from("reading_streaks")
        .select("id, current_streak, longest_streak, last_read_date, total_minutes")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    setItems((itemsRes.data ?? []) as unknown as LibraryItem[]);
    setStreak(streakRes.data as StreakRow | null);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = items.filter((i) => i.status === tab.toLowerCase());

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-serif font-bold">Library</h1>

      {streak ? (
        <div className="flex items-center gap-4 border border-ink-800 rounded-xl p-4 bg-ink-900/50">
          <div className="flex items-center gap-2 text-accent-400">
            <Flame className="h-6 w-6" />
            <span className="text-2xl font-bold">{streak.current_streak}</span>
            <span className="text-sm text-ink-400">day streak</span>
          </div>
          <div className="border-l border-ink-800 pl-4 text-sm text-ink-400">
            <p>Longest: <span className="text-ink-100">{streak.longest_streak} days</span></p>
            <p>Total: <span className="text-ink-100">{streak.total_minutes} min</span></p>
          </div>
        </div>
      ) : null}

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm transition ${
              tab === t
                ? "bg-accent-400 text-ink-950 font-medium"
                : "border border-ink-800 text-ink-400 hover:border-accent-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-ink-700 mx-auto mb-3" />
          <p className="text-ink-400 text-lg">Your library is empty.</p>
          <p className="text-ink-500 text-sm mt-1">Browse the marketplace to add books.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="book-3d border border-ink-800 rounded-lg overflow-hidden bg-ink-900/50">
              <div className="aspect-[3/4] bg-ink-800 overflow-hidden">
                {item.books?.cover ? (
                  <img src={item.books.cover} alt={item.books.title} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm text-ink-100 truncate">{item.books?.title ?? "Unknown"}</p>
                <p className="text-xs text-ink-500 truncate">{item.books?.author_name}</p>
                {item.progress != null && item.status === "reading" && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
                      <div className="h-full bg-accent-400" style={{ width: `${item.progress}%` }} />
                    </div>
                    <p className="text-xs text-ink-500 mt-1">{item.progress}%</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
