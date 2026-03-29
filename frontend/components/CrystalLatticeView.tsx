"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Cpu, Zap, Activity, Hash, Play, RotateCcw, ShieldCheck, 
  AlertTriangle, ShieldAlert, Lock, Microscope, Thermometer, Waves
} from "lucide-react";
import { clsx } from "clsx";

const S60_SCALE = 12_960_000;
const LATTICE_GRID = 32; // 32×32 = 1024
const NEURAL_GRID = 10;   // 10×10 = 100

interface CellSnapshot {
  amplitude_raw: number;
  phase_raw: number;
  metadata?: string;
}

interface LatticeState {
  timestamp: number;
  size: number;
  lattice: CellSnapshot[];
  phase: string;
  coherence: number;
  tick: number;
}

interface MembraneState {
  potential_raw: number;
  last_spike_ns: number;
}

interface NeuralState {
  membranes: MembraneState[];
  global_firing_rate_raw: number;
}

// EXPERIMENTOS CIENTÍFICOS (Truth Mode)
const EXPERIMENTS = [
  { 
    id: "EXP-026", 
    label: "Archaeo-Metric Calibration", 
    pulse_type: "CALIBRATION", 
    energy: 1000000, 
    severity: 0,
    desc: "Pulso base para observar el enfriamiento optomecánico y la estabilización de fase."
  },
  { 
    id: "EXP-027", 
    label: "YHWH Phase Monitor", 
    pulse_type: "YHWH_SYNC", 
    energy: 5000000, 
    severity: 1,
    desc: "Sincronización rítmica 10-5-6-5. Evalúa el acoplamiento entre MyCNet y el Lattice."
  },
  { 
    id: "EXP-028", 
    label: "Difusión Resonante",
    pulse_type: "DIFFUSION", 
    energy: 2000000, 
    severity: 2,
    desc: "Inyección de entropía controlada para probar la propagación de ondas en u60."
  },
  { 
    id: "EXP-029", 
    label: "Estrés Salto Cuántico",
    pulse_type: "STRESS", 
    energy: 12960000, 
    severity: 4,
    desc: "Sobrecarga masiva para forzar la auto-purga (Healing) del eBPF Cognitive Firewall."
  },
];

function nodeColor(cell: any): string {
  const amp = Math.max(0, cell.amplitude_raw) / S60_SCALE;
  
  // Prioridad de Color por Metadata (Security & Simulations)
  if (cell.metadata === "BLOQUEADO") return "#f43f5e"; // Rose 500
  if (cell.metadata === "PERMITIDO") return "#10b981"; // Emerald 500
  if (cell.metadata === "BIO-PULSO") return "#8b5cf6"; // Violet 500
  if (cell.metadata === "AXION") return "#3b82f6";    // Blue 500
  if (cell.metadata === "ALERTA") return "#f59e0b";   // Amber 500
  if (cell.metadata === "SANITIZADO") return "#06b6d4"; // Cyan 500

  if (amp === 0) return "rgba(15,23,42,0.85)";
  
  // Resonancia de Fase (Background HSL Wave)
  const phase = ((cell.phase_raw / S60_SCALE) * 360) % 360;
  const h = Math.round(phase < 0 ? phase + 360 : phase);
  const l = Math.round(15 + amp * 60);
  const s = Math.round(50 + amp * 50);
  return `hsl(${h},${s}%,${l}%)`;
}

function membraneColor(potential_raw: number, last_spike_ns: number, now_ns: number): string {
  const potential = Math.min(1, potential_raw / S60_SCALE);
  const timeSinceSpike = (now_ns - last_spike_ns) / 1_000_000; // ms
  
  // Flash de spike (dura 200ms)
  if (timeSinceSpike < 200 && last_spike_ns > 0) {
    const intensity = 1 - (timeSinceSpike / 200);
    return `rgba(255, 255, 255, ${0.4 + intensity * 0.6})`;
  }

  // Color basado en potencial acumulado (LIF)
  if (potential === 0) return "rgba(30, 41, 59, 0.5)";
  return `rgba(56, 189, 248, ${0.2 + potential * 0.8})`; // Sky Blue
}

