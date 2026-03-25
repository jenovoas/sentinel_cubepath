"use client";

import React, { useState } from "react";
import { Search, Loader2, Scale, AlertCircle } from "lucide-react";
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
          engine: "claude-assistant",
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
      <div className="relative group">
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Escribe la intención del agente de IA aquí..."
          className="w-full h-32 bg-cyber-black/50 border border-sentinel-500/20 rounded-lg p-3 text-xs text-sentinel-100 placeholder:text-sentinel-500/40 focus:outline-none focus:border-sentinel-400 transition-all resize-none font-mono"
        />
        <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
           <Search className="w-4 h-4 text-sentinel-400" />
        </div>
      </div>

      <button
        onClick={verifyClaim}
        disabled={loading || !claim}
        className="w-full bg-sentinel-600 hover:bg-sentinel-500 disabled:bg-sentinel-900 text-sentinel-50 font-bold py-2 rounded-lg text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
        {loading ? "Analizando semántica..." : "Verificar Claim"}
      </button>

      {result && (
        <div className={clsx(
          "p-4 rounded-lg flex-1 border animate-in fade-in slide-in-from-bottom-2 duration-500",
          result.claim_valid ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
        )}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-tighter text-sentinel-400">Escaneo Cognitivo</span>
            {result.claim_valid ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-sentinel-300">
               <span>Puntaje de Confianza</span>
               <span className={result.claim_valid ? "text-emerald-400" : "text-red-400"}>{(result.sentinel_score * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-cyber-black rounded-full h-1 overflow-hidden">
               <div 
                 className={clsx("h-full transition-all duration-1000", result.claim_valid ? "bg-emerald-500" : "bg-red-500")}
                 style={{ width: `${result.sentinel_score * 100}%` }}
               />
            </div>
            <div className="mt-4 pt-2 border-t border-sentinel-500/10">
               <div className="text-[9px] uppercase font-bold text-sentinel-500 mb-1">Estado Armónico</div>
               <div className="text-xs font-mono text-sentinel-100">{result.harmonic_state}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
