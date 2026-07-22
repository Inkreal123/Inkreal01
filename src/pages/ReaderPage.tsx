import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2, ChevronLeft, ChevronRight, Type, Sun, Moon, Highlighter } from "lucide-react";

interface BookData {
  id: string;
  title: string;
  author_name: string | null;
  cover: string | null;
  description: string | null;
}

interface ChapterRow {
  id: string;
  book_id: string;
  title: string;
  content: string;
  chapter_order: number;
  word_count: number;
}

export default function ReaderPage() {
  const { bookId } = useParams();
  const [book, setBook] = useState<BookData | null>(null);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [darkMode, setDarkMode] = useState(true);
  const [highlights, setHighlights] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    if (!bookId) { setLoading(false); return; }
    const [bookRes, chaptersRes] = await Promise.all([
      supabase.from("books").select("id, title, author_name, cover, description").eq("id", bookId).maybeSingle(),
      supabase.from("chapters").select("*").eq("book_id", bookId).order("chapter_order", { ascending: true }),
    ]);
    setBook(bookRes.data as BookData | null);
    setChapters((chaptersRes.data ?? []) as ChapterRow[]);
    const stored = localStorage.getItem(`highlights:${bookId}`);
    if (stored) setHighlights(JSON.parse(stored));
    setLoading(false);
  }, [bookId]);

  useEffect(() => { loadData(); }, [loadData]);

  function saveHighlight() {
    const selection = window.getSelection()?.toString();
    if (!selection || !bookId) return;
    const updated = [...highlights, selection];
    setHighlights(updated);
    localStorage.setItem(`highlights:${bookId}`, JSON.stringify(updated));
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-400" /></div>;
  }

  if (!book) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-ink-400 text-xl">Book not found.</p>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-ink-400 text-xl">No chapters available.</p>
        <p className="text-ink-500 text-sm mt-1">"{book.title}" has no content yet.</p>
      </div>
    );
  }

  const chapter = chapters[currentChapter];
  const bgClass = darkMode ? "bg-ink-950 text-ink-100" : "bg-ink-50 text-ink-900";
  const borderClass = darkMode ? "border-ink-800" : "border-ink-200";
  const mutedClass = darkMode ? "text-ink-500" : "text-ink-500";

  return (
    <div className={`min-h-screen ${bgClass} transition-colors`}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-6`}>
          <div>
            <h1 className="font-serif font-bold text-lg">{book.title}</h1>
            <p className={`text-sm ${mutedClass}`}>{book.author_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFontSize((f) => Math.max(12, f - 2))} className={`p-2 rounded-lg border ${borderClass} hover:border-accent-400 transition`}>
              <Type className="h-4 w-4" />
            </button>
            <button onClick={() => setFontSize((f) => Math.min(28, f + 2))} className={`px-2 py-1 rounded-lg border ${borderClass} text-sm hover:border-accent-400 transition`}>
              A+
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg border ${borderClass} hover:border-accent-400 transition`}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={saveHighlight} className={`p-2 rounded-lg border ${borderClass} hover:border-accent-400 transition`}>
              <Highlighter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chapter content */}
        <div>
          <h2 className="font-serif text-xl mb-4">Chapter {chapter.chapter_order}: {chapter.title}</h2>
          <div
            className="whitespace-pre-wrap leading-relaxed"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          >
            {chapter.content}
          </div>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className={`mt-8 border-t ${borderClass} pt-4`}>
            <h3 className={`text-sm font-medium ${mutedClass} mb-2`}>Your Highlights</h3>
            {highlights.map((h, i) => (
              <p key={i} className="text-sm italic border-l-2 border-accent-400/50 pl-3 mb-2 opacity-80">"{h}"</p>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className={`flex items-center justify-between border-t ${borderClass} pt-4 mt-8`}>
          <button
            onClick={() => setCurrentChapter((c) => Math.max(0, c - 1))}
            disabled={currentChapter === 0}
            className={`flex items-center gap-1 rounded-lg border ${borderClass} px-3 py-2 text-sm hover:border-accent-400 transition disabled:opacity-30`}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className={`text-sm ${mutedClass}`}>
            {currentChapter + 1} / {chapters.length}
          </span>
          <button
            onClick={() => setCurrentChapter((c) => Math.min(chapters.length - 1, c + 1))}
            disabled={currentChapter === chapters.length - 1}
            className={`flex items-center gap-1 rounded-lg border ${borderClass} px-3 py-2 text-sm hover:border-accent-400 transition disabled:opacity-30`}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
