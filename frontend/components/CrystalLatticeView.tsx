"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Cpu, Zap, Activity, Hash, Play, RotateCcw, ShieldCheck, 
  AlertTriangle, ShieldAlert, Lock, Microscope, Thermometer, Waves
} from "lucide-react";
import { clsx } from "clsx";
import { useTelemetry } from "../hooks/useTelemetry";

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

interface SimStep { idx: number; energy: number; delay_ms: number; label: string; }
interface Simulation {
  id: string; name: string; badge: string; color: string;
  desc: string; ref: string;
  steps: SimStep[];
}

const S60_FULL = 12_960_000;

const RESONANCE_EXPERIMENTS: Simulation[] = [
  {
    id: "EXP-035",
    name: "Propagación Onda Cristal",
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
      { idx: 528, energy: S60_FULL * 10/10, delay_ms: 0,   label: "YOD" },
      { idx: 500, energy: S60_FULL * 5/10,  delay_ms: 420, label: "HE" },
      { idx: 556, energy: S60_FULL * 6/10,  delay_ms: 750, label: "VAV" },
      { idx: 496, energy: S60_FULL * 5/10,  delay_ms: 1050,label: "HE" },
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


function nodeColor(cell: CellSnapshot): string {
  const amp = Math.max(0, cell.amplitude_raw) / S60_SCALE;
  if (cell.metadata === "BLOQUEADO") return "#f43f5e";
  if (cell.metadata === "PERMITIDO") return "#10b981";
  if (cell.metadata === "BIO-PULSO") return "#8b5cf6";
  if (cell.metadata === "AXION") return "#3b82f6";
  if (amp === 0) return "rgba(15,23,42,0.85)";
  const phase = ((cell.phase_raw / S60_SCALE) * 360) % 360;
  const h = Math.round(phase < 0 ? phase + 360 : phase);
  const l = Math.round(15 + amp * 60);
  const s = Math.round(50 + amp * 50);
  return `hsl(${h},${s}%,${l}%)`;
}

function membraneColor(potential_raw: number, last_spike_ns: number, now_ns: number): string {
  const potential = Math.min(1, potential_raw / S60_SCALE);
  const timeSinceSpike = (now_ns - last_spike_ns) / 1_000_000;
  if (timeSinceSpike < 200 && last_spike_ns > 0) {
    const intensity = 1 - (timeSinceSpike / 200);
    return `rgba(255, 255, 255, ${0.4 + intensity * 0.6})`;
  }
  if (potential === 0) return "rgba(30, 41, 59, 0.5)";
  return `rgba(56, 189, 248, ${0.2 + potential * 0.8})`;
}

export function CrystalLatticeView() {
  const { connected, status, events, tick } = useTelemetry();
  const [lattice, setLattice] = useState<LatticeState | null>(null);
  const [neural, setNeural] = useState<NeuralState | null>(null);
  const [injecting, setInjecting] = useState<string | null>(null);
  const [errorLocal, setErrorLocal] = useState(false);
  const [nowNs, setNowNs] = useState(Date.now() * 1_000_000);

  const apiBase = `/api`;

  // Fetch de estados densos (Lattice/Neural)
  useEffect(() => {
    if (!connected) return;

    const fetchDenseStates = async () => {
      try {
        const [latRes, neuRes] = await Promise.all([
          fetch(`${apiBase}/api/v1/lattice/state`),
          fetch(`${apiBase}/api/v1/neural/state`)
        ]);
        if (latRes.ok) setLattice(await latRes.json());
        if (neuRes.ok) setNeural(await neuRes.json());
        setErrorLocal(false);
      } catch {
        setErrorLocal(true);
      }
      setNowNs(Date.now() * 1_000_000);
    };

    fetchDenseStates();
    const iv = setInterval(fetchDenseStates, 1500);
    return () => clearInterval(iv);
  }, [connected, apiBase]);

  const [simLog, setSimLog] = useState<string[]>([]);

  const triggerPattern = async (sim: Simulation) => {
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
          const data = await res.json();
          setSimLog(l => [`[${data.tick}] ${step.label} → n°${step.idx} E=${(step.energy / 12960000).toFixed(2)}°S60`, ...l].slice(0, 10));
        }
      } catch {}
    }
    setTimeout(() => setInjecting(null), 800);
  };

  const matrixEvents = events.filter(e => e.event_type === "MATRIX_SYNC").slice(0, 5);
  const coherencePct = status?.integrity?.s60_resonance ? Math.min(100, (Math.abs(status.integrity.s60_resonance) / S60_SCALE) * 100) : 0;
  const neuralFiringPct = neural ? Math.min(100, (neural.global_firing_rate_raw / S60_SCALE) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20">
            <Microscope className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Laboratorio S60</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Inspección Ring-0 Crystal & Neural — Telemetría de Cristales</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="glass-card px-4 py-2 border-white/5 flex items-center gap-3">
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 mono font-bold bg-white/5 px-2 py-0.5 rounded">TICK: {tick.toString().padStart(8, '0')}</span>
                <span className="text-[10px] text-emerald-500 mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded mt-1">COH: {Math.round(coherencePct)}%</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {RESONANCE_EXPERIMENTS.map(sim => (
           <button key={sim.id} onClick={() => triggerPattern(sim)} className="glass-card p-4 border-white/5 hover:border-sky-500/20 transition-all text-left group">
              <span className="text-[8px] font-black text-slate-600 block mb-1 uppercase">{sim.id}</span>
              <h4 className="text-xs font-black text-white group-hover:text-sky-400 mb-2 uppercase">{sim.name}</h4>
              <p className="text-[9px] text-slate-500 leading-tight mb-3">{sim.desc}</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                 <span className="text-[8px] text-slate-600 font-bold">{sim.steps.length} STEPS</span>
                 <Play className="w-3 h-3 text-sky-500" />
              </div>
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card border-sky-500/20 bg-slate-950/80 relative overflow-hidden flex flex-col justify-center items-center min-h-[500px]">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 border border-sky-500/20 rounded-full" />
          </div>
          <div className="relative z-10 w-full max-w-[480px] aspect-square grid gap-[1px]" style={{ gridTemplateColumns: `repeat(${LATTICE_GRID}, 1fr)` }}>
            {lattice?.lattice.map((cell, i) => (
              <div key={i} className={clsx("aspect-square rounded-[1px] transition-all duration-300", cell.amplitude_raw > 0 ? "scale-110 z-10" : "opacity-30")}
                style={{ backgroundColor: nodeColor(cell) }} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card p-5 border-white/5 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                 <Activity className="w-4 h-4 text-sky-400" /> Membrana Neural LIF
              </h3>
              <div className="grid grid-cols-10 gap-1">
                {neural?.membranes.map((m, i) => (
                  <div key={i} className="aspect-square rounded-sm" style={{ backgroundColor: membraneColor(m.potential_raw, m.last_spike_ns, nowNs) }} />
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-black uppercase text-slate-500">
                  <span>Firing Rate</span>
                   <span className="text-sky-400">{Math.round(neuralFiringPct)}%</span>
                </div>
                <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                   <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${neuralFiringPct}%` }} />
                </div>
              </div>
           </div>

           <div className="glass-card p-5 border-white/5 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                 <Zap className="w-4 h-4 text-emerald-400" /> Log de Ticks S60
              </h3>
              <div className="space-y-1.5 font-mono text-[9px]">
                {matrixEvents.map((ev, i) => (
                  <div key={ev.timestamp_ns} className="flex justify-between text-slate-500 border-b border-white/5 pb-1">
                    <span className="text-emerald-400">TICK_{ev.timestamp_ns.toString().slice(-6)}</span>
                     <span>S60: {Math.round((ev.entropy_s60_raw / S60_SCALE) * 100)}%</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
