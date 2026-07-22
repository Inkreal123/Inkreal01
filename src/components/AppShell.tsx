import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  Home,
  Compass,
  Library,
  PenTool,
  ShoppingBag,
  BarChart3,
  Bell,
  User,
  LogOut,
  Search,
  MessageSquare,
  Users,
  Headphones,
  Video,
  Settings,
  Menu,
  X,
  Map,
} from "lucide-react";
import { useApp } from "../lib/store";
import { supabase } from "../lib/supabase";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/feed", label: "Feed", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/reels", label: "Reels", icon: Video },
  { to: "/library", label: "Library", icon: Library },
  { to: "/write", label: "Write", icon: PenTool },
  { to: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { to: "/audio", label: "Audio", icon: Headphones },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/map", label: "Literary Map", icon: Map },
];

const MOBILE_TABS = NAV_ITEMS.slice(0, 5);

export default function AppShell() {
  const { user, signOut, pushToast } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;

    async function fetchUnread() {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("read", false);
      setUnreadCount(count ?? 0);
    }

    fetchUnread();

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => setUnreadCount((prev) => prev + 1)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    pushToast("Signed out.", "info");
    navigate("/");
  };

  const avatarContent = user?.avatar ? (
    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
  ) : (
    <span className="text-sm font-medium text-ink-200">
      {user?.name?.charAt(0).toUpperCase() ?? "U"}
    </span>
  );

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/90 backdrop-blur-md">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-ink-200 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/feed" className="flex items-center gap-2">
            <span className="font-serif text-xl font-semibold text-ink-100">InkReal</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative ml-auto hidden flex-1 max-w-md md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, creators, communities..."
              className="w-full rounded-full border border-ink-800 bg-ink-900 py-2 pl-10 pr-4 text-sm text-ink-100 placeholder-ink-500 focus:border-accent-400 focus:outline-none"
            />
          </form>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-100"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-400 px-1 text-[10px] font-bold text-ink-950">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-ink-800 bg-ink-800"
            >
              {avatarContent}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div className="border-b border-ink-800 px-4 py-3 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-full border border-ink-800 bg-ink-900 py-2 pl-10 pr-4 text-sm text-ink-100 placeholder-ink-500 focus:border-accent-400 focus:outline-none"
          />
        </form>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 flex-shrink-0 border-r border-ink-800 bg-ink-950 lg:block">
          <nav className="flex flex-col gap-1 p-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-accent-400/10 text-accent-300"
                        : "text-ink-300 hover:bg-ink-800 hover:text-ink-100"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Mobile slide-out menu */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-72 border-r border-ink-800 bg-ink-950 lg:hidden">
              <div className="flex items-center justify-between border-b border-ink-800 px-4 py-4">
                <span className="font-serif text-lg font-semibold text-ink-100">InkReal</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-ink-300">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-accent-400/10 text-accent-300"
                            : "text-ink-300 hover:bg-ink-800 hover:text-ink-100"
                        }`
                      }
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  );
                })}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </nav>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="min-h-[calc(100vh-4rem)] flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-ink-800 bg-ink-950/95 backdrop-blur-md lg:hidden">
        {MOBILE_TABS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  isActive ? "text-accent-300" : "text-ink-400"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
