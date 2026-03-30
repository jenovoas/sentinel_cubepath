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

// Simulaciones validadas — basadas en experimentos reales de /sentinel/quantum/experiments/
// Cada paso es: { idx (nodo 0-1023), energy (raw S60), delay_ms, label }
interface SimStep { idx: number; energy: number; delay_ms: number; label: string; }
interface Simulation {
  id: string; name: string; badge: string; color: string;
  desc: string; ref: string;
  steps: SimStep[];
}

const S60_FULL = 12_960_000;

const SIMULATIONS: Simulation[] = [
  {
    id: "EXP-035",
    name: "Crystal Wave Propagation",
    badge: "2D DIAMANTE",
    color: "sky",
    desc: "Perturbación de 90° en el cristal central (528). Observa la onda 2D expandirse en diamante a través de los 4 vecinos cardinales.",
    ref: "EXP_035_RESONANT_LATTICE_SIM.py — Validado 2026-01-23",
    steps: [
      { idx: 528, energy: S60_FULL * 0.9, delay_ms: 0,   label: "PERTURBACIÓN" },
    ],
  },
  {
    id: "EXP-027",
    name: "Respiración YHWH",
    badge: "10-5-6-5",
    color: "violet",
    desc: "Inyección secuencial en 4 nodos siguiendo el patrón Yod-He-Vav-He (10-5-6-5). Modula la coherencia como un sistema respiratorio vivo.",
    ref: "EXP_027_YHWH_PULSE_MONITOR.md — Validado 2026-01-23",
    steps: [
      { idx: 528, energy: S60_FULL * 10/10, delay_ms: 0,   label: "YOD" },      // Inhalación
      { idx: 500, energy: S60_FULL * 5/10,  delay_ms: 420, label: "HE" },       // Retención
      { idx: 556, energy: S60_FULL * 6/10,  delay_ms: 750, label: "VAV" },      // Exhalación
      { idx: 496, energy: S60_FULL * 5/10,  delay_ms: 1050,label: "HE" },       // Vacío
    ],
  },
  {
    id: "EXP-028",
    name: "Portal de Coherencia",
    badge: "PENTA-RES",
    color: "amber",
    desc: "Convergencia BIO+CRYSTAL+VENUS en t=5.3s. Activa 9 nodos simultáneos en el anillo de la fila 5 — el portal de máxima coherencia cuántica.",
    ref: "EXP_028_PENTA_RESONANCE.md — φ_BIO=0.89, φ_CRYSTAL=0.90, φ_VENUS=0.88",
    // 9 nodos en la fila 5 (índices 160-168) — representa la ventana de portal t∈[4.9-5.7s]
    steps: Array.from({ length: 9 }, (_, i) => ({
      idx: 160 + i,
      energy: Math.round(S60_FULL * (0.85 + i * 0.005)),
      delay_ms: i * 80,
      label: `PORTAL-${i + 1}`,
    })),
  },
  {
    id: "EXP-029",
    name: "Quantum Scheduler",
    badge: "SALTO-17",
    color: "emerald",
    desc: "Rafaga de 5 tareas batch ejecutadas en ventana de portal (~17s). Demuestra el ahorro energético 43.6% vs scheduler tradicional.",
    ref: "EXP_029_QUANTUM_SCHEDULER.md — Eficiencia 65.3%, Ahorro 674 J",
    // Simular el batch burst del scheduler — 5 nodos del cuadrante superior
    steps: [
      { idx: 48,  energy: S60_FULL * 0.7, delay_ms: 0,   label: "TASK-ZPE_TUNE" },
      { idx: 96,  energy: S60_FULL * 0.5, delay_ms: 150, label: "TASK-BCI_SYNC" },
      { idx: 144, energy: S60_FULL * 0.8, delay_ms: 300, label: "TASK-LATTICE_GC" },
      { idx: 192, energy: S60_FULL * 0.6, delay_ms: 450, label: "TASK-BACKUP_S60" },
      { idx: 240, energy: S60_FULL * 0.9, delay_ms: 600, label: "TASK-PHASE_ALIGN" },
    ],
  },
  {
    id: "EXP-017",
    name: "Vimana G-Zero",
    badge: "LEVITACIÓN",
    color: "rose",
    desc: "Escalada progresiva de presión de datos (0→100%). Muestra la curva cuadrática de reducción de masa inercial hasta G-ZERO (<0.1 kg en P=100%).",
    ref: "EXP_017_VIMANA_LEVITATION.md — ΔM=0.96, Estado G-ZERO validado",
    // 10 pasos progresivos simulando los steps del reporte EXP-017
    steps: [
      { idx: 300, energy: Math.round(S60_FULL * 0.20), delay_ms: 0,    label: "P=20% INERTIAL" },
      { idx: 330, energy: Math.round(S60_FULL * 0.30), delay_ms: 180,  label: "P=30%" },
      { idx: 360, energy: Math.round(S60_FULL * 0.50), delay_ms: 360,  label: "P=50% INERTIAL" },
      { idx: 390, energy: Math.round(S60_FULL * 0.60), delay_ms: 540,  label: "P=60%" },
      { idx: 420, energy: Math.round(S60_FULL * 0.70), delay_ms: 720,  label: "P=70%" },
      { idx: 450, energy: Math.round(S60_FULL * 0.80), delay_ms: 900,  label: "P=80% PRE-IGN." },
      { idx: 480, energy: Math.round(S60_FULL * 0.90), delay_ms: 1080, label: "P=90% LIFTING" },
      { idx: 510, energy: Math.round(S60_FULL * 0.95), delay_ms: 1260, label: "P=95%" },
      { idx: 528, energy: Math.round(S60_FULL * 1.00), delay_ms: 1440, label: "✨ G-ZERO" },
    ],
  },
];

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  sky:     { border: "border-sky-500/30",     bg: "bg-sky-500/5",     text: "text-sky-400",     badge: "bg-sky-500/20 text-sky-300"     },
  violet:  { border: "border-violet-500/30",  bg: "bg-violet-500/5",  text: "text-violet-400",  badge: "bg-violet-500/20 text-violet-300" },
  amber:   { border: "border-amber-500/30",   bg: "bg-amber-500/5",   text: "text-amber-400",   badge: "bg-amber-500/20 text-amber-300"   },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
  rose:    { border: "border-rose-500/30",    bg: "bg-rose-500/5",    text: "text-rose-400",    badge: "bg-rose-500/20 text-rose-300"     },
};


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

  const [simLog, setSimLog] = useState<string[]>([]);

  const runSimulation = async (sim: Simulation) => {
    if (injecting) return;
    setInjecting(sim.id);
    setSimLog([]);
    for (const step of sim.steps) {
      await new Promise(r => setTimeout(r, step.delay_ms));
      try {
        const res = await fetch(`${apiBase}/api/v1/inject_truth_pulse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pulse_type: sim.id,
            energy_s60_raw: Math.round(step.energy),
            severity: 1,
            index: step.idx,
            metadata: step.label,
          })
        });
        if (res.ok) {
          const { tick } = await res.json();
          setSimLog(l => [`[${tick}] ${step.label} → n°${step.idx} (${(step.energy / 12960000 * 100).toFixed(0)}% S60)`, ...l].slice(0, 20));
        }
      } catch {}
    }
    setTimeout(() => setInjecting(null), 800);
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

      {/* ── SIMULACIONES EXPERIMENTALES ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Microscope className="w-4 h-4 text-sky-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Simulaciones Experimentales Validadas</h3>
          <span className="text-[8px] px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 font-bold uppercase">Interactivo — Live on VPS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {SIMULATIONS.map((sim) => {
            const c = COLOR_MAP[sim.color];
            const running = injecting === sim.id;
            return (
              <button
                key={sim.id}
                onClick={() => runSimulation(sim)}
                disabled={!!injecting}
                className={clsx(
                  "glass-card p-4 text-left transition-all group relative overflow-hidden",
                  running ? `${c.border} ${c.bg}` : "border-white/5 hover:" + c.border
                )}
              >
                {running && <div className={clsx("absolute inset-0 animate-pulse", c.bg)} />}

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{sim.id}</span>
                    <span className={clsx("text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest", c.badge)}>{sim.badge}</span>
                  </div>

                  <div>
                    <h4 className={clsx("text-[11px] font-black uppercase tracking-tight mb-1 transition-colors", running ? c.text : "text-white group-hover:" + c.text.replace("text-", "text-"))}>
                      {sim.name}
                    </h4>
                    <p className="text-[8px] text-slate-500 leading-relaxed">{sim.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[7px] text-slate-600 font-bold">{sim.steps.length} pasos</span>
                    <div className={clsx("flex items-center gap-1", c.text)}>
                      {running ? (
                        <><Activity className="w-3 h-3 animate-pulse" /><span className="text-[8px] font-bold">Running...</span></>
                      ) : (
                        <><Play className="w-3 h-3" /><span className="text-[8px] font-bold">Ejecutar</span></>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Log de simulación */}
        {simLog.length > 0 && (
          <div className="glass-card p-4 bg-slate-950/60 border-white/5 font-mono text-[9px] space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
            {simLog.map((line, i) => (
              <div key={i} className={clsx("flex gap-2", i === 0 ? "text-emerald-400" : "text-slate-500")}>
                <span className="text-slate-700 shrink-0">{">>"}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}
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
