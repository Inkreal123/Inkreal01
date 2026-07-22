import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { Loader2, Send, MessageSquare } from "lucide-react";

interface ConversationWithParticipants {
  id: string;
  created_at: string;
  otherUserId?: string | null;
  otherName?: string | null;
  otherAvatar?: string | null;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function MessagingPage() {
  const { user } = useApp();
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationWithParticipants | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, conversations:conversation_id ( id, created_at )")
      .eq("user_id", user.id);

    const convos = (participants ?? []) as unknown as { conversation_id: string; conversations: { id: string; created_at: string } | { id: string; created_at: string }[] }[];
    const uniqueConvos: ConversationWithParticipants[] = [];
    for (const p of convos) {
      const conv = Array.isArray(p.conversations) ? p.conversations[0] : p.conversations;
      const { data: others } = await supabase
        .from("conversation_participants")
        .select("user_id, profiles:user_id ( name, avatar )")
        .eq("conversation_id", p.conversation_id)
        .neq("user_id", user.id)
        .limit(1);
      const other = (others ?? [])[0] as { user_id: string; profiles: { name: string | null; avatar: string | null } | { name: string | null; avatar: string | null }[] } | undefined;
      const otherProfile = other ? (Array.isArray(other.profiles) ? other.profiles[0] : other.profiles) : null;
      uniqueConvos.push({
        id: conv.id,
        created_at: conv.created_at,
        otherUserId: other?.user_id ?? null,
        otherName: otherProfile?.name ?? null,
        otherAvatar: otherProfile?.avatar ?? null,
      });
    }
    setConversations(uniqueConvos);
    setLoading(false);
  }, [user]);

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as MessageRow[]);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.id);
      const channel = supabase
        .channel(`messages:${activeConv.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConv.id}` }, () => loadMessages(activeConv.id))
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [activeConv, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!user || !activeConv || !content.trim()) return;
    setSending(true);
    try {
      await supabase.from("messages").insert({
        conversation_id: activeConv.id,
        sender_id: user.id,
        content: content.trim(),
      });
      setContent("");
      loadMessages(activeConv.id);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-400" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-serif font-bold mb-4">Messages</h1>
      {conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-12 w-12 text-ink-700 mx-auto mb-3" />
          <p className="text-ink-400 text-lg">No conversations yet.</p>
          <p className="text-ink-500 text-sm mt-1">Start a conversation from a creator's profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
          {/* Conversation list */}
          <div className="md:col-span-1 space-y-2 overflow-y-auto border border-ink-800 rounded-xl p-3 bg-ink-900/50">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConv(c)}
                className={`cursor-pointer rounded-lg p-3 transition ${
                  activeConv?.id === c.id ? "bg-accent-400/10 border border-accent-400/40" : "hover:bg-ink-800/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-ink-800 overflow-hidden flex-shrink-0">
                    {c.otherAvatar ? <img src={c.otherAvatar} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-100 truncate">{c.otherName || "Unknown"}</p>
                    <p className="text-xs text-ink-500">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message area */}
          <div className="md:col-span-2 flex flex-col border border-ink-800 rounded-xl bg-ink-900/50">
            {activeConv ? (
              <>
                <div className="border-b border-ink-800 p-3">
                  <p className="font-medium text-ink-100">{activeConv.otherName || "Conversation"}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-ink-500 text-sm text-center py-8">No messages yet. Say hello!</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          m.sender_id === user?.id
                            ? "bg-accent-400 text-ink-950"
                            : "bg-ink-800 text-ink-100"
                        }`}>
                          <p className="text-sm">{m.content}</p>
                          <p className={`text-xs mt-0.5 ${m.sender_id === user?.id ? "text-ink-700" : "text-ink-500"}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-ink-800 p-3 flex gap-2">
                  <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="Type a message…"
                    className="flex-1 rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 placeholder-ink-500 outline-none focus:border-accent-400"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!content.trim() || sending}
                    className="rounded-lg bg-accent-400 p-2.5 text-ink-950 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-ink-500">
                <p>Select a conversation</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
