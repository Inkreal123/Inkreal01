import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { ACHIEVEMENTS, CREATIVE_ACHIEVEMENTS } from "../lib/data";
import { Loader2, Edit3, Check, X, Award, BookOpen, Users, Calendar, Sparkles } from "lucide-react";

interface BadgeRow {
  id: string;
  badge_id: string;
  awarded_at: string;
  badges: { id: string; name: string; description: string | null; tier: string | null; icon: string | null } | null;
}

interface ProfileData {
  name: string | null;
  handle: string | null;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  motto: string | null;
  country: string | null;
  pen_name: string | null;
  role: string | null;
}

export default function ProfilePage() {
  const { user } = useApp();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData | null>(null);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0, books: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [profileRes, badgesRes, postsRes, followersRes, followingRes, booksRes] = await Promise.all([
      supabase.from("profiles").select("name, handle, avatar, banner, bio, motto, country, pen_name, role").eq("id", user.id).maybeSingle(),
      supabase.from("user_badges").select("id, badge_id, awarded_at, badges:user_badges_badge_id_fkey(id, name, description, tier, icon)").eq("user_id", user.id),
      supabase.from("user_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", user.id),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", user.id),
      supabase.from("books").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    setProfile(profileRes.data as ProfileData | null);
    setEditForm(profileRes.data as ProfileData | null);
    setBadges((badgesRes.data ?? []) as unknown as BadgeRow[]);
    setStats({
      posts: postsRes.count ?? 0,
      followers: followersRes.count ?? 0,
      following: followingRes.count ?? 0,
      books: booksRes.count ?? 0,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveProfile() {
    if (!user || !editForm) return;
    await supabase.from("profiles").update({
      name: editForm.name,
      handle: editForm.handle,
      bio: editForm.bio,
      motto: editForm.motto,
      country: editForm.country,
      pen_name: editForm.pen_name,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    setProfile(editForm);
    setEditing(false);
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-400" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Profile header */}
      <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-900/50">
        {profile?.banner ? (
          <div className="h-32 bg-ink-800 overflow-hidden">
            <img src={profile.banner} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-r from-ink-900 to-ink-800" />
        )}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 -mt-12">
              <div className="h-20 w-20 rounded-full bg-ink-800 border-4 border-ink-900 overflow-hidden">
                {profile?.avatar ? <img src={profile.avatar} alt="" className="h-full w-full object-cover" /> : null}
              </div>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={saveProfile} className="rounded-lg bg-accent-400 p-2 text-ink-950"><Check className="h-4 w-4" /></button>
                <button onClick={() => { setEditForm(profile); setEditing(false); }} className="rounded-lg border border-ink-800 p-2 text-ink-400"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="rounded-lg border border-ink-800 p-2 text-ink-400 hover:text-accent-400 transition">
                <Edit3 className="h-4 w-4" />
              </button>
            )}
          </div>

          {editing && editForm ? (
            <div className="mt-3 space-y-2">
              <input value={editForm.name ?? ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" className="w-full rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 outline-none focus:border-accent-400" />
              <input value={editForm.handle ?? ""} onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })} placeholder="Handle" className="w-full rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 outline-none focus:border-accent-400" />
              <input value={editForm.pen_name ?? ""} onChange={(e) => setEditForm({ ...editForm, pen_name: e.target.value })} placeholder="Pen Name" className="w-full rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 outline-none focus:border-accent-400" />
              <input value={editForm.country ?? ""} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} placeholder="Country" className="w-full rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 outline-none focus:border-accent-400" />
              <textarea value={editForm.bio ?? ""} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Bio" className="w-full rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 outline-none focus:border-accent-400 resize-none" rows={3} />
              <input value={editForm.motto ?? ""} onChange={(e) => setEditForm({ ...editForm, motto: e.target.value })} placeholder="Motto" className="w-full rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 outline-none focus:border-accent-400" />
            </div>
          ) : (
            <div className="mt-3">
              <h2 className="text-xl font-serif font-bold">{profile?.name || user?.name || "Creator"}</h2>
              <p className="text-sm text-ink-500">@{profile?.handle} · {profile?.pen_name && `Pen: ${profile.pen_name}`}</p>
              {profile?.motto && <p className="text-sm text-accent-400 italic mt-1">"{profile.motto}"</p>}
              {profile?.bio && <p className="text-sm text-ink-300 mt-2">{profile.bio}</p>}
              {profile?.country && <p className="text-xs text-ink-500 mt-1">📍 {profile.country}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Posts", value: stats.posts, icon: BookOpen },
          { label: "Books", value: stats.books, icon: BookOpen },
          { label: "Followers", value: stats.followers, icon: Users },
          { label: "Following", value: stats.following, icon: Users },
        ].map((s) => (
          <div key={s.label} className="border border-ink-800 rounded-lg p-3 text-center bg-ink-900/50">
            <s.icon className="h-4 w-4 text-accent-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <section>
        <h3 className="text-lg font-serif font-semibold mb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-accent-400" /> Badges
        </h3>
        {badges.length === 0 ? (
          <p className="text-ink-500 text-sm">No badges earned yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.id} className="border border-ink-800 rounded-lg p-3 bg-ink-900/50">
                <p className="text-sm font-medium text-ink-100">{b.badges?.name ?? "Badge"}</p>
                <p className="text-xs text-ink-500">{b.badges?.description}</p>
                {b.badges?.tier && <span className="text-xs text-accent-400">{b.badges.tier}</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Memory Timeline */}
      <section>
        <h3 className="text-lg font-serif font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-accent-400" /> Memory Timeline
        </h3>
        <div className="space-y-3">
          {badges.length === 0 ? (
            <p className="text-ink-500 text-sm">Your milestones will appear here.</p>
          ) : (
            badges.slice().reverse().map((b) => (
              <div key={b.id} className="flex gap-3 border-l-2 border-accent-400/50 pl-3">
                <div>
                  <p className="text-sm text-ink-100">{b.badges?.name ?? "Milestone"}</p>
                  <p className="text-xs text-ink-500">{new Date(b.awarded_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Creative Achievements Grid */}
      <section>
        <h3 className="text-lg font-serif font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-400" /> Creative Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CREATIVE_ACHIEVEMENTS.map((a) => {
            const earned = badges.some((b) => b.badge_id === a.id);
            return (
              <div key={a.id} className={`border rounded-lg p-3 transition ${earned ? "border-accent-400 bg-accent-400/10" : "border-ink-800 bg-ink-900/30 opacity-50"}`}>
                <p className="text-sm font-medium text-ink-100">{a.label}</p>
                <p className="text-xs text-ink-500">{a.desc}</p>
                {earned && <span className="text-xs text-accent-400">✓ Earned</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Achievements */}
      <section>
        <h3 className="text-lg font-serif font-semibold mb-3">Achievements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const earned = badges.some((b) => b.badge_id === a.id);
            return (
              <div key={a.id} className={`border rounded-lg p-3 ${earned ? "border-accent-400 bg-accent-400/10" : "border-ink-800 bg-ink-900/30 opacity-50"}`}>
                <p className="text-sm font-medium text-ink-100">{a.label}</p>
                <p className="text-xs text-ink-500">{a.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Creator Identity */}
      <section>
        <h3 className="text-lg font-serif font-semibold mb-3">Creator Identity</h3>
        <div className="border border-ink-800 rounded-xl p-4 bg-ink-900/50 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink-500">Role</span>
            <span className="text-ink-100 capitalize">{profile?.role || user?.role || "reader"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-500">Pen Name</span>
            <span className="text-ink-100">{profile?.pen_name || "Not set"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-500">Country</span>
            <span className="text-ink-100">{profile?.country || "Not set"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-500">Joined</span>
            <span className="text-ink-100">{new Date(user?.joinedAt ?? Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
