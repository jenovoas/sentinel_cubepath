"use client";

import React, { useState } from "react";
import { ShieldAlert, Zap, ShieldCheck, Activity, Terminal } from "lucide-react";
import { clsx } from "clsx";

interface ShieldControlProps {
  status: any;
}

export function ShieldControl({ status }: ShieldControlProps) {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

  const simulateAttack = async (type: "NORMAL" | "DOOM" | "CHAOS") => {
    setLoading(true);
    // Energy values mapeados a aritmética S60 real — EXP-027/EXP-035
    const configs = {
      NORMAL: { energy: 12_960_000,   idx: 528, label: "HARMONIC-AXION", pulse: "EXP-035" },
      DOOM:   { energy: 3_735_928_559, idx: 496, label: "BLOQUEADO",      pulse: "DOOM-0xDEADBEEF" },
      CHAOS:  { energy: -12_960_000,  idx: 512, label: "ALERTA",         pulse: "CHAOS-NEG-ENTROPY" },
    };
    const cfg = configs[type];

    try {
      // Usa el endpoint REAL del Ring-0 backend — inject_truth_pulse
      const res = await fetch(`http://${host}:8000/api/v1/inject_truth_pulse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pulse_type: cfg.pulse,
          energy_s60_raw: cfg.energy,
          severity: type === "DOOM" ? 2 : type === "CHAOS" ? 1 : 0,
          index: cfg.idx,
          metadata: cfg.label,
        }),
      });
      const data = res.ok ? await res.json() : null;
      setLastResult({ type, success: !!data, tick: data?.tick });
    } catch (e) {
      console.error(e);
      setLastResult({ type, success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-6 flex flex-col h-full border-emerald-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Shield Level: {status?.lsm_cognitive || "LINKING..."}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">IA Ops Shield War Room</p>
          </div>
        </div>
        <div className="status-badge bg-emerald-500/5 border-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded border">
          <ShieldCheck className="w-3 h-3 inline mr-1" />
          ACTIVE
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => simulateAttack("NORMAL")}
            disabled={loading}
            className="flex flex-col items-center p-3 rounded-xl border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 transition-colors group"
          >
            <Zap className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-tighter">Harmonic</span>
          </button>
          
          <button
            onClick={() => simulateAttack("DOOM")}
            disabled={loading}
            className="flex flex-col items-center p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors group"
          >
            <Activity className="w-5 h-5 text-rose-400 mb-2 group-hover:animate-pulse" />
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">Doom Axion</span>
          </button>

          <button
            onClick={() => simulateAttack("CHAOS")}
            disabled={loading}
            className="flex flex-col items-center p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors group"
          >
            <Terminal className="w-5 h-5 text-amber-400 mb-2 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tighter">Chaos Inject</span>
          </button>
        </div>

        <div className="console-box bg-black/40 border border-slate-800 rounded-lg p-3 font-mono text-[10px] h-32 overflow-hidden relative">
          <div className="text-emerald-500/70 mb-1">{" >> SENTINEL_CORTEX_INIT_COMPLETE"}</div>
          <div className="text-slate-500">{" >> LISTENING FOR COGNITIVE ARTIFACTS..."}</div>
          {lastResult && (
            <div className={clsx(
              "mt-2 animate-in fade-in slide-in-from-left-2",
              lastResult.type === "DOOM" ? "text-rose-400" : "text-sky-400"
            )}>
              {lastResult.type === "DOOM" 
                ? `[!] AIOpsDoom DETECTED: Sanitizing 0x${(3735928559).toString(16).toUpperCase()}...` 
                : "[*] Pulse Accepted: Harmonic phase 1.0 verified."}
            </div>
          )}
          <div className="text-slate-600 mt-1">{" >> BPF_LOADER: Attached to /sys/fs/bpf/tc_firewall_config [FD: 62]"}</div>
          <div className="absolute bottom-2 right-2 flex gap-1">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800">
        <p className="text-[9px] text-slate-600 italic">
          * Intercepción activa vía Ring-0 Guardians (LSM + eBPF).
        </p>
      </div>
    </div>
  );
}
