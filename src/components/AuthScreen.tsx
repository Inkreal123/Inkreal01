import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Loader2, ArrowRight, AlertCircle, Phone } from "lucide-react";
import { supabase } from "../lib/supabase";
import { env } from "../lib/env";
import { useApp } from "../lib/store";

type AuthMode = "signin" | "signup" | "phone";

export default function AuthScreen() {
  const navigate = useNavigate();
  const { pushToast } = useApp();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async (): Promise<void> => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/feed",
        },
      });
      if (error) throw error;
      // OAuth will redirect, so no need to do anything else here
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed.";
      setError(message);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setPhoneMessage(null);

    if (mode === "phone") {
      if (!phone.trim()) {
        setError("Please enter your phone number.");
        return;
      }
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone.trim(),
        });
        if (error) throw error;
        setPhoneMessage(
          "Verification code sent! Check your SMS or WhatsApp for the code to verify your number."
        );
        pushToast("Verification code sent.", "success");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Phone sign-in failed.";
        setError(message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim() },
          },
        });

        if (error) throw error;

        // If session is returned immediately, navigate to feed
        if (data.session) {
          // Fire-and-forget welcome email
          fetch(`${env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: data.user?.id,
              email: email.trim(),
              name: name.trim(),
            }),
          }).catch((err) => console.error("Welcome email failed:", err));

          pushToast("Welcome to InkReal!", "success");
          navigate("/feed");
        } else {
          pushToast("Check your email to confirm your account.", "info");
          setError(null);
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        pushToast("Welcome back to InkReal.", "success");
        navigate("/feed");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="mb-8 block text-center">
          <h1 className="font-serif text-3xl font-semibold text-ink-100">InkReal</h1>
          <p className="mt-1 text-sm text-ink-400">Where stories become reality</p>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900/50 p-6 sm:p-8">
          {/* Mode tabs */}
          <div className="mb-6 flex gap-1 rounded-lg bg-ink-950 p-1">
            <button
              onClick={() => {
                setMode("signin");
                setError(null);
                setPhoneMessage(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "signin" ? "bg-accent-400 text-ink-950" : "text-ink-300 hover:text-ink-100"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setError(null);
                setPhoneMessage(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "signup" ? "bg-accent-400 text-ink-950" : "text-ink-300 hover:text-ink-100"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setMode("phone");
                setError(null);
                setPhoneMessage(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "phone" ? "bg-accent-400 text-ink-950" : "text-ink-300 hover:text-ink-100"
              }`}
            >
              Phone
            </button>
          </div>

          {/* Google OAuth button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-ink-700 bg-white px-4 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink-800" />
            <span className="text-xs text-ink-500">or</span>
            <div className="h-px flex-1 bg-ink-800" />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Phone success message */}
          {phoneMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{phoneMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-200">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-ink-800 bg-ink-950 py-3 pl-10 pr-4 text-sm text-ink-100 placeholder-ink-500 focus:border-accent-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {mode !== "phone" && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-200">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-ink-800 bg-ink-950 py-3 pl-10 pr-4 text-sm text-ink-100 placeholder-ink-500 focus:border-accent-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-200">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-ink-800 bg-ink-950 py-3 pl-10 pr-4 text-sm text-ink-100 placeholder-ink-500 focus:border-accent-400 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "phone" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-200">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 82 123 4567"
                    className="w-full rounded-xl border border-ink-800 bg-ink-950 py-3 pl-10 pr-4 text-sm text-ink-100 placeholder-ink-500 focus:border-accent-400 focus:outline-none"
                  />
                </div>
                <p className="mt-2 text-xs text-ink-500">
                  We'll send a verification code via SMS or WhatsApp.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-400 px-6 py-3 font-medium text-ink-950 transition-colors hover:bg-accent-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "signup" ? "Creating account..." : mode === "phone" ? "Sending code..." : "Signing in..."}
                </>
              ) : (
                <>
                  {mode === "signup" ? "Create Account" : mode === "phone" ? "Send Code" : "Sign In"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch mode link */}
          <p className="mt-6 text-center text-sm text-ink-400">
            {mode === "signin" && (
              <>
                New to InkReal?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className="font-medium text-accent-400 hover:text-accent-300"
                >
                  Create an account
                </button>
              </>
            )}
            {mode === "signup" && (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className="font-medium text-accent-400 hover:text-accent-300"
                >
                  Sign in
                </button>
              </>
            )}
            {mode === "phone" && (
              <>
                Prefer email?{" "}
                <button
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setPhoneMessage(null);
                  }}
                  className="font-medium text-accent-400 hover:text-accent-300"
                >
                  Sign in with email
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-ink-500">
          By continuing, you agree to InkReal's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
