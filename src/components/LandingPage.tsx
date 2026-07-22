import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Volume2,
  VolumeX,
  ArrowRight,
  Feather,
  BookOpen,
  Users,
  Headphones,
  ShoppingBag,
  BarChart3,
  PenTool,
  Globe,
  Sparkles,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  MapPin,
  Clock,
} from "lucide-react";
import { greetingForHour, timeOfDayPhase, getCurrentSeason, detectCountry, detectBrowserCurrency, CURRENCIES } from "../lib/regions";
import { MOODS, PULSE_MESSAGES } from "../lib/data";
import { useApp } from "../lib/store";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Feature {
  icon: typeof Feather;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  { icon: PenTool, title: "Writing Studio", description: "A focused space to draft, edit, and perfect your craft with auto-save." },
  { icon: BookOpen, title: "Publish & Sell", description: "Publish books globally and earn in your local currency." },
  { icon: Users, title: "Communities", description: "Join circles of writers, poets, and storytellers who inspire." },
  { icon: Headphones, title: "Audio Stories", description: "Listen to narrated works or narrate your own for the world." },
  { icon: ShoppingBag, title: "Marketplace", description: "Buy, rent, or subscribe to books, courses, and exclusive content." },
  { icon: BarChart3, title: "Creator Analytics", description: "Track your readers, revenue, and reach across the globe." },
  { icon: Globe, title: "Literary Map", description: "Discover creators and stories from every corner of the world." },
  { icon: Sparkles, title: "Living Environment", description: "Seasonal animations and ambient sound that match your world." },
  { icon: Feather, title: "Poetry & Spoken Word", description: "Share poems, spoken word, and verses that move people." },
];

const FOUNDER_QUOTE = "The sky is not the limit. You limit yourself to the sky.";
const FOUNDER_AUTHOR = "Jaydin Donough, Founder of InkReal";

