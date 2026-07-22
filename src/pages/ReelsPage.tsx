import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { Loader2, Heart, MessageCircle, Play, Video } from "lucide-react";

interface VideoPost {
  id: string;
  user_id: string;
  type: string | null;
  body: string | null;
  media: string | null;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_name?: string | null;
  author_handle?: string | null;
  author_avatar?: string | null;
}

function ReelCard({ post, userId, userName }: { post: VideoPost; userId: string | undefined; userName: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{ id: string; content: string; author_name: string | null }[]>([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    setLikeCount(post.likes_count);
    if (userId) {
      supabase.from("likes").select("id").eq("user_id", userId).eq("post_id", post.id).maybeSingle()
        .then(({ data }) => setLiked(!!data));
    }
  }, [post.id, post.likes_count, userId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            video.play().catch(() => {});
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: [0.6] }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) { video.pause(); } else { video.play().catch(() => {}); }
    setIsPlaying(!isPlaying);
  }

  async function toggleLike() {
    if (!userId) return;
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", userId).eq("post_id", post.id);
      setLiked(false); setLikeCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("likes").insert({ user_id: userId, post_id: post.id });
      setLiked(true); setLikeCount((c) => c + 1);
    }
  }

  async function loadComments() {
    const { data } = await supabase
      .from("post_comments")
      .select("id, content, author_name")
      .eq("post_id", post.id)
      .eq("post_table", "user_posts")
      .order("created_at", { ascending: true });
    setComments((data ?? []) as { id: string; content: string; author_name: string | null }[]);
  }

  async function submitComment() {
    if (!commentText.trim() || !userId) return;
    await supabase.from("post_comments").insert({
      post_id: post.id,
      post_table: "user_posts",
      user_id: userId,
      content: commentText.trim(),
      author_name: userName,
    });
    setCommentText("");
    loadComments();
  }

  return (
    <div className="relative h-screen w-full flex items-center justify-center snap-start bg-ink-950 overflow-hidden">
      {post.media ? (
        <video
          ref={videoRef}
          src={post.media}
          loop
          playsInline
          className="h-full w-full object-cover"
          onClick={togglePlay}
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-ink-900">
          <Video className="h-16 w-16 text-ink-700" />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-ink-950/40 pointer-events-none" />

      {/* Play/Pause indicator */}
      <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {!isPlaying && <Play className="h-16 w-16 text-white/70" />}
      </button>

      {/* Info */}
      <div className="absolute bottom-20 left-4 right-16 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-9 w-9 rounded-full bg-ink-800 overflow-hidden">
            {post.author_avatar ? <img src={post.author_avatar} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{post.author_name || "Anonymous"}</p>
            <p className="text-xs text-white/60">@{post.author_handle}</p>
          </div>
        </div>
        {post.body && <p className="text-sm text-white/90">{post.body}</p>}
      </div>

      {/* Actions */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-4 items-center">
        <button onClick={toggleLike} className="flex flex-col items-center gap-1">
          <div className="bg-ink-900/60 rounded-full p-2.5">
            <Heart className={`h-6 w-6 ${liked ? "fill-accent-400 text-accent-400" : "text-white"}`} />
          </div>
          <span className="text-xs text-white">{likeCount}</span>
        </button>
        <button onClick={() => { setShowComments(!showComments); if (!showComments) loadComments(); }} className="flex flex-col items-center gap-1">
          <div className="bg-ink-900/60 rounded-full p-2.5">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs text-white">{post.comments_count}</span>
        </button>
      </div>

      {/* Comments panel */}
      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 bg-ink-900/95 border-t border-ink-800 rounded-t-2xl p-4 max-h-[40vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-ink-100">Comments</h3>
            <button onClick={() => setShowComments(false)} className="text-ink-500 text-sm">Close</button>
          </div>
          {comments.length === 0 ? (
            <p className="text-sm text-ink-500 text-center py-4">No comments yet.</p>
          ) : (
            <div className="space-y-2 mb-3">
              {comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="font-medium text-ink-200">{c.author_name || "Anonymous"}</span>
                  <span className="text-ink-300 ml-2">{c.content}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-ink-100 outline-none focus:border-accent-400"
            />
            <button onClick={submitComment} disabled={!commentText.trim()} className="rounded-lg bg-accent-400 px-3 py-2 text-sm text-ink-950 disabled:opacity-50">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReelsPage() {
  const { user } = useApp();
  const [reels, setReels] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReels = useCallback(async () => {
    const { data } = await supabase
      .from("user_posts")
      .select(`
        id, user_id, type, body, media, tags, likes_count, comments_count, created_at,
        profiles!user_posts_user_id_fkey ( name, handle, avatar )
      `)
      .eq("type", "video")
      .order("created_at", { ascending: false })
      .limit(30);

    const mapped: VideoPost[] = (data ?? []).map((p: Record<string, unknown>) => {
      const profile = p.profiles as { name: string | null; handle: string | null; avatar: string | null } | null;
      return {
        id: p.id as string,
        user_id: p.user_id as string,
        type: p.type as string | null,
        body: p.body as string | null,
        media: p.media as string | null,
        tags: p.tags as string[] | null,
        likes_count: p.likes_count as number,
        comments_count: p.comments_count as number,
        created_at: p.created_at as string,
        author_name: profile?.name ?? null,
        author_handle: profile?.handle ?? null,
        author_avatar: profile?.avatar ?? null,
      };
    });
    setReels(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { loadReels(); }, [loadReels]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-400" /></div>;
  }

  if (reels.length === 0) {
    return (
      <div className="text-center py-20">
        <Video className="h-12 w-12 text-ink-700 mx-auto mb-3" />
        <p className="text-ink-400 text-lg">No video reels yet.</p>
        <p className="text-ink-500 text-sm mt-1">Upload a video post to see it here.</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-ink-950">
      {reels.map((r) => <ReelCard key={r.id} post={r} userId={user?.id} userName={user?.name ?? "Anonymous"} />)}
    </div>
  );
}
