export const MOODS = [
  { id: "silence", label: "Silence", gradient: "from-ink-900 to-ink-950", accent: "#948766" },
  { id: "rain", label: "Rain", gradient: "from-slate-800 to-ink-950", accent: "#64748b" },
  { id: "ocean", label: "Ocean", gradient: "from-cyan-950 to-ink-950", accent: "#06b6d4" },
  { id: "forest", label: "Forest", gradient: "from-emerald-900/40 to-ink-950", accent: "#10b981" },
  { id: "fireplace", label: "Fireplace", gradient: "from-orange-950/40 to-ink-950", accent: "#f97316" },
  { id: "coffee", label: "Coffee Shop", gradient: "from-amber-800/30 to-ink-950", accent: "#d97706" },
  { id: "night", label: "Night Writing", gradient: "from-indigo-950 to-ink-950", accent: "#6366f1" },
  { id: "classical", label: "Classical", gradient: "from-violet-950/30 to-ink-950", accent: "#8b5cf6" },
  { id: "lofi", label: "Lo-fi", gradient: "from-rose-950/30 to-ink-950", accent: "#f43f5e" },
  { id: "focus", label: "Focus", gradient: "from-ink-900 to-ink-950", accent: "#ff9d37" },
] as const;

export const GENRES = ["Literary Fiction", "Poetry", "Mystery", "Essays", "Folklore", "Education", "Romance", "Fantasy", "Sci-Fi", "Spoken Word", "Non-fiction", "Adventure"];

export const ACHIEVEMENTS = [
  { id: "first_login", label: "First Login", desc: "You joined InkReal.", icon: "Login" },
  { id: "first_poem", label: "First Poem", desc: "You published your first poem.", icon: "Feather" },
  { id: "first_book", label: "First Book", desc: "You published your first book.", icon: "BookOpen" },
  { id: "first_follower", label: "First Follower", desc: "Someone followed you.", icon: "UserPlus" },
  { id: "first_sale", label: "First Sale", desc: "You made your first sale.", icon: "ShoppingBag" },
  { id: "100_readers", label: "100 Readers", desc: "100 people read your work.", icon: "Eye" },
  { id: "1000_readers", label: "1,000 Readers", desc: "1,000 people read your work.", icon: "TrendingUp" },
  { id: "first_audiobook", label: "First Audiobook", desc: "You published your first audiobook.", icon: "Headphones" },
  { id: "verified_creator", label: "Verified Creator", desc: "You became a verified creator.", icon: "BadgeCheck" },
  { id: "trending_author", label: "Trending Author", desc: "Your work is trending.", icon: "Flame" },
  { id: "night_owl", label: "Night Owl Writer", desc: "You wrote past midnight.", icon: "Moon" },
  { id: "100_day_streak", label: "100-Day Streak", desc: "100 days of consistent writing.", icon: "Award" },
];

export const CREATIVE_ACHIEVEMENTS = [
  { id: "night_owl", label: "Night Owl Writer", desc: "Wrote past midnight" },
  { id: "100_day_streak", label: "100-Day Writing Streak", desc: "100 days of consistent writing" },
  { id: "master_poet", label: "Master Poet", desc: "Published 50+ poems" },
  { id: "storyteller", label: "Storyteller", desc: "Published 10+ stories" },
  { id: "community_mentor", label: "Community Mentor", desc: "Helped 100+ creators" },
  { id: "best_audiobook", label: "Best Audiobook", desc: "Top-rated audiobook" },
  { id: "most_inspiring", label: "Most Inspiring Creator", desc: "Most highlighted writer" },
  { id: "global_bestseller", label: "Global Bestseller", desc: "Sold in 10+ countries" },
  { id: "founders_choice", label: "Founder's Choice", desc: "Selected by Jaydin Donough" },
];

export const PULSE_MESSAGES = [
  "Someone just published a poem.",
  "A reader just finished a chapter.",
  "A writer just reached 10,000 readers.",
  "An audiobook was just released.",
  "People are reading together right now.",
  "A new community was just created.",
  "Someone just joined InkReal.",
  "A creator just published their first book.",
  "A writer just earned a new achievement.",
  "Someone just highlighted a poem.",
];
