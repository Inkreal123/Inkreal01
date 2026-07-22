import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { CURRENCIES, type CurrencyCode } from "../lib/regions";
import { Loader2, Globe, DollarSign, Bell, Eye, Type, Zap, Brain, Accessibility } from "lucide-react";

export default function SettingsPage() {
  const { user, mood, setMood, soundOn, setSoundOn, pushToast } = useApp();
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [notifToggles, setNotifToggles] = useState({ likes: true, comments: true, follows: true, messages: true, marketing: false });
  const [accessibility, setAccessibility] = useState({ highContrast: false, largeFonts: false, reducedMotion: false, dyslexiaMode: false });

  async function saveSettings() {
    pushToast("Settings saved", "success");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-serif font-bold">Settings</h1>

      {/* Language & Currency */}
      <section className="border border-ink-800 rounded-xl p-4 bg-ink-900/50 space-y-4">
        <h3 className="text-sm font-medium text-ink-200 flex items-center gap-2">
          <Globe className="h-4 w-4 text-accent-400" /> Language & Currency
        </h3>
        <div>
          <label className="text-sm text-ink-400 block mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 outline-none focus:border-accent-400"
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="pt">Portuguese</option>
            <option value="sw">Swahili</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-ink-400 block mb-1">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="w-full rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 outline-none focus:border-accent-400"
          >
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
            ))}
          </select>
        </div>
      </section>

      {/* Notifications */}
      <section className="border border-ink-800 rounded-xl p-4 bg-ink-900/50 space-y-3">
        <h3 className="text-sm font-medium text-ink-200 flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent-400" /> Notifications
        </h3>
        {(Object.keys(notifToggles) as (keyof typeof notifToggles)[]).map((key) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-ink-300 capitalize">{key}</span>
            <button
              onClick={() => setNotifToggles((prev) => ({ ...prev, [key]: !prev[key] }))}
              className={`relative h-6 w-11 rounded-full transition ${notifToggles[key] ? "bg-accent-400" : "bg-ink-800"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink-950 transition ${notifToggles[key] ? "left-5" : "left-0.5"}`} />
            </button>
          </label>
        ))}
      </section>

      {/* Mood & Sound */}
      <section className="border border-ink-800 rounded-xl p-4 bg-ink-900/50 space-y-3">
        <h3 className="text-sm font-medium text-ink-200">Ambiance</h3>
        <div>
          <label className="text-sm text-ink-400 block mb-1">Mood</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-ink-100 outline-none focus:border-accent-400"
          >
            {["silence", "rain", "ocean", "forest", "fireplace", "coffee", "night", "classical", "lofi", "focus"].map((m) => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-ink-300">Sound Effects</span>
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`relative h-6 w-11 rounded-full transition ${soundOn ? "bg-accent-400" : "bg-ink-800"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink-950 transition ${soundOn ? "left-5" : "left-0.5"}`} />
          </button>
        </label>
      </section>

      {/* Accessibility */}
      <section className="border border-ink-800 rounded-xl p-4 bg-ink-900/50 space-y-3">
        <h3 className="text-sm font-medium text-ink-200 flex items-center gap-2">
          <Accessibility className="h-4 w-4 text-accent-400" /> Accessibility
        </h3>
        {([
          { key: "highContrast" as const, label: "High Contrast", icon: Eye },
          { key: "largeFonts" as const, label: "Large Fonts", icon: Type },
          { key: "reducedMotion" as const, label: "Reduced Motion", icon: Zap },
          { key: "dyslexiaMode" as const, label: "Dyslexia Mode", icon: Brain },
        ]).map(({ key, label, icon: Icon }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-ink-300 flex items-center gap-2">
              <Icon className="h-4 w-4 text-ink-500" /> {label}
            </span>
            <button
              onClick={() => setAccessibility((prev) => ({ ...prev, [key]: !prev[key] }))}
              className={`relative h-6 w-11 rounded-full transition ${accessibility[key] ? "bg-accent-400" : "bg-ink-800"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink-950 transition ${accessibility[key] ? "left-5" : "left-0.5"}`} />
            </button>
          </label>
        ))}
      </section>

      {/* Account Info */}
      <section className="border border-ink-800 rounded-xl p-4 bg-ink-900/50 space-y-2">
        <h3 className="text-sm font-medium text-ink-200 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-accent-400" /> Account
        </h3>
        <div className="flex justify-between text-sm">
          <span className="text-ink-500">Email</span>
          <span className="text-ink-100">{user?.email || "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-500">Name</span>
          <span className="text-ink-100">{user?.name || "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-500">Role</span>
          <span className="text-ink-100 capitalize">{user?.role || "reader"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-500">Joined</span>
          <span className="text-ink-100">{new Date(user?.joinedAt ?? Date.now()).toLocaleDateString()}</span>
        </div>
      </section>

      <button
        onClick={saveSettings}
        className="w-full rounded-lg bg-accent-400 px-4 py-3 text-ink-950 font-medium hover:bg-accent-300 transition"
      >
        Save Settings
      </button>
    </div>
  );
}
