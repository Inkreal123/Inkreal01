import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import { Phone, Loader2, CheckCircle2, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

type Step = "phone" | "otp" | "success";

export default function PhoneVerificationPage() {
  const { user } = useApp();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendOtp = useCallback(async () => {
    if (!phone.trim()) { setError("Please enter a phone number"); return; }
    setLoading(true);
    setError(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
      if (otpError) throw otpError;
      setStep("otp");
      setCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const verifyOtp = useCallback(async () => {
    if (otp.length !== 6) { setError("Please enter the 6-digit code"); return; }
    setLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otp,
        type: "sms",
      });
      if (verifyError) throw verifyError;
      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [phone, otp]);

  const resendOtp = useCallback(async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
      if (otpError) throw otpError;
      setCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  }, [phone, cooldown]);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-2 mb-8">
          <Phone className="h-7 w-7 text-accent-400" />
          <h1 className="text-2xl font-serif font-bold">Phone Verification</h1>
        </div>

        {user && (
          <div className="border border-ink-800 rounded-lg p-3 mb-4 text-sm text-ink-400 bg-ink-900/50">
            Signed in as <span className="text-ink-100">{user.email}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-400/10 p-3 mb-4">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {step === "phone" && (
          <div className="border border-ink-800 rounded-xl p-6 bg-ink-900/50 space-y-4">
            <div>
              <label className="text-sm text-ink-400 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full rounded-lg border border-ink-800 bg-ink-900 px-3 py-2.5 text-ink-100 placeholder-ink-500 outline-none focus:border-accent-400"
              />
              <p className="text-xs text-ink-500 mt-1">Include country code (e.g., +1, +44, +27)</p>
            </div>
            <button
              onClick={sendOtp}
              disabled={loading || !phone.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent-400 px-4 py-3 text-ink-950 font-medium hover:bg-accent-300 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ArrowRight className="h-5 w-5" /> Send Code</>}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="border border-ink-800 rounded-xl p-6 bg-ink-900/50 space-y-4">
            <div>
              <label className="text-sm text-ink-400 block mb-1">Enter 6-digit code sent to {phone}</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full rounded-lg border border-ink-800 bg-ink-900 px-3 py-2.5 text-center text-2xl tracking-[0.5em] text-ink-100 placeholder-ink-600 outline-none focus:border-accent-400"
              />
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent-400 px-4 py-3 text-ink-950 font-medium hover:bg-accent-300 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> Verify</>}
            </button>
            <button
              onClick={resendOtp}
              disabled={cooldown > 0 || loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-ink-800 px-4 py-2.5 text-sm text-ink-300 hover:border-accent-400 hover:text-accent-400 transition disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="border border-emerald-400/40 rounded-xl p-8 bg-emerald-400/5 text-center space-y-3">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-serif font-bold text-emerald-400">Phone Verified!</h2>
            <p className="text-sm text-ink-400">Your phone number has been successfully verified.</p>
          </div>
        )}
      </div>
    </div>
  );
}
