import { useState, KeyboardEvent } from "react";
import { Type, Feather, ImageIcon, Headphones, Video, Send, Loader2, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";

type PostType = "text" | "poem" | "image" | "audio" | "video";

interface PostTypeOption {
  id: PostType;
  label: string;
  icon: typeof Type;
}

const POST_TYPES: PostTypeOption[] = [
  { id: "text", label: "Text", icon: Type },
  { id: "poem", label: "Poem", icon: Feather },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "video", label: "Video", icon: Video },
];

export default function PostComposer() {
  const { user, pushToast } = useApp();
  const [postType, setPostType] = useState<PostType>("text");
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddTag = (): void => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 8) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string): void => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const needsMedia = postType === "image" || postType === "audio" || postType === "video";

  const handleSubmit = async (): Promise<void> => {
    if (!user) {
      pushToast("Please sign in to post.", "error");
      return;
    }
    if (!body.trim() && !mediaUrl.trim()) {
      pushToast("Write something or add a media URL.", "error");
      return;
    }
    if (needsMedia && !mediaUrl.trim()) {
      pushToast(`Please add a media URL for ${postType} posts.`, "error");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("user_posts").insert({
        user_id: user.id,
        type: postType,
        body: body.trim() || null,
        media: mediaUrl.trim() || null,
        tags: tags.length > 0 ? tags : null,
        likes_count: 0,
        comments_count: 0,
        reposts_count: 0,
      });

      if (error) throw error;

      pushToast("Your post is live.", "success");
      setBody("");
      setMediaUrl("");
      setTags([]);
      setTagInput("");
      setPostType("text");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish post.";
      pushToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/50 p-5">
      {/* Post type selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {POST_TYPES.map((opt) => {
          const Icon = opt.icon;
          const active = postType === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setPostType(opt.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent-400 text-ink-950"
                  : "bg-ink-800 text-ink-300 hover:bg-ink-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          postType === "poem"
            ? "Write your poem..."
            : postType === "text"
            ? "Share your thoughts..."
            : "Add a caption..."
        }
        rows={postType === "poem" ? 8 : 4}
        className="mb-3 w-full resize-none rounded-xl border border-ink-800 bg-ink-950 px-4 py-3 text-ink-100 placeholder-ink-500 focus:border-accent-400 focus:outline-none"
      />

      {/* Media URL */}
      {needsMedia && (
        <input
          type="url"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder={`${postType} URL (https://...)`}
          className="mb-3 w-full rounded-xl border border-ink-800 bg-ink-950 px-4 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-accent-400 focus:outline-none"
        />
      )}

      {/* Tags */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add a tag and press Enter..."
            className="flex-1 rounded-xl border border-ink-800 bg-ink-950 px-4 py-2 text-sm text-ink-100 placeholder-ink-500 focus:border-accent-400 focus:outline-none"
          />
          <button
            onClick={handleAddTag}
            className="rounded-xl bg-ink-800 px-4 py-2 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-700"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-accent-400/10 px-3 py-1 text-xs text-accent-300"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-ink-400 hover:text-ink-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-400 px-6 py-3 font-medium text-ink-950 transition-colors hover:bg-accent-500 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Publishing...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Publish
          </>
        )}
      </button>
    </div>
  );
}