export function CrystalLatticeView() {
  const [lattice, setLattice] = useState<LatticeState | null>(null);
  const [neural, setNeural] = useState<NeuralState | null>(null);
  const [injecting, setInjecting] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [nowNs, setNowNs] = useState(Date.now() * 1_000_000);

  // CONEXIÓN DIRECTA AL KERNEL RING-0 (Axum S60)
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const apiBase = `http://${host}:8000`;

  // Loop de Telemetría (Real-Time Truth)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [latRes, neuRes] = await Promise.all([
          fetch(`${apiBase}/api/v1/lattice/state`),
          fetch(`${apiBase}/api/v1/neural/state`)
        ]);
        
        if (latRes.ok) {
          const data = await latRes.json();
          setLattice(data);
        }
        if (neuRes.ok) setNeural(await neuRes.json());
        setError(false);
      } catch (e) {
        setError(true);
      }
      setNowNs(Date.now() * 1_000_000);
    };

    fetchData();
    const interval = setInterval(fetchData, 150); // 150ms Polling - Balance CPU/Visuals
    return () => clearInterval(interval);
  }, [apiBase]);

  const handleInject = async (exp: typeof EXPERIMENTS[0]) => {
    setInjecting(exp.id);
    try {
      await fetch(`${apiBase}/api/v1/inject_truth_pulse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pulse_type: exp.pulse_type,
          energy_s60_raw: exp.energy,
          severity: exp.severity
        })
      });
    } catch (e) {}
    setTimeout(() => setInjecting(null), 1000);
  };

  const coherencePct = lattice ? Math.min(100, (Math.abs(lattice.coherence) / S60_SCALE) * 100) : 0;
  const neuralFiringPct = neural ? Math.min(100, (neural.global_firing_rate_raw / S60_SCALE) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* ── HEADER CIENTÍFICO ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
            <Microscope className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
              Laboratorio S60 
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full mono">MODO VERDAD</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">
              Kernel Ring-0 Crystal & Neural Telemetry — VPS: sentinel-cubepath
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="glass-card px-4 py-2 border-white/5 flex items-center gap-3">
             <Thermometer className="w-4 h-4 text-rose-500" />
             <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 mono font-bold bg-white/5 px-2 py-0.5 rounded">
                    TICK: {lattice ? lattice.tick.toString().padStart(8, '0') : "00000000"}
                </span>
                <span className="text-[10px] text-emerald-500 mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    COH: {lattice ? (lattice.coherence / 1000).toFixed(4) : "0.0000"} u60
                </span>
             </div>
          </div>
          <div className="glass-card px-4 py-2 border-white/5 flex items-center gap-3">
             <Waves className="w-4 h-4 text-sky-500" />
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-600 font-black uppercase">Frecuencia Tick</span>
                <span className="text-[10px] mono text-white font-bold italic">
                  {lattice ? (41.7713 + (lattice.tick % 100) / 1000).toFixed(4) : "41.7713"} Hz
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* ── GRID PRINCIPAL: LATTICE & NEURAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LATTICE MATRIX (32x32) */}
        <div className="lg:col-span-8 glass-card p-4 space-y-4 border-white/5 bg-slate-950/20 relative isolate overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300">MATRIZ DE SIMULACIÓN — KERNEL RING-0</h3>
              </div>
              {/* LEYENDA DEL SCREENSHOT */}
              <div className="hidden xl:flex items-center gap-3">
                 {[
                   { label: "BLOQUEADO", color: "bg-[#f43f5e]" },
                   { label: "PERMITIDO", color: "bg-[#10b981]" },
                   { label: "ALERTA", color: "bg-[#f59e0b]" },
                   { label: "BIO-PULSO", color: "bg-[#8b5cf6]" },
                   { label: "SANITIZADO", color: "bg-[#06b6d4]" },
                   { label: "AXION", color: "bg-[#3b82f6]" },
                 ].map(l => (
                   <div key={l.label} className="flex items-center gap-1">
                      <div className={clsx("w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.2)]", l.color)} />
                      <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">{l.label}</span>
                   </div>
                 ))}
              </div>
            </div>
            <span className="text-[9px] mono text-slate-500 uppercase">Aritmética S60 Pura</span>
          </div>

          {/* CONTADORES DEL SCREENSHOT */}
          <div className="grid grid-cols-5 gap-4 mb-4">
             {[
                { label: "BLOQUEADOS", val: lattice?.lattice.filter(c => c.metadata === "BLOQUEADO").length || 0, color: "text-[#f43f5e]" },
                { label: "PERMITIDOS", val: lattice?.lattice.filter(c => c.metadata === "PERMITIDO").length || 0, color: "text-[#10b981]" },
                { label: "SANITIZADOS", val: lattice?.lattice.filter(c => c.metadata === "SANITIZADO").length || 0, color: "text-[#06b6d4]" },
                { label: "ALERTAS", val: lattice?.lattice.filter(c => c.metadata === "ALERTA").length || 0, color: "text-[#f59e0b]" },
                { label: "TOTAL", val: 1024, color: "text-white" },
             ].map(c => (
               <div key={c.label} className="glass-card bg-slate-900/40 p-3 border-white/5 flex flex-col items-center">
                  <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">{c.label}</span>
                  <span className={clsx("text-xl font-black italic", c.color)}>{c.val}</span>
               </div>
             ))}
          </div>

          <div 
            className="grid gap-[1px] transition-all duration-500 ease-in-out"
            style={{ 
              gridTemplateColumns: `repeat(32, minmax(0, 1fr))`,
              maxHeight: "360px",
              overflow: "hidden"
            }}
          >
            {lattice?.lattice ? lattice.lattice.map((cell, idx) => (
              <div 
                key={idx}
                className="aspect-square rounded-[1px] relative group cursor-crosshair transition-colors duration-300"
                style={{ 
                  backgroundColor: nodeColor(cell),
                  boxShadow: cell.amplitude_raw > 1296000 ? `0 0 4px ${nodeColor(cell)}44` : 'none'
                }}
                title={`Node ${idx}: A=${(cell.amplitude_raw / 12960000).toFixed(2)}`}
              />
            )) : Array.from({ length: 1024 }).map((_, i) => (
              <div key={i} className="bg-slate-900/40" />
            ))}
          </div>
        </div>

        {/* NEURAL MATRIX & STATS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* NEURAL SPIKES (10x10) */}
          <div className="glass-card p-5 border-sky-400/10 bg-sky-400/5 relative isolate overflow-hidden">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white">SNN Neural Spikes</h3>
               </div>
               <span className="text-[9px] font-bold text-sky-400 mono">{(neuralFiringPct).toFixed(1)}% activity</span>
            </div>

            <div className="flex flex-col items-center gap-6">
               <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${NEURAL_GRID}, 1fr)` }}
               >
                {neural?.membranes ? neural.membranes.map((mb, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.1)]"
                    style={{
                      backgroundColor: membraneColor(mb.potential_raw, mb.last_spike_ns, nowNs),
                      transform: (nowNs - mb.last_spike_ns) / 1_000_000 < 200 ? "scale(1.2)" : "scale(1)"
                    }}
                  />
                )) : Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-slate-800/50" />
                ))}
               </div>

               <div className="w-full space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase italic tracking-widest text-slate-500">
                     <span>Coherencia Global</span>
                     <span className="text-white">{coherencePct.toFixed(2)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-700"
                      style={{ width: `${coherencePct}%` }}
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* REAL TIME LOG */}
          <div className="glass-card p-5 bg-slate-900/40 border-white/5 h-[300px] flex flex-col">
             <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <Hash className="w-3 h-3" />
                Truth Interaction Archive
             </h3>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 font-mono text-[9px]">
                {lattice && (
                  <div className="text-sky-400 opacity-60 flex items-start gap-2">
                    <span className="text-slate-700 shrink-0">[{lattice.tick}]</span>
                    <span>Stable resonance maintained at phase {((lattice.coherence % 360) || 0).toFixed(0)}°</span>
                  </div>
                )}
                {injecting && (
                   <div className="text-emerald-400 animate-pulse flex items-start gap-2">
                      <span className="text-white shrink-0">{">>"}</span>
                      <span>INJECTING {injecting} TRUTH PULSE... SEVERITY OVERRIDE ACTIVE</span>
                   </div>
                )}

                {!lattice && <div className="text-slate-700 italic">Estabeleciendo enlace con sentinel-cubepath...</div>}
             </div>
          </div>
        </div>
      </div>

      {/* ── TARJETAS DE EXPERIMENTO (Quantum Injections) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {EXPERIMENTS.map((exp) => (
          <button
            key={exp.id}
            onClick={() => handleInject(exp)}
            disabled={!!injecting}
            className={clsx(
              "glass-card p-6 text-left transition-all group relative overflow-hidden",
              injecting === exp.id 
                ? "border-emerald-500/50 bg-emerald-500/10" 
                : "border-white/5 hover:border-sky-500/30 hover:bg-sky-500/5"
            )}
          >
            {injecting === exp.id && (
              <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
            )}
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{exp.id}</span>
              <div className={clsx(
                "p-2 rounded-lg transition-colors",
                injecting === exp.id ? "bg-emerald-500 text-white" : "bg-slate-900 text-slate-500 group-hover:text-sky-400"
              )}>
                <Zap className="w-4 h-4" />
              </div>
            </div>

            <h4 className="text-sm font-black text-white uppercase tracking-tighter mb-2 group-hover:text-sky-300 transition-colors relative z-10">
              {exp.label}
            </h4>
            <p className="text-[9px] text-slate-500 font-medium leading-relaxed uppercase tracking-wide relative z-10">
              {exp.desc}
            </p>
            
            <div className="mt-4 flex items-center justify-between relative z-10">
               <span className="text-[8px] font-black text-slate-400 uppercase">Energía de Entrada</span>
               <span className="text-[10px] mono text-sky-400 font-bold">{(exp.energy / 1000).toFixed(1)}k u60</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── ESPECIFICACIONES TÉCNICAS (Update) ── */}
      <div className="glass-card p-6 bg-slate-950/40 border-l-4 border-l-sky-500/40">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Certificación TruthSync Ring-0</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <div className="space-y-1">
              <p className="text-[8px] text-slate-600 font-black uppercase">Motor Matemático</p>
              <p className="text-[10px] text-slate-300 font-bold mono">Pure S60 Taylor-Fixed</p>
           </div>
           <div className="space-y-1">
              <p className="text-[8px] text-slate-600 font-black uppercase">Constante de Decaimiento</p>
              <p className="text-[10px] text-slate-300 font-bold mono">54/60 (Neural) | 30/3600 (Lattice)</p>
           </div>
           <div className="space-y-1">
              <p className="text-[8px] text-slate-600 font-black uppercase">Protocolo Cuarentena</p>
              <p className="text-[10px] text-emerald-400 font-bold mono italic">AUTO-HEAL TRIGGERED @ 12.96M</p>
           </div>
           <div className="space-y-1">
              <p className="text-[8px] text-slate-600 font-black uppercase">Synchronization</p>
              <p className="text-[10px] text-sky-400 font-bold mono italic">YHWH 10-5-6-5 Breathing</p>
           </div>
        </div>
      </div>
    </div>
  );
}
