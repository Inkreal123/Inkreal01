import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { Loader2, Plus, Save, Trash2, Maximize2, Minimize2, Sparkles } from "lucide-react";

interface DraftRow {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  template: string | null;
  word_count: number;
  status: string | null;
  created_at: string;
  updated_at: string;
}

const DB_NAME = "inkreal-drafts";
const STORE_NAME = "drafts";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(draft: Record<string, unknown>) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(draft);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGetAll(): Promise<Record<string, unknown>[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function WritingStudioPage() {
  const { user } = useApp();
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [activeDraft, setActiveDraft] = useState<DraftRow | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDrafts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_drafts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setDrafts((data ?? []) as DraftRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadDrafts();
    idbGetAll().then((offline) => {
      if (offline.length > 0 && navigator.onLine) {
        offline.forEach(async (doc) => {
          if (doc.sync_status === "pending" && user) {
            await supabase.from("user_drafts").upsert({
              id: doc.id,
              user_id: user.id,
              title: doc.title,
              content: doc.content,
              word_count: countWords((doc.content as string) || ""),
            });
            await idbPut({ ...doc, sync_status: "synced" });
          }
        });
      }
    });
  }, [loadDrafts, user]);

  async function createDraft() {
    if (!user) return;
    const { data } = await supabase
      .from("user_drafts")
      .insert({ user_id: user.id, title: "Untitled", content: "", word_count: 0, status: "draft" })
      .select("*")
      .single();
    if (data) {
      const newDraft = data as DraftRow;
      setDrafts((d) => [newDraft, ...d]);
      setActiveDraft(newDraft);
      setTitle(newDraft.title ?? "");
      setContent(newDraft.content ?? "");
    }
  }

  function selectDraft(d: DraftRow) {
    setActiveDraft(d);
    setTitle(d.title ?? "");
    setContent(d.content ?? "");
  }

  const autoSave = useCallback(async () => {
    if (!user || !activeDraft) return;
    setSaving(true);
    const wc = countWords(content);
    const { data } = await supabase
      .from("user_drafts")
      .update({ title, content, word_count: wc, updated_at: new Date().toISOString() })
      .eq("id", activeDraft.id)
      .select("*")
      .single();
    const updated = data as DraftRow | null;
    if (updated) {
      setActiveDraft(updated);
      setDrafts((d) => d.map((x) => (x.id === updated.id ? updated : x)));
      await idbPut({ id: updated.id, title, content, sync_status: "synced" });
    }
    setLastSaved(new Date().toLocaleTimeString());
    setSaving(false);
  }, [user, activeDraft, title, content]);

  useEffect(() => {
    if (!activeDraft || !content) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autoSave(), 5000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [title, content, activeDraft, autoSave]);

  async function deleteDraft(id: string) {
    await supabase.from("user_drafts").delete().eq("id", id);
    setDrafts((d) => d.filter((x) => x.id !== id));
    if (activeDraft?.id === id) {
      setActiveDraft(null);
      setTitle("");
      setContent("");
    }
  }

  const wordCount = countWords(content);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-accent-400" />
      </div>
    );
  }

  return (
    <div className={focusMode ? "fixed inset-0 bg-ink-950 z-50 overflow-auto" : "max-w-5xl mx-auto px-4 py-6"}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-serif font-bold">Writing Studio</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-500">
            <Sparkles className="h-3 w-3" />
            <span>AI writing assistant coming soon</span>
          </div>
          <button
            onClick={() => setFocusMode(!focusMode)}
            className="text-ink-400 hover:text-accent-400 transition"
          >
            {focusMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={`grid ${focusMode ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"} gap-4`}>
        {!focusMode && (
          <div className="space-y-2">
            <button
              onClick={createDraft}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-ink-800 bg-ink-900 px-4 py-2 text-ink-100 hover:border-accent-400 hover:text-accent-400 transition"
            >
              <Plus className="h-4 w-4" /> New Draft
            </button>
            {drafts.length === 0 ? (
              <p className="text-ink-500 text-center py-8 text-sm">No drafts yet.</p>
            ) : (
              drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => selectDraft(d)}
                  className={`cursor-pointer border rounded-lg p-3 transition ${
                    activeDraft?.id === d.id ? "border-accent-400 bg-ink-900" : "border-ink-800 bg-ink-900/50 hover:border-ink-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-100 truncate">{d.title || "Untitled"}</p>
                      <p className="text-xs text-ink-500">{d.word_count} words</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteDraft(d.id); }}
                      className="text-ink-500 hover:text-red-400 transition flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className={focusMode ? "col-span-1" : "md:col-span-2"}>
          {activeDraft ? (
            <div className="border border-ink-800 rounded-xl bg-ink-900/50 p-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full bg-transparent text-xl font-serif font-bold text-ink-100 placeholder-ink-600 outline-none mb-3"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Begin writing…"
                className="w-full bg-transparent text-ink-200 placeholder-ink-600 resize-none outline-none min-h-[400px] leading-relaxed"
              />
              <div className="flex items-center justify-between border-t border-ink-800 pt-3 mt-3">
                <span className="text-sm text-ink-500">{wordCount} words</span>
                <div className="flex items-center gap-2">
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin text-accent-400" />
                  ) : lastSaved ? (
                    <span className="text-xs text-ink-500">Saved at {lastSaved}</span>
                  ) : null}
                  <button
                    onClick={autoSave}
                    className="flex items-center gap-1.5 rounded-lg border border-ink-800 px-3 py-1.5 text-sm text-ink-100 hover:border-accent-400 transition"
                  >
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 border border-ink-800 rounded-xl">
              <p className="text-ink-400 text-lg">No drafts yet.</p>
              <p className="text-ink-500 text-sm mt-1">Create a new draft to start writing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
