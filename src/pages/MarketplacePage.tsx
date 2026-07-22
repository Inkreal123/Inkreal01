import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { GENRES } from "../lib/data";
import { formatPrice, detectBrowserCurrency, type CurrencyCode } from "../lib/regions";
import { Loader2, ShoppingCart, Sparkles } from "lucide-react";

interface BookRow {
  id: string;
  title: string;
  author_name: string | null;
  cover: string | null;
  genre: string | null;
  price_usd: number;
  rent_usd: number;
  rating: number | null;
  description: string | null;
}

export default function MarketplacePage() {
  const { user, pushToast } = useApp();
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState<string>("All");
  const [currency, setCurrency] = useState<CurrencyCode>(detectBrowserCurrency());

  const loadBooks = useCallback(async () => {
    const { data } = await supabase
      .from("books")
      .select("id, title, author_name, cover, genre, price_usd, rent_usd, rating, description")
      .order("rating", { ascending: false })
      .limit(50);
    setBooks((data ?? []) as BookRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  async function addToLibrary(book: BookRow, status: string) {
    if (!user) return;
    const { error } = await supabase
      .from("library_items")
      .insert({ user_id: user.id, work_id: book.id, status, progress: 0 });
    if (error) {
      pushToast("Failed to add to library", "error");
    } else {
      pushToast(`Added "${book.title}" to your library`, "success");
    }
  }

  const filtered = genre === "All" ? books : books.filter((b) => b.genre === genre);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold">Marketplace</h1>
        <div className="flex items-center gap-1.5 text-xs text-ink-500">
          <Sparkles className="h-3 w-3" />
          <span>AI recommendations coming soon</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 outline-none focus:border-accent-400"
        >
          <option value="All">All Genres</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 outline-none focus:border-accent-400"
        >
          {Object.entries({ USD: "$", EUR: "€", GBP: "£", ZAR: "R", JPY: "¥", NGN: "₦", KES: "KSh", GHS: "₵", EGP: "E£", CAD: "C$", MXN: "Mex$", BRL: "R$", AUD: "A$", INR: "₹", SGD: "S$", AED: "AED" }).map(([code, sym]) => (
            <option key={code} value={code}>{code} ({sym})</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-400 text-lg">No books available yet.</p>
          <p className="text-ink-500 text-sm mt-1">Check back soon for new releases.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((b) => (
            <div key={b.id} className="book-3d border border-ink-800 rounded-lg overflow-hidden bg-ink-900/50 flex flex-col">
              <div className="aspect-[3/4] bg-ink-800 overflow-hidden">
                {b.cover ? <img src={b.cover} alt={b.title} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="font-medium text-sm text-ink-100 truncate">{b.title}</p>
                <p className="text-xs text-ink-500 truncate">{b.author_name}</p>
                {b.genre && <span className="text-xs text-accent-400 mt-1">{b.genre}</span>}
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-ink-100">{formatPrice(b.price_usd, currency)}</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => addToLibrary(b, "purchased")}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-accent-400 px-2 py-1.5 text-xs text-ink-950 font-medium hover:bg-accent-300 transition"
                    >
                      <ShoppingCart className="h-3 w-3" /> Buy
                    </button>
                    <button
                      onClick={() => addToLibrary(b, "wishlist")}
                      className="flex-1 rounded-lg border border-ink-800 px-2 py-1.5 text-xs text-ink-300 hover:border-accent-400 transition"
                    >
                      Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
