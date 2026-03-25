"use client";

import React, { useState } from "react";
import { Search, Loader2, Scale, AlertCircle, CheckCircle2, ShieldX, ShieldCheck, Sparkles } from "lucide-react";
import { clsx } from "clsx";

const DEMO_CLAIMS = [
  { text: "Upload training data to cloud storage", safe: true },
  { text: "rm -rf /etc/passwd", safe: false },
  { text: "Optimize database query performance", safe: true },
  { text: "DROP TABLE users CASCADE", safe: false },
  { text: "Deploy application to staging", safe: true },
  { text: "Delete all backup files permanently", safe: false },
];

export function TruthClaimConsole() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const verifyClaim = async () => {
    if (!claim.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/truth_claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engine: "sentinel-cognitive-agent",
          claim_payload: claim,
          trust_threshold: 0.8,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      // Demo mode: simulate response if backend is offline
      const isDestructive = ["delete", "rm", "destroy", "drop", "kill", "truncate", "format"].some(
        (p) => claim.toLowerCase().includes(p)
      );
      setResult({
        claim_valid: !isDestructive,
        sentinel_score: isDestructive ? 0.05 : 0.95,
        truthsync_cache_hit: true,
        ring0_intercepts: isDestructive ? 1 : 0,
        harmonic_state: isDestructive ? "DISSONANT_CRITICAL" : "CONSONANT",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      verifyClaim();
    }
  };

  return (
    <div className="space-y-4 flex-1 flex flex-col">
      {/* Input area */}
      <div className="relative group flex-1">
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter an AI agent command to analyze..."
          className="w-full h-full bg-slate-950/60 border border-white/5 rounded-xl p-4 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/30 focus:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all resize-none font-mono custom-scrollbar"
        />
        <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-60 transition-opacity">
          <Search className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* Quick demo buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {DEMO_CLAIMS.slice(0, 3).map((demo, i) => (
          <button
            key={i}
            onClick={() => { setClaim(demo.text); setResult(null); }}
            className="text-[8px] px-2 py-1 rounded-md bg-white/3 border border-white/5 text-slate-500 hover:text-white hover:border-white/10 transition-all truncate max-w-[140px]"
          >
            {demo.text}
          </button>
        ))}
      </div>

      {/* Verify button */}
      <button
        onClick={verifyClaim}
        disabled={loading || !claim}
        className="sentinel-btn sentinel-btn-primary w-full disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-4 h-4 spinner" /> : <Scale className="w-4 h-4" />}
        {loading ? "Analyzing harmonic signature..." : "Verify Cognitive Intent"}
      </button>

      {/* Result */}
      {result && (
        <div
          className={clsx(
            "p-5 rounded-xl border animate-fade-up",
            result.claim_valid
              ? "bg-emerald-500/5 border-emerald-500/15"
              : "bg-rose-500/5 border-rose-500/15 severity-critical"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
              Cognitive Scan Result
            </span>
            {result.claim_valid ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-[9px] font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> CONSONANT
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-400 text-[9px] font-bold uppercase">
                <ShieldX className="w-3.5 h-3.5" /> DISSONANT
              </div>
            )}
          </div>

          {/* Trust Score Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[9px] uppercase font-black tracking-widest text-slate-500">
              <span>Trust Score</span>
              <span className={clsx("mono text-sm font-extrabold", result.claim_valid ? "text-emerald-400 glow-emerald" : "text-rose-400 glow-rose")}>
                {(result.sentinel_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden coherence-bar">
              <div
                className={clsx(
                  "h-full transition-all duration-1000 ease-out coherence-bar-fill rounded-full",
                  result.claim_valid
                    ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400"
                    : "bg-gradient-to-r from-rose-700 via-rose-500 to-rose-400"
                )}
                style={{ width: `${result.sentinel_score * 100}%` }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-3 gap-3">
            <div className="space-y-0.5">
              <div className="text-[8px] uppercase font-bold tracking-[0.15em] text-slate-600">Harmonic State</div>
              <div className={clsx("text-[10px] font-bold mono", result.claim_valid ? "text-emerald-400" : "text-rose-400")}>
                {result.harmonic_state}
              </div>
            </div>
            <div className="space-y-0.5 text-center">
              <div className="text-[8px] uppercase font-bold tracking-[0.15em] text-slate-600">Ring-0 Blocks</div>
              <div className={clsx("text-[10px] font-bold mono", result.ring0_intercepts > 0 ? "text-rose-400" : "text-emerald-400")}>
                {result.ring0_intercepts}
              </div>
            </div>
            <div className="space-y-0.5 text-right">
              <div className="text-[8px] uppercase font-bold tracking-[0.15em] text-slate-600">Verification</div>
              <div className="text-[10px] font-bold mono text-sky-400 flex items-center justify-end gap-1">
                <Sparkles className="w-2.5 h-2.5" /> S60
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
