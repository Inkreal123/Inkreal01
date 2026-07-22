import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Server } from "lucide-react";

type Status = "checking" | "ok" | "error";

interface HealthState {
  status: Status;
  latencyMs: number | null;
  timestamp: string | null;
  error: string | null;
}

export default function HealthCheckPage() {
  const [health, setHealth] = useState<HealthState>({
    status: "checking",
    latencyMs: null,
    timestamp: null,
    error: null,
  });

  const runCheck = useCallback(async () => {
    setHealth({ status: "checking", latencyMs: null, timestamp: null, error: null });
    const start = performance.now();
    try {
      const { error } = await supabase.from("books").select("id").limit(1);
      const elapsed = Math.round(performance.now() - start);
      if (error) throw error;
      setHealth({
        status: "ok",
        latencyMs: elapsed,
        timestamp: new Date().toISOString(),
        error: null,
      });
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      const message = err instanceof Error ? err.message : "Unknown error";
      setHealth({
        status: "error",
        latencyMs: elapsed,
        timestamp: new Date().toISOString(),
        error: message,
      });
    }
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="flex items-center gap-3 mb-8">
          <Server className="h-8 w-8 text-accent-400" />
          <h1 className="text-2xl font-serif font-bold">InkReal Health Check</h1>
        </div>

        <div className="border border-ink-800 rounded-xl p-6 bg-ink-900/50">
          {health.status === "checking" && (
            <div className="flex items-center gap-3 text-ink-300">
              <Loader2 className="h-6 w-6 animate-spin text-accent-400" />
              <span className="text-lg">Checking database connection…</span>
            </div>
          )}

          {health.status === "ok" && (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              <div>
                <p className="text-lg font-semibold text-emerald-400">All systems operational</p>
                <p className="text-sm text-ink-400">Database connection successful</p>
              </div>
            </div>
          )}

          {health.status === "error" && (
            <div className="flex items-center gap-3">
              <AlertCircle className="h-7 w-7 text-red-400" />
              <div>
                <p className="text-lg font-semibold text-red-400">Connection failed</p>
                <p className="text-sm text-ink-400">{health.error}</p>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-2 border-t border-ink-800 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Status</span>
              <span className={
                health.status === "ok" ? "text-emerald-400" :
                health.status === "error" ? "text-red-400" : "text-accent-400"
              }>
                {health.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Latency</span>
              <span className="text-ink-100">
                {health.latencyMs !== null ? `${health.latencyMs} ms` : "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Timestamp</span>
              <span className="text-ink-100 text-xs">
                {health.timestamp ? new Date(health.timestamp).toLocaleString() : "—"}
              </span>
            </div>
          </div>

          <button
            onClick={runCheck}
            disabled={health.status === "checking"}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg border border-ink-800 bg-ink-900 px-4 py-3 text-ink-100 transition hover:border-accent-400 hover:text-accent-400 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${health.status === "checking" ? "animate-spin" : ""}`} />
            Recheck
          </button>
        </div>
      </div>
    </div>
  );
}
