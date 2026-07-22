import { useState, useEffect, KeyboardEvent } from "react";
import { MessageSquare, Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";

interface PostComment {
  id: string;
  user_id: string;
  post_id: string;
  post_table: string;
  content: string;
  author_name: string | null;
  author_avatar: string | null;
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
  postTable?: string;
}

export default function CommentSection({ postId, postTable = "user_posts" }: CommentSectionProps) {
  const { user, pushToast } = useApp();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Load comments
  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      setLoading(true);
      const { data, error } = await supabase
        .from("post_comments")
        .select("id, user_id, post_id, post_table, content, author_name, author_avatar, created_at")
        .eq("post_id", postId)
        .eq("post_table", postTable)
        .order("created_at", { ascending: true });

      if (!cancelled) {
        if (error) {
          console.error("Failed to load comments:", error.message);
        } else {
          setComments(data ?? []);
        }
        setLoading(false);
      }
    }

    loadComments();

    // Realtime subscription
    const channel = supabase
      .channel(`post_comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const newComment = payload.new as PostComment;
          setComments((prev) =>
            prev.some((c) => c.id === newComment.id) ? prev : [...prev, newComment]
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setComments((prev) => prev.filter((c) => c.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [postId, postTable]);

  const handleSubmit = async (): Promise<void> => {
    if (!user) {
      pushToast("Please sign in to comment.", "error");
      return;
    }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          user_id: user.id,
          post_id: postId,
          post_table: postTable,
          content: content.trim(),
          author_name: user.name,
          author_avatar: user.avatar || null,
        })
        .select("id, user_id, post_id, post_table, content, author_name, author_avatar, created_at")
        .single();

      if (error) throw error;

      if (data) {
        setComments((prev) =>
          prev.some((c) => c.id === data.id) ? prev : [...prev, data]
        );
      }
      setContent("");
      pushToast("Comment posted.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to post comment.";
      pushToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const visibleComments = expanded ? comments : comments.slice(-3);

  return (
    <div className="border-t border-ink-800 pt-4">
      {/* Header */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="mb-3 flex items-center gap-2 text-sm text-ink-300 transition-colors hover:text-ink-100"
      >
        <MessageSquare className="h-4 w-4" />
        <span>
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
        {comments.length > 3 &&
          (expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          ))}
      </button>

      {/* Comments list */}
      {loading ? (
        <div className="flex items-center gap-2 py-3 text-sm text-ink-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading comments...
        </div>
      ) : visibleComments.length === 0 ? (
        <p className="py-3 text-sm text-ink-500">No comments yet. Be the first to respond.</p>
      ) : (
        <div className="mb-3 space-y-3">
          {visibleComments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-800">
                {comment.author_avatar ? (
                  <img
                    src={comment.author_avatar}
                    alt={comment.author_name ?? "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-ink-300">
                    {(comment.author_name ?? "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink-100">
                    {comment.author_name ?? "Anonymous"}
                  </span>
                  <span className="text-xs text-ink-500">
                    {new Date(comment.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-ink-200">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      {user && (
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-ink-800 bg-ink-950 px-4 py-2 text-sm text-ink-100 placeholder-ink-500 focus:border-accent-400 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="flex items-center justify-center rounded-xl bg-accent-400 px-4 py-2 text-ink-950 transition-colors hover:bg-accent-500 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
