import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { env } from "../lib/env";
import { Loader2, Globe, Users, BookOpen, MapPin, Search } from "lucide-react";

interface LocationRow {
  id: string;
  user_id: string;
  country: string;
  city: string | null;
  creator_type: string | null;
  genres: string[] | null;
  published_books: number;
  events: number;
  latitude: number | null;
  longitude: number | null;
}

interface CountryGroup {
  country: string;
  cities: LocationRow[];
  creatorCount: number;
  totalBooks: number;
  totalEvents: number;
}

export default function GlobalLiteraryMapPage() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const loadLocations = useCallback(async () => {
    const { data } = await supabase
      .from("locations")
      .select("*")
      .order("country", { ascending: true });
    setLocations((data ?? []) as LocationRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadLocations(); }, [loadLocations]);

  const hasMapbox = !!env.VITE_MAPBOX_TOKEN;

  const grouped: CountryGroup[] = (() => {
    const map = new Map<string, LocationRow[]>();
    locations.forEach((loc) => {
      const arr = map.get(loc.country) ?? [];
      arr.push(loc);
      map.set(loc.country, arr);
    });
    const groups: CountryGroup[] = [];
    for (const [country, cities] of map.entries()) {
      groups.push({
        country,
        cities,
        creatorCount: cities.length,
        totalBooks: cities.reduce((s, c) => s + (c.published_books ?? 0), 0),
        totalEvents: cities.reduce((s, c) => s + (c.events ?? 0), 0),
      });
    }
    return groups.filter((g) => !search || g.country.toLowerCase().includes(search.toLowerCase()));
  })();

  const totalCreators = locations.length;
  const totalBooks = locations.reduce((s, l) => s + (l.published_books ?? 0), 0);
  const totalEvents = locations.reduce((s, l) => s + (l.events ?? 0), 0);

  function toggleCountry(country: string) {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(country)) n.delete(country); else n.add(country);
      return n;
    });
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-400" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-7 w-7 text-accent-400" />
        <h1 className="text-2xl font-serif font-bold">Global Literary Map</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-ink-800 rounded-lg p-3 text-center bg-ink-900/50">
          <Users className="h-5 w-5 text-accent-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{totalCreators}</p>
          <p className="text-xs text-ink-500">Creators</p>
        </div>
        <div className="border border-ink-800 rounded-lg p-3 text-center bg-ink-900/50">
          <BookOpen className="h-5 w-5 text-accent-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{totalBooks}</p>
          <p className="text-xs text-ink-500">Books</p>
        </div>
        <div className="border border-ink-800 rounded-lg p-3 text-center bg-ink-900/50">
          <MapPin className="h-5 w-5 text-accent-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{totalEvents}</p>
          <p className="text-xs text-ink-500">Events</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search countries…"
          className="w-full rounded-lg border border-ink-800 bg-ink-900 pl-10 pr-4 py-2.5 text-ink-100 placeholder-ink-500 outline-none focus:border-accent-400"
        />
      </div>

      {hasMapbox ? (
        <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-900/50 h-[500px] flex items-center justify-center">
          <div className="text-center">
            <Globe className="h-12 w-12 text-accent-400 mx-auto mb-2" />
            <p className="text-ink-300">Mapbox integration active</p>
            <p className="text-xs text-ink-500">Token detected — interactive map loading…</p>
          </div>
        </div>
      ) : (
        <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-900/30">
          {/* Stylized dark grid fallback */}
          <div
            className="h-48 relative"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,157,55,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,157,55,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
              background: "radial-gradient(ellipse at center, #1a1712 0%, #0d0b08 100%)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-16 w-16 text-accent-400/30 mx-auto mb-2 animate-float-slow" />
                <p className="text-sm text-ink-500">Stylized map view</p>
                <p className="text-xs text-ink-600">Mapbox token not configured</p>
              </div>
            </div>
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,157,55,0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,157,55,0.08) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Expandable countries */}
          <div className="p-4 space-y-2">
            {grouped.length === 0 ? (
              <p className="text-ink-500 text-center py-8">No locations found.</p>
            ) : (
              grouped.map((g) => (
                <div key={g.country} className="border border-ink-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCountry(g.country)}
                    className="w-full flex items-center justify-between p-3 hover:bg-ink-800/50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent-400" />
                      <span className="font-medium text-ink-100">{g.country}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-ink-500">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {g.creatorCount}</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {g.totalBooks}</span>
                      <span>{expanded.has(g.country) ? "−" : "+"}</span>
                    </div>
                  </button>
                  {expanded.has(g.country) && (
                    <div className="border-t border-ink-800 p-3 space-y-2 bg-ink-900/30">
                      {g.cities.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-ink-200">{c.city || "Unknown"}</span>
                            {c.creator_type && <span className="text-xs text-ink-500 ml-2">{c.creator_type}</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-ink-500">
                            <span>{c.published_books} books</span>
                            <span>{c.events} events</span>
                            {c.genres && c.genres.length > 0 && (
                              <span className="text-accent-400">{c.genres.join(", ")}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
