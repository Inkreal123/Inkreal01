import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from "lucide-react";

interface AudioTrack {
  id: string;
  title: string;
  creator: string | null;
  duration: string | null;
  type: string | null;
  region: string | null;
  plays: number;
  cover: string | null;
}

export default function AudioPlayerPage() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const loadTracks = useCallback(async () => {
    const { data } = await supabase
      .from("audio_tracks")
      .select("*")
      .order("plays", { ascending: false })
      .limit(50);
    setTracks((data ?? []) as AudioTrack[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadTracks(); }, [loadTracks]);

  const currentTrack = tracks[currentIdx];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => { setIsPlaying(false); setCurrentIdx((i) => (i + 1) % tracks.length); };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack, tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    audio.playbackRate = playbackRate;
  }, [volume, muted, playbackRate]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); } else { audio.play().catch(() => {}); }
    setIsPlaying(!isPlaying);
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }

  function nextTrack() {
    setCurrentIdx((i) => (i + 1) % tracks.length);
    setIsPlaying(false);
  }

  function prevTrack() {
    setCurrentIdx((i) => (i - 1 + tracks.length) % tracks.length);
    setIsPlaying(false);
  }

  function formatTime(sec: number): string {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-serif font-bold">Audio Player</h1>

      <audio ref={audioRef} />

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent-400" /></div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-16">
          <Music className="h-12 w-12 text-ink-700 mx-auto mb-3" />
          <p className="text-ink-400 text-lg">No audio tracks available yet.</p>
          <p className="text-ink-500 text-sm mt-1">Check back soon for new content.</p>
        </div>
      ) : (
        <>
          {/* Player */}
          {currentTrack && (
            <div className="border border-ink-800 rounded-xl p-6 bg-ink-900/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-20 w-20 rounded-lg bg-ink-800 overflow-hidden flex-shrink-0">
                  {currentTrack.cover ? <img src={currentTrack.cover} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-lg text-ink-100 truncate">{currentTrack.title}</h3>
                  <p className="text-sm text-ink-500">{currentTrack.creator || "Unknown"}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{currentTrack.plays} plays</p>
                </div>
              </div>

              {/* Seek bar */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-ink-500 w-10">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="flex-1 accent-accent-400"
                />
                <span className="text-xs text-ink-500 w-10">{formatTime(duration)}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button onClick={prevTrack} className="text-ink-400 hover:text-accent-400 transition">
                  <SkipBack className="h-5 w-5" />
                </button>
                <button onClick={togglePlay} className="bg-accent-400 text-ink-950 rounded-full p-3 hover:bg-accent-300 transition">
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                <button onClick={nextTrack} className="text-ink-400 hover:text-accent-400 transition">
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>

              {/* Volume + Speed */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <button onClick={() => setMuted(!muted)} className="text-ink-400 hover:text-accent-400">
                    {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={muted ? 0 : volume}
                    onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
                    className="flex-1 accent-accent-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-500">Speed</span>
                  <select
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(Number(e.target.value))}
                    className="rounded-lg border border-ink-800 bg-ink-900 px-2 py-1 text-xs text-ink-100 outline-none focus:border-accent-400"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => <option key={r} value={r}>{r}x</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Track list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-ink-200">All Tracks</h3>
            {tracks.map((t, idx) => (
              <div
                key={t.id}
                onClick={() => { setCurrentIdx(idx); setIsPlaying(false); }}
                className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition ${
                  idx === currentIdx ? "bg-accent-400/10 border border-accent-400/40" : "border border-ink-800 bg-ink-900/30 hover:border-ink-700"
                }`}
              >
                <div className="h-10 w-10 rounded bg-ink-800 overflow-hidden flex-shrink-0">
                  {t.cover ? <img src={t.cover} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-100 truncate">{t.title}</p>
                  <p className="text-xs text-ink-500">{t.creator} · {t.duration || "—"}</p>
                </div>
                {idx === currentIdx && isPlaying ? <Pause className="h-4 w-4 text-accent-400" /> : <Play className="h-4 w-4 text-ink-500" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
