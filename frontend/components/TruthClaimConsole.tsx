"use client";

import React, { useState } from "react";
import { Search, Loader2, Scale, AlertCircle, CheckCircle2, ShieldX, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { clsx } from "clsx";

const DEMO_CLAIMS = [
  { text: "Simular silencio biométrico (30s sin pulso)", safe: false },
  { text: "Ejecutar intento de ataque semántico en UI", safe: false },
  { text: "Validar Cristal de Tiempo (Lógica ITO)", safe: true },
  { text: "Verificar AIOpsDoom en matriz TruthSync", safe: true },
  { text: "Purgar entropía del Lattice Líquido", safe: true },
  { text: "Sincronizar nodo de identidad soberana MyCNet", safe: true },
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL
        ?? (typeof window !== "undefined" ? window.location.origin : "");
      const res = await fetch(`${apiBase}/api/v1/truth_claim`, {
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
      setResult({
        error: "KERNEL_SYNC_ERROR",
        message: "No se pudo contactar con el Cortex Ring-0. Verifique la conexión con el kernel.",
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
    <div className="flex flex-col h-full overflow-hidden gap-3">
      {/* Loading overlay for analytical feel */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300 rounded-xl border border-emerald-500/20">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-emerald-500 spinner" />
            <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Escaneando Frecuencias Armónicas</p>
            <p className="text-[8px] text-slate-500 mono mt-1">Plimpton 322 Phase Check: OK</p>
          </div>
        </div>
      )}

      {/* Input area — altura fija, no crece */}
      <div className="relative group shrink-0" style={{ height: "90px" }}>
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ingresa un comando de agente IA para verificar la intención cognitiva..."
          className="w-full h-full bg-slate-950/40 border border-white/5 rounded-xl p-4 text-[11px] text-white placeholder:text-slate-800 focus:outline-none focus:border-emerald-500/30 transition-all resize-none font-mono custom-scrollbar"
        />
        <div className="absolute bottom-3 right-3 opacity-20 group-hover:opacity-60 transition-opacity">
          <Terminal className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* Quick demo buttons */}
      <div className="flex gap-1.5 flex-wrap shrink-0">
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
        className="sentinel-btn sentinel-btn-primary w-full shrink-0 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-4 h-4 spinner" /> : <Scale className="w-4 h-4" />}
        {loading ? "Analizando firma armónica..." : "Verificar Intención Cognitiva"}
      </button>

      {/* Result — scrollable si desborda */}
      {result && (
        <div
          className={clsx(
            "p-4 rounded-xl border animate-fade-up overflow-y-auto custom-scrollbar",
            result.error
              ? "bg-slate-900/50 border-rose-500/20"
              : result.claim_valid
              ? "bg-emerald-500/5 border-emerald-500/15"
              : "bg-rose-500/5 border-rose-500/15 severity-critical"
          )}
        >
          {result.error ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-rose-400 tracking-widest">{result.error}</p>
                <p className="text-[9px] text-slate-500 italic max-w-[200px]">{result.message}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                  Resultado del Análisis Cognitivo
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
                  <span>Puntuación de Confianza</span>
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

              {/* Métricas S60 — 4 filas compactas */}
              <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                {[
                  { label: "Lattice", val: result.lattice_coherence ?? 0, color: "bg-sky-500", text: "text-sky-400" },
                  { label: "Bio", val: result.bio_resonance ?? 0, color: "bg-rose-500", text: "text-rose-400" },
                  { label: "P322", val: result.plimpton_integrity ?? 0, color: "bg-violet-500", text: "text-violet-400" },
                  { label: "SNN", val: result.neural_confidence ?? 0, color: "bg-amber-500", text: "text-amber-400" },
                ].map(({ label, val, color, text }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-[8px] uppercase font-bold text-slate-600 w-8 shrink-0">{label}</span>
                    <div className="flex-1 h-1 bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${val * 100}%` }} />
                    </div>
                    <span className={`text-[9px] mono font-bold w-7 text-right ${text}`}>{(val * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>

              {/* Estado + Vector + Bloqueos en una línea */}
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <div className={clsx("text-[8px] font-bold mono truncate", result.claim_valid ? "text-emerald-400" : "text-rose-400")}>
                  {result.harmonic_state}
                </div>
                <div className={clsx("text-[8px] font-bold mono shrink-0", result.threat_vector === "NOMINAL" ? "text-emerald-400" : "text-amber-400")}>
                  {result.threat_vector ?? "NOMINAL"}
                </div>
                <div className={clsx("text-[8px] font-bold mono flex items-center gap-0.5 shrink-0", result.ring0_intercepts > 0 ? "text-rose-400" : "text-emerald-400")}>
                  <Sparkles className="w-2 h-2" />{result.ring0_intercepts} bloqueos
                </div>
              </div>

              {/* Categorías — chips inline */}
              {result.threat_categories?.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {result.threat_categories.map((cat: string, i: number) => {
                    const isThreat = cat.endsWith("_ATTACK") || cat.endsWith("_INJECTION") || cat.endsWith("_ATTEMPT") || cat.endsWith("_SIGNATURE") || cat.endsWith("_TAMPERING") || cat.endsWith("_EXFILTRATION");
                    return (
                      <span key={i} className={clsx(
                        "px-1 py-0.5 rounded text-[7px] font-black mono border",
                        isThreat ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      )}>{cat}</span>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
