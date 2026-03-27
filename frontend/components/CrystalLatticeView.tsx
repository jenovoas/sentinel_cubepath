"use client";

import React, { useState, useEffect, useRef } from "react";
import { Cpu, Zap, Activity, Hash } from "lucide-react";

const S60_SCALE = 12_960_000;

interface NodeState {
  amplitude_raw: number;
  phase_raw: number;
  is_active: boolean;
}

interface LatticeState {
  nodes: NodeState[];
  global_coherence_raw: number;
  total_energy_raw: number;
  active_count: number;
  global_tick: number;
}

function nodeColor(amplitude_raw: number, phase_raw: number): string {
  const amp = Math.max(0, amplitude_raw) / S60_SCALE;
  if (amp === 0) return "rgba(15,23,42,0.8)"; // dark slate — silent
  const phase = ((phase_raw / S60_SCALE) * 360) % 360;
  const h = Math.round(phase < 0 ? phase + 360 : phase);
  const l = Math.round(20 + amp * 50);
  const s = Math.round(60 + amp * 40);
  return `hsl(${h},${s}%,${l}%)`;
}

export function CrystalLatticeView() {
  const [lattice, setLattice] = useState<LatticeState | null>(null);
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

    const fetchLattice = async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/lattice/state`);
        if (!res.ok) throw new Error("non-ok");
        const data: LatticeState = await res.json();
        setLattice(data);
        setError(false);
      } catch {
        setError(true);
      }
    };

    fetchLattice();
    intervalRef.current = setInterval(fetchLattice, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const coherencePct = lattice
    ? Math.min(100, (Math.abs(lattice.global_coherence_raw) / S60_SCALE) * 100)
    : 0;

  const energyPct = lattice
    ? Math.min(100, (Math.abs(lattice.total_energy_raw) / (S60_SCALE * 10)) * 100)
    : 0;

  const gridSize = 32; // 32×32 = 1024 nodes

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
            Crystal Lattice Matrix
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">
            SovereignCrystal × 1024 — S60 Piezoelectric Resonance Simulation
          </p>
        </div>
        <div className="flex items-center gap-3">
          {error ? (
            <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-black text-rose-400 tracking-widest uppercase">Offline</span>
            </div>
          ) : (
            <div className="px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[10px] font-black text-violet-400 tracking-widest uppercase">
                T={lattice?.global_tick ?? "—"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Nodes",
            value: lattice ? `${lattice.active_count} / ${lattice.nodes.length}` : "—",
            icon: Cpu,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
          },
          {
            label: "Global Coherence",
            value: lattice
              ? `${coherencePct.toFixed(1)}%`
              : "—",
            icon: Activity,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
            border: "border-violet-500/20",
          },
          {
            label: "Total Energy",
            value: lattice ? lattice.total_energy_raw.toLocaleString() : "—",
            icon: Zap,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
          },
          {
            label: "Global Tick",
            value: lattice ? lattice.global_tick.toLocaleString() : "—",
            icon: Hash,
            color: "text-sky-400",
            bg: "bg-sky-500/10",
            border: "border-sky-500/20",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`glass-card p-4 border ${stat.border} ${stat.bg} space-y-2`}
          >
            <div className="flex items-center gap-2">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                {stat.label}
              </span>
            </div>
            <p className={`text-xl font-black mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Coherence & Energy bars */}
      <div className="glass-card p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
            <span className="text-slate-500">Coherence</span>
            <span className="text-violet-400 mono">{coherencePct.toFixed(2)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${coherencePct}%`,
                background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
              }}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
            <span className="text-slate-500">Total Energy (S60)</span>
            <span className="text-amber-400 mono">{lattice?.total_energy_raw.toLocaleString() ?? "0"}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${energyPct}%`,
                background: "linear-gradient(90deg, #d97706, #fbbf24)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Node grid heatmap */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
            Node Heatmap — 32 × 32 Crystal Grid
          </h3>
          <span className="text-[8px] text-slate-600 font-mono uppercase">
            Color = phase / Brightness = amplitude
          </span>
        </div>

        {lattice && lattice.nodes.length > 0 ? (
          <div
            className="w-full"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gap: "1px",
            }}
          >
            {lattice.nodes.slice(0, gridSize * gridSize).map((node, i) => (
              <div
                key={i}
                title={`Node ${i} | amp=${node.amplitude_raw} | phase=${node.phase_raw}`}
                style={{
                  aspectRatio: "1",
                  backgroundColor: nodeColor(node.amplitude_raw, node.phase_raw),
                  borderRadius: "1px",
                  transition: "background-color 0.8s ease",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-slate-600 text-[10px] uppercase tracking-widest italic">
            {error ? "Failed to fetch lattice state" : "Loading crystal network..."}
          </div>
        )}

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(15,23,42,0.8)" }} />
            <span className="text-[8px] text-slate-600 uppercase">Silent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(160,80%,35%)" }} />
            <span className="text-[8px] text-slate-600 uppercase">Low amplitude</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(220,100%,60%)" }} />
            <span className="text-[8px] text-slate-600 uppercase">Phase ≈ 220°</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(0,100%,65%)" }} />
            <span className="text-[8px] text-slate-600 uppercase">High energy</span>
          </div>
        </div>
      </div>

      {/* Technical specs */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300 border-b border-white/5 pb-2">
          SovereignCrystal — Physical Model
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[9px] font-mono">
          {[
            { k: "Arithmetic", v: "S60 Base-60 (no floats)" },
            { k: "Natural Freq", v: "Plimpton 322 Row 12" },
            { k: "Freq Raw", v: "62,159,999 S60" },
            { k: "Damping Factor", v: "30/3600 per tick" },
            { k: "Coupling", v: "10/60 ≈ 0.1667" },
            { k: "DT per tick", v: "1/60 S60" },
          ].map((row) => (
            <div key={row.k} className="flex flex-col gap-0.5">
              <span className="text-slate-600 uppercase tracking-wider text-[8px]">{row.k}</span>
              <span className="text-slate-300 font-bold">{row.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
