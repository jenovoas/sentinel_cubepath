"use client";

import React, { useState } from "react";
import { Search, Loader2, Scale, AlertCircle, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

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
          engine: "sentinel-sovereign-agent",
          claim_payload: claim,
          trust_threshold: 0.8
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 flex-1 flex flex-col">
      <div className="relative group flex-1">
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Enter AI Agent intent to analyze..."
          className="w-full h-full bg-slate-950/50 border border-white/5 rounded-xl p-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all resize-none font-mono custom-scrollbar"
        />
        <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-100 transition-opacity">
           <Search className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      <button
        onClick={verifyClaim}
        disabled={loading || !claim}
        className="sentinel-btn sentinel-btn-primary w-full disabled:opacity-50 disabled:scale-100"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
        {loading ? "Analizando semántica..." : "Verify Cognitive Claim"}
      </button>

      {result && (
        <div className={clsx(
          "p-5 rounded-xl flex-1 border animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all",
          result.claim_valid ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
        )}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cognitive Scan Result</span>
            {result.claim_valid ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase">
                <CheckCircle2 className="w-4 h-4" /> Consonant
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold uppercase">
                <AlertCircle className="w-4 h-4" /> Dissonant
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-400">
               <span>Trust Score</span>
               <span className={clsx("mono text-xs", result.claim_valid ? "text-emerald-400" : "text-rose-400")}>{(result.sentinel_score * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
               <div 
                 className={clsx("h-full transition-all duration-1000", result.claim_valid ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-rose-500 shadow-[0_0_10px_#f43f5e]")}
                 style={{ width: `${result.sentinel_score * 100}%` }}
               />
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <div className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-600">Harmonic State</div>
                      <div className={clsx("text-xs font-bold mono", result.claim_valid ? "text-emerald-400" : "text-rose-400")}>
                        {result.harmonic_state}
                      </div>
                   </div>
                   <div className={clsx(
                     "px-2 py-1 rounded text-[9px] font-bold border",
                     result.claim_valid ? "border-emerald-500/20 text-emerald-400" : "border-rose-500/20 text-rose-400"
                   )}>
                      S60 VERIFIED
                   </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
