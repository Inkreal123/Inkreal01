import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { Loader2, Heart, MessageCircle, Repeat2, Bookmark, Send, Sparkles } from "lucide-react";

interface PostWithProfile {
  id: string;
  user_id: string;
  type: string | null;
  body: string | null;
  media: string | null;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  created_at: string;
  author_name?: string | null;
  author_handle?: string | null;
  author_avatar?: string | null;
}

interface CommentRow {
  id: string;
  user_id: string;
  post_id: string;
  post_table: string;
  content: string;
  author_name: string | null;
  author_avatar: string | null;
  created_at: string;
}

function PostComposer({ onPosted }: { onPosted: () => void }) {
  const { user } = useApp();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!body.trim() || !user) return;
    setSubmitting(true);
    try {
      await supabase.from("user_posts").insert({
        user_id: user.id,
        body: body.trim(),
        type: "text",
        tags: [],
      });
      setBody("");
      onPosted();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-ink-800 rounded-xl p-4 bg-ink-900/50">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share something with the InkReal community…"
        className="w-full bg-transparent text-ink-100 placeholder-ink-500 resize-none outline-none min-h-[80px]"
        maxLength={500}
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-ink-500">{body.length}/500</span>
        <button
          onClick={submit}
          disabled={!body.trim() || submitting}
          className="flex items-center gap-2 rounded-lg bg-accent-400 px-4 py-2 text-ink-950 font-medium transition hover:bg-accent-300 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Post
        </button>
      </div>
    </div>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const { user } = useApp();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .eq("post_table", "user_posts")
      .order("created_at", { ascending: true });
    setComments(data ?? []);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    if (open) loadComments();
  }, [open, loadComments]);

  async function submitComment() {
    if (!content.trim() || !user) return;
    setSubmitting(true);
    try {
      await supabase.from("post_comments").insert({
        post_id: postId,
        post_table: "user_posts",
        user_id: user.id,
        content: content.trim(),
        author_name: user.name,
        author_avatar: user.avatar,
      });
      setContent("");
      loadComments();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-ink-400 hover:text-accent-400 transition"
      >
        {open ? "Hide comments" : "View comments"}
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent-400" />
          ) : comments.length === 0 ? (
            <p className="text-sm text-ink-500">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-ink-800 flex-shrink-0 overflow-hidden">
                  {c.author_avatar ? (
                    <img src={c.author_avatar} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-ink-200">{c.author_name || "Anonymous"}</span>
                  <p className="text-sm text-ink-300">{c.content}</p>
                </div>
              </div>
            ))
          )}
          <div className="flex gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-ink-100 placeholder-ink-500 outline-none focus:border-accent-400"
            />
            <button
              onClick={submitComment}
              disabled={!content.trim() || submitting}
              className="rounded-lg bg-accent-400 px-3 py-2 text-ink-950 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, userId }: { post: PostWithProfile; userId: string | undefined }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);

  useEffect(() => {
    setLikeCount(post.likes_count);
    if (userId) {
      supabase
        .from("likes")
        .select("id")
        .eq("user_id", userId)
        .eq("post_id", post.id)
        .maybeSingle()
        .then(({ data }) => setLiked(!!data));
    }
  }, [post.id, post.likes_count, userId]);

  async function toggleLike() {
    if (!userId) return;
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", userId).eq("post_id", post.id);
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("likes").insert({ user_id: userId, post_id: post.id });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  }

  return (
    <article className="border border-ink-800 rounded-xl p-4 bg-ink-900/50">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-ink-800 overflow-hidden flex-shrink-0">
          {post.author_avatar ? (
            <img src={post.author_avatar} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div>
          <p className="font-medium text-ink-100">{post.author_name || "Anonymous"}</p>
          <p className="text-xs text-ink-500">
            @{post.author_handle || "unknown"} · {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <p className="text-ink-200 whitespace-pre-wrap mb-3">{post.body}</p>
      {post.media ? (
        <div className="rounded-lg overflow-hidden mb-3 border border-ink-800">
          <img src={post.media} alt="" className="w-full max-h-96 object-cover" />
        </div>
      ) : null}
      <div className="flex items-center gap-5 text-ink-400">
        <button onClick={toggleLike} className="flex items-center gap-1.5 hover:text-accent-400 transition">
          <Heart className={`h-4 w-4 ${liked ? "fill-accent-400 text-accent-400" : ""}`} />
          <span className="text-sm">{likeCount}</span>
        </button>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">{post.comments_count}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Repeat2 className="h-4 w-4" />
          <span className="text-sm">{post.reposts_count}</span>
        </div>
        <Bookmark className="h-4 w-4" />
      </div>
      <CommentSection postId={post.id} />
    </article>
  );
}

export default function FeedPage() {
  const { user } = useApp();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    const { data } = await supabase
      .from("user_posts")
      .select(`
        id, user_id, type, body, media, tags, likes_count, comments_count, reposts_count, created_at,
        profiles!user_posts_user_id_fkey ( name, handle, avatar )
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    const mapped: PostWithProfile[] = (data ?? []).map((p: Record<string, unknown>) => {
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
        reposts_count: p.reposts_count as number,
        created_at: p.created_at as string,
        author_name: profile?.name ?? null,
        author_handle: profile?.handle ?? null,
        author_avatar: profile?.avatar ?? null,
      };
    });
    setPosts(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
    const channel = supabase
      .channel("public:user_posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "user_posts" }, () => loadPosts())
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "user_posts" }, () => loadPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadPosts]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold">Feed</h1>
        <div className="flex items-center gap-1.5 text-xs text-ink-500">
          <Sparkles className="h-3 w-3" />
          <span>AI features coming soon</span>
        </div>
      </div>
      <PostComposer onPosted={loadPosts} />
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-400 text-lg">No posts yet.</p>
          <p className="text-ink-500 text-sm mt-1">Be the first to share something.</p>
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} userId={user?.id} />)
      )}
    </div>
  );
}