// ─── Particle helpers ───────────────────────────────────────────────────────

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 18,
    duration: 14 + Math.random() * 10,
    size: 2 + Math.random() * 4,
  }));
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { mood, setMood, soundOn, setSoundOn } = useApp();

  // Time and location state
  const [now, setNow] = useState(new Date());
  const [country] = useState(detectCountry());
  const [currency] = useState(detectBrowserCurrency());
  const [season] = useState(getCurrentSeason());

  // Typewriter state
  const [typedText, setTypedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  // Pulse ticker state
  const [pulseIndex, setPulseIndex] = useState(0);

  // Scroll reveal state
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set());

  // Particles
  const [particles] = useState<Particle[]>(() => generateParticles(20));
  const [seasonalParticles] = useState<Particle[]>(() => generateParticles(15));
  const [fireflies] = useState<Particle[]>(() => generateParticles(12));

  // Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // ─── Time tick ────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── Typewriter effect ────────────────────────────────────────────────────
  useEffect(() => {
    let charIndex = 0;
    setTypedText("");
    setTypingDone(false);

    const interval = setInterval(() => {
      if (charIndex <= FOUNDER_QUOTE.length) {
        setTypedText(FOUNDER_QUOTE.slice(0, charIndex));
        charIndex++;
      } else {
        setTypingDone(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // ─── Pulse ticker ──────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % PULSE_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ─── Scroll reveal ─────────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setVisibleFeatures((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.15 }
    );

    const cards = featuresRef.current?.querySelectorAll("[data-index]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  // ─── Ambient sound (Web Audio API) ─────────────────────────────────────────
  const startAmbientSound = useCallback((): void => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    // Create a low-frequency drone for ambient atmosphere
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = "sine";
    oscillator.frequency.value = 110; // A2
    filter.type = "lowpass";
    filter.frequency.value = 400;

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();

    oscillatorRef.current = oscillator;
    gainRef.current = gainNode;
  }, []);

  const stopAmbientSound = useCallback((): void => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 1);
      setTimeout(() => {
        oscillatorRef.current?.stop();
        oscillatorRef.current = null;
        gainRef.current = null;
      }, 1000);
    }
  }, []);

  const toggleSound = (): void => {
    if (soundOn) {
      stopAmbientSound();
      setSoundOn(false);
    } else {
      startAmbientSound();
      setSoundOn(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      oscillatorRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, []);

  // ─── Derived values ────────────────────────────────────────────────────────
  const hour = now.getHours();
  const greeting = greetingForHour(hour);
  const phase = timeOfDayPhase(hour);
  const currencyInfo = CURRENCIES[currency];
  const selectedMood = MOODS.find((m) => m.id === mood) ?? MOODS[0];

  // Phase icon
  const PhaseIcon = phase === "dawn" || phase === "morning" ? Sunrise
    : phase === "golden" ? Sun
    : phase === "evening" ? Sunset
    : Moon;

  // Seasonal particle renderer
  const renderSeasonalParticles = (): React.ReactNode => {
    if (season === "autumn") {
      return seasonalParticles.map((p) => (
        <div
          key={`leaf-${p.id}`}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            animation: `leaf-fall ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <div
            style={{
              width: `${p.size + 4}px`,
              height: `${p.size + 4}px`,
              background: "#c24407",
              borderRadius: "50% 0 50% 0",
              opacity: 0.6,
            }}
          />
        </div>
      ));
    }
    if (season === "winter") {
      return seasonalParticles.map((p) => (
        <div
          key={`snow-${p.id}`}
          className="absolute top-0 rounded-full bg-white"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `snow-fall ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0.5,
          }}
        />
      ));
    }
    if (season === "spring") {
      return seasonalParticles.map((p) => (
        <div
          key={`blossom-${p.id}`}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            animation: `blossom-float ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <div
            style={{
              width: `${p.size + 2}px`,
              height: `${p.size + 2}px`,
              background: "#f9a8d4",
              borderRadius: "50%",
              opacity: 0.5,
            }}
          />
        </div>
      ));
    }
    return null;
  };

  // Fireflies at night
  const renderFireflies = (): React.ReactNode => {
    const isNight = phase === "night" || phase === "midnight";
    if (!isNight) return null;
    return fireflies.map((p) => (
      <div
        key={`firefly-${p.id}`}
        className="absolute rounded-full"
        style={{
          left: `${p.left}%`,
          bottom: "10%",
          width: `${p.size}px`,
          height: `${p.size}px`,
          background: "#ff9d37",
          boxShadow: "0 0 8px #ff9d37, 0 0 16px #ff9d37",
          animation: `float-slow ${p.duration / 2}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
          opacity: 0.7,
        }}
      />
    ));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-100">
      {/* ─── Aurora background blobs ───────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 -top-20 h-96 w-96 rounded-full opacity-20 blur-3xl animate-aurora"
          style={{ background: selectedMood.accent }}
        />
        <div
          className="absolute right-0 top-1/4 h-80 w-80 rounded-full opacity-15 blur-3xl animate-aurora"
          style={{ background: "#6366f1", animationDelay: "5s" }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full opacity-15 blur-3xl animate-aurora"
          style={{ background: "#f97316", animationDelay: "10s" }}
        />
      </div>

      {/* ─── Floating particles ───────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={`particle-${p.id}`}
            className="absolute bottom-0 rounded-full bg-ink-400"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `float-up ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              opacity: 0.3,
            }}
          />
        ))}
      </div>

      {/* ─── Seasonal particles ───────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {renderSeasonalParticles()}
      </div>

      {/* ─── Fireflies (night only) ────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {renderFireflies()}
      </div>

      {/* ─── Sound toggle ─────────────────────────────────────────────────── */}
      <button
        onClick={toggleSound}
        className="fixed right-6 top-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-ink-800 bg-ink-900/80 text-ink-200 backdrop-blur-md transition-colors hover:border-accent-400 hover:text-accent-400"
      >
        {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>

      {/* ─── Content ───────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          {/* Dynamic welcome */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-sm text-ink-400">
            <span className="flex items-center gap-1.5">
              <PhaseIcon className="h-4 w-4 text-accent-400" />
              {greeting}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent-400" />
              {country}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent-400" />
              {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-accent-400">{currencyInfo.symbol}</span>
              {currencyInfo.name}
            </span>
            <span className="flex items-center gap-1.5 capitalize">
              <Sparkles className="h-4 w-4 text-accent-400" />
              {season}
            </span>
          </div>

          {/* Logo */}
          <h1 className="mb-3 font-serif text-6xl font-bold text-ink-100 sm:text-7xl">
            InkReal
          </h1>
          <p className="mb-2 text-lg text-ink-300">
            Where stories become reality
          </p>

          {/* Founder quote with typewriter */}
          <div className="mb-10 mt-8 max-w-2xl">
            <blockquote className="font-serif text-xl italic text-ink-200 sm:text-2xl">
              "{typedText}
              <span className="inline-block w-0.5 animate-blink-cursor bg-accent-400 ml-1">&nbsp;</span>
            </blockquote>
            {typingDone && (
              <cite className="mt-3 block text-sm text-ink-400 animate-fade-in">
                — {FOUNDER_AUTHOR}
              </cite>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 rounded-xl bg-accent-400 px-8 py-3.5 font-medium text-ink-950 transition-colors hover:bg-accent-500"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 rounded-xl border border-ink-700 px-8 py-3.5 font-medium text-ink-200 transition-colors hover:border-accent-400 hover:text-accent-400"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* ─── Community Pulse Ticker ─────────────────────────────────────── */}
        <section className="border-y border-ink-800 bg-ink-900/30 py-4">
          <div className="flex items-center gap-3 px-4">
            <span className="flex-shrink-0 text-xs font-semibold uppercase tracking-wider text-accent-400">
              Live Pulse
            </span>
            <div className="relative flex-1 overflow-hidden">
              <div className="flex animate-ticker-scroll whitespace-nowrap">
                {[...PULSE_MESSAGES, ...PULSE_MESSAGES].map((msg, i) => (
                  <span key={i} className="mx-6 text-sm text-ink-300">
                    <span className="mr-2 text-accent-400">●</span>
                    {msg}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Mood Selector ──────────────────────────────────────────────── */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-2 font-serif text-3xl font-semibold text-ink-100">
              Set Your Atmosphere
            </h2>
            <p className="mb-8 text-sm text-ink-400">
              Choose a mood to transform the environment around you.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    mood === m.id
                      ? "text-ink-950"
                      : "border border-ink-800 text-ink-300 hover:border-ink-600"
                  }`}
                  style={
                    mood === m.id
                      ? { backgroundColor: m.accent }
                      : undefined
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features Grid ─────────────────────────────────────────────── */}
        <section ref={featuresRef} className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-2 font-serif text-4xl font-semibold text-ink-100">
                A Universe for Creators
              </h2>
              <p className="text-ink-400">
                Everything you need to write, publish, and share your voice with the world.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                const isVisible = visibleFeatures.has(i);
                return (
                  <div
                    key={feature.title}
                    data-index={i}
                    className={`rounded-2xl border border-ink-800 bg-ink-900/40 p-6 transition-all duration-700 ${
                      isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-400/10">
                      <Icon className="h-6 w-6 text-accent-400" />
                    </div>
                    <h3 className="mb-2 font-serif text-lg font-semibold text-ink-100">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-ink-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Founder Section ────────────────────────────────────────────── */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-ink-700 bg-ink-900">
              <Feather className="h-10 w-10 text-accent-400" />
            </div>
            <blockquote className="mb-4 font-serif text-2xl italic text-ink-100 sm:text-3xl">
              "The sky is not the limit. You limit yourself to the sky."
            </blockquote>
            <cite className="block text-base text-ink-400">
              — {FOUNDER_AUTHOR}
            </cite>
          </div>
        </section>

        {/* ─── CTA ────────────────────────────────────────────────────────── */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-semibold text-ink-100 sm:text-4xl">
              Begin Your Story Today
            </h2>
            <p className="mb-8 text-ink-400">
              Join a global community of writers, readers, poets, and creators.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-400 px-8 py-4 font-medium text-ink-950 transition-colors hover:bg-accent-500"
            >
              Get Started with InkReal
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* ─── Footer ─────────────────────────────────────────────────────── */}
        <footer className="border-t border-ink-800 px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div>
                <h3 className="font-serif text-xl font-semibold text-ink-100">InkReal</h3>
                <p className="mt-1 text-sm text-ink-500">Where stories become reality</p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-ink-400">
                <Link to="/auth" className="hover:text-accent-400">Sign In</Link>
                <Link to="/auth" className="hover:text-accent-400">Get Started</Link>
                <span className="hover:text-accent-400 cursor-pointer">About</span>
                <span className="hover:text-accent-400 cursor-pointer">Privacy</span>
                <span className="hover:text-accent-400 cursor-pointer">Terms</span>
              </div>
            </div>
            <div className="mt-8 border-t border-ink-800 pt-6 text-center text-xs text-ink-500">
              © {now.getFullYear()} InkReal. Founded by Jaydin Donough. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
