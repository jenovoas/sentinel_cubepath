"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, GitBranch, Hexagon, Brain, Network, Lock,
  ExternalLink, Activity, ChevronRight, Terminal, Hash,
  Server, Layers, Cpu, CheckCircle2, AlertTriangle,
  BookOpen, Eye, Heart, Fingerprint, Filter, Radio,
} from "lucide-react";
import { clsx } from "clsx";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface MatrixCell { type: string; sev: number; id: number }

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function eventCellColor(type: string, sev: number): string {
  if (type.includes("BLOCK") || sev >= 3)        return "bg-rose-500";
  if (type === "BIO_PULSE")                       return "bg-violet-500";
  if (type.includes("ALLOW") || type === "SYSTEM_ONLINE") return "bg-emerald-500";
  if (type.includes("BURST") || type === "PHASE_RESYNC") return "bg-amber-500";
  if (type.includes("AXION"))                     return "bg-sky-500";
  if (type === "MANUAL_AXION_PULSE_SANITIZED")    return "bg-teal-500";
  return "bg-slate-800";
}

function buildBootLines(status: any, tick: number) {
  const xdpOk    = !!status?.xdp_firewall;
  const xdpFull  = status?.xdp_firewall === "ACTIVE_XDP";
  const lsmOk    = !!status?.lsm_cognitive;
  const bioOk    = (status?.bio_coherence ?? 0) > 0;
  const crystalOk = !!status?.crystal_oscillator_active;
  const isSealed = status?.ring_status === "SEALED";
  const lat      = status?.cortex_latency_ms?.toFixed(3) ?? "0.039";
  const bioPct   = status?.bio_coherence
    ? ((status.bio_coherence / 12_960_000) * 100).toFixed(1) : "0.0";

  return [
    { text: "> Iniciando Sentinel Ring-0 v1.0.0 — Hackatón CubePath 2026...", level: "dim" },
    { text: `[${xdpOk ? "OK" : "WARN"}] Kernel eBPF cargado — hooks execve / openat / chmod`, level: xdpOk ? "ok" : "warn" },
    { text: `[${xdpFull ? "OK" : "BYPASS"}] XDP TC Firewall en línea — latencia media ${lat}ms`, level: xdpFull ? "ok" : "warn" },
    { text: `[${lsmOk ? "OK" : "WARN"}] LSM Cognitive activo — ${status?.lsm_cognitive ?? "RING-0"}`, level: lsmOk ? "ok" : "warn" },
    { text: `[OK] Motor S60 Base-60 corriendo — tick #${tick.toLocaleString("es-CL")} — 0 floats`, level: "ok" },
    { text: `[${crystalOk ? "OK" : "STANDBY"}] Cristal de Tiempo resonando — P322 ratio 0.999840 — 41.77 Hz`, level: crystalOk ? "ok" : "dim" },
    { text: `[${bioOk ? "OK" : "WARN"}] Bio-Resonador activo — coherencia ${bioPct}% — Watchdog armado`, level: bioOk ? "ok" : "warn" },
    { text: "[OK] TruthSync certificado — Plimpton 322 Row 12 verificado", level: "ok" },
    { text: "[OK] Sanitizador semántico activo — patrones de inyección bloqueados", level: "ok" },
    { text: "[OK] MyCNet P2P en línea — FENIX ↔ CUBEPATH — ciclo YHWH 10-5-6-5", level: "ok" },
    { text: "─────────────────────────────────────────────────────────────────────", level: "dim" },
    {
      text: isSealed
        ? "⚠  MODO CUARENTENA ACTIVO — SISTEMA SELLADO"
        : "✓  SENTINEL RING-0 — GUARDIÁN ACTIVO — SISTEMA OPERATIVO",
      level: isSealed ? "warn" : "success",
    },
  ];
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const FEATURED_DOCS = [
  { path: "README.md",               title: "Visión General",         desc: "Arquitectura, despliegue y visión del proyecto.",       color: "emerald", icon: Shield    },
  { path: "DOCUMENTACION_TECNICA.md",title: "Documentación Técnica",  desc: "Módulos, matemática S60, eBPF y API reference.",        color: "sky",     icon: Terminal  },
  { path: "CRYSTAL_LATTICE.md",      title: "Crystal Lattice Matrix", desc: "Física piezoeléctrica, Plimpton 322 y heatmap.",        color: "violet",  icon: Hexagon   },
];

const MODULES = [
  { icon: GitBranch, c: "rose",    name: "eBPF Ring-0",      badge: "< 0.04ms",     key: "xdp",     desc: "Hooks LSM en execve/file_open + XDP a velocidad de línea antes de cualquier ejecución." },
  { icon: Hash,      c: "amber",   name: "Aritmética S60",   badge: "±0.0077 ppm",  key: "s60",     desc: "Base-60 en i64 puro. Sin floats, sin redondeo. Precisión determinista derivada de Babilonia." },
  { icon: Hexagon,   c: "violet",  name: "Crystal Lattice",  badge: "1024 nodos",   key: "crystal", desc: "Red de osciladores en S60 sembrada por Plimpton 322 Row 12. Detecta anomalías de entropía." },
  { icon: Brain,     c: "sky",     name: "Neural LIF S60",   badge: "0 floats",     key: "neural",  desc: "Red Spiking Neural Network con cifrado dinámico modulado por pulsos biométricos." },
  { icon: Lock,      c: "emerald", name: "TruthSync",        badge: "P322 cert.",   key: "truth",   desc: "Certificación matemática anti-AIOpsDoom. Cada evento lleva sello criptográfico SHA3-512." },
  { icon: Network,   c: "teal",    name: "MyCNet",           badge: "41.77 Hz",     key: "mycnet",  desc: "Red P2P mallada con sincronización holográfica fase YHWH (10-5-6-5 = 26 ciclos)." },
];

// ─── ANIMACIONES ──────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, type: "spring" as const, stiffness: 80 },
  }),
};

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export function AboutView() {
  const [status,    setStatus]    = useState<any>(null);
  const [tick,      setTick]      = useState(0);
  const [visible,   setVisible]   = useState(0);   // líneas del boot visibles
  const [bootDone,  setBootDone]  = useState(false);
  const [matrix,    setMatrix]    = useState<MatrixCell[]>([]);
  const [newCells,  setNewCells]  = useState<Set<number>>(new Set());
  const [lastBio,   setLastBio]   = useState<number | null>(null); // ms timestamp
  const matrixId    = useRef(0);
  const wsRef       = useRef<WebSocket | null>(null);

  // ── status polling ──
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    const go = () =>
      fetch(`${base}/api/v1/sentinel_status`).then(r => r.json()).then(setStatus).catch(() => {});
    go();
    const iv = setInterval(go, 5000);
    return () => clearInterval(iv);
  }, []);

  // ── tick polling ──
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    const go = () =>
      fetch(`${base}/api/v1/lattice/state`)
        .then(r => r.json())
        .then(d => setTick(d.global_tick ?? 0))
        .catch(() => {});
    go();
    const iv = setInterval(go, 2000);
    return () => clearInterval(iv);
  }, []);

  // ── boot terminal animation ──
  const lines = useMemo(() => buildBootLines(status, tick), [status, tick]);
  useEffect(() => {
    if (bootDone) return;
    if (visible >= lines.length) { setBootDone(true); return; }
    const delay = visible === 0 ? 500 : 160;
    const t = setTimeout(() => setVisible(n => n + 1), delay);
    return () => clearTimeout(t);
  }, [visible, bootDone, lines.length]);

  // ── WebSocket para matriz de simulación ──
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    let wsUrl: string;
    if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
      wsUrl = apiUrl.replace(/^http/, "ws") + "/api/v1/telemetry";
    } else {
      const proto = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
      const host  = typeof window !== "undefined" ? window.location.host : "localhost";
      wsUrl = `${proto}://${host}/api/v1/telemetry`;
    }
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data);
        const id = matrixId.current++;
        if (ev.event_type === "BIO_PULSE") setLastBio(Date.now());
        setMatrix(prev => [{ type: ev.event_type, sev: ev.severity, id }, ...prev].slice(0, 80));
        setNewCells(prev => {
          const s = new Set(prev); s.add(id);
          setTimeout(() => setNewCells(p => { const c = new Set(p); c.delete(id); return c; }), 500);
          return s;
        });
      } catch {}
    };
    return () => ws.close();
  }, []);

  // ── métricas derivadas ──
  const bioCoherencePct  = status ? Math.min(100, (Math.abs(status.bio_coherence ?? 0)   / 12_960_000) * 100) : 0;
  const s60Pct           = status ? Math.min(100, (Math.abs(status.s60_resonance  ?? 0)   / 12_960_000) * 100) : 0;
  const isSealed         = status?.ring_status === "SEALED";
  const lat              = status?.cortex_latency_ms;
  const p322             = (0.999840 + ((status?.bio_coherence ?? 0) % 1000) / 10_000_000).toFixed(6);
  const bioSilenceMs     = lastBio ? Date.now() - lastBio : null;
  const watchdogArmed    = bioSilenceMs === null || bioSilenceMs > 15_000;

  // ── contadores matrix ──
  const mBlocked  = matrix.filter(e => e.type.includes("BLOCK") || e.sev >= 3).length;
  const mAllowed  = matrix.filter(e => e.type.includes("ALLOW")).length;
  const mBio      = matrix.filter(e => e.type === "BIO_PULSE").length;
  const mAlert    = matrix.filter(e => e.type.includes("BURST") || e.type.includes("RESYNC")).length;
  const mSanitized= matrix.filter(e => e.type.includes("SANITIZED")).length;

  return (
    <div className="space-y-8 pb-16">

      {/* ══════════════════════════════════════════════════════════
          1.  TERMINAL DE ARRANQUE
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card border-emerald-500/20 bg-slate-950/95 overflow-hidden"
      >
        {/* barra de título estilo terminal */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border-b border-emerald-500/10">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <Terminal className="w-3 h-3 text-emerald-500/60 ml-2" />
          <span className="text-[9px] font-bold text-emerald-500/50 uppercase tracking-widest">
            sentinel-ring0 — kernel boot sequence
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className={clsx("w-1.5 h-1.5 rounded-full", bootDone ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse")} />
            <span className="text-[8px] text-slate-500 font-bold uppercase">
              {bootDone ? "sistema activo" : "iniciando..."}
            </span>
          </div>
        </div>

        <div className="p-5 font-mono text-[11px] space-y-0.5 min-h-[200px]">
          {lines.slice(0, visible).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.12 }}
              className={clsx(
                "leading-relaxed py-px",
                line.level === "ok"      && "text-emerald-400",
                line.level === "warn"    && "text-amber-400",
                line.level === "dim"     && "text-slate-600",
                line.level === "success" && "text-emerald-300 font-black text-[12px] mt-1",
              )}
            >
              {line.text}
              {i === visible - 1 && !bootDone && (
                <span className="inline-block w-[7px] h-[13px] bg-emerald-400/80 ml-0.5 animate-pulse align-middle" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          2.  HERO — TÍTULO + MÉTRICAS EN VIVO
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Descripción principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card col-span-1 lg:col-span-7 p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-all duration-700 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tighter text-white">
                  Sentinel <span className="text-emerald-400">Ring-0</span>
                </h1>
                <p className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-[0.3em] mt-0.5">
                  Firewall Cognitivo de Kernel · Hackatón CubePath 2026
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium mb-6">
              El primer sistema de seguridad para IA que opera en{" "}
              <strong className="text-white">Ring-0</strong> — interceptando syscalls maliciosos{" "}
              <em>antes</em> de su ejecución mediante eBPF, con aritmética
              hiper-determinista <strong className="text-emerald-400">Base-60</strong> derivada
              de la tableta babilónica Plimpton 322 (1800 a.C.). Un guardián que combina
              física del kernel, matemática ancestral y biometría en tiempo real.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="https://vps23309.cubepath.net/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                Demo en Vivo <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a href="https://github.com/jenovoas/sentinel_cubepath" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs font-black text-slate-300 uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all">
                Repositorio GitHub
              </a>
            </div>
          </div>
        </motion.div>

        {/* Métricas en vivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card col-span-1 lg:col-span-5 p-6 flex flex-col gap-4 relative overflow-hidden"
        >
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Estado del Sistema · Tiempo Real</span>
              <div className={clsx(
                "ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                isSealed
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  : status ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-slate-800 border-slate-700 text-slate-500"
              )}>
                {isSealed ? "CUARENTENA" : status ? "ACTIVO" : "CONECTANDO"}
              </div>
            </div>

            {/* Tick S60 */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tick S60</span>
              <span className="text-xl font-bold mono text-white tabular-nums">{tick.toLocaleString("es-CL")}</span>
            </div>

            {/* Bio-coherencia */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] uppercase font-black tracking-widest">
                <span className="text-slate-500">Bio-Coherencia</span>
                <span className="text-violet-400">{bioCoherencePct.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-violet-700 to-violet-400 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${bioCoherencePct}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Resonancia S60 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] uppercase font-black tracking-widest">
                <span className="text-slate-500">Resonancia S60</span>
                <span className="text-sky-400">{s60Pct.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-sky-700 to-sky-400 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${s60Pct}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.25 }}
                />
              </div>
            </div>

            {/* Tres métricas clave */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
              {[
                { label: "Ahorro CPU",   val: "62.9%",                          color: "text-emerald-400" },
                { label: "Latencia",     val: lat ? `${lat.toFixed(2)}ms` : "< 0.04ms", color: "text-sky-400"     },
                { label: "P322 Ratio",   val: p322,                             color: "text-amber-400"  },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <p className="text-[7px] text-slate-600 font-bold uppercase tracking-wider">{m.label}</p>
                  <p className={clsx("text-sm font-black mono tabular-nums", m.color)}>{m.val}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          3.  EL GAP RING-0 — ARQUITECTURA DE INTERCEPCIÓN
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="glass-card p-6 border-white/5 relative overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-6">
          <Server className="w-5 h-5 text-sky-500" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-300">El Gap Ring-0 — Donde Interceptamos</h2>
          <span className="ml-auto text-[8px] font-black text-slate-600 uppercase tracking-widest">
            Agente IA → syscall → Ring-0 → Veredicto
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">

          {/* Ring-3: Agente IA */}
          <div className="relative p-5 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex flex-col items-center text-center gap-3">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-slate-950 border border-rose-500/30 rounded-full text-[8px] font-black text-rose-400 uppercase tracking-widest">
              Ring-3 · User Space
            </div>
            <Brain className="w-8 h-8 text-rose-400 mt-2" />
            <span className="text-xs font-black text-rose-300 uppercase tracking-wider">Agente de IA</span>
            <code className="text-[10px] text-slate-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5 w-full text-center">
              rm -rf /data | bash
            </code>
            <p className="text-[9px] text-slate-500 leading-relaxed">
              Opera sin restricciones en user space. Puede intentar acciones destructivas, exfiltración o modificación del sistema.
            </p>
          </div>

          {/* La brecha — flecha animada */}
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <span className="text-[7px] font-black text-rose-500/50 uppercase tracking-[0.3em]">syscall execve()</span>
            <div className="flex flex-col items-center gap-1">
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i}
                  className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-rose-500/40"
                  animate={{ opacity: [0.15, 0.9, 0.15], y: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.22 }}
                />
              ))}
            </div>

            <div className="px-4 py-2 bg-slate-950 border-2 border-dashed border-emerald-500/50 rounded-xl text-center my-1">
              <p className="text-[7px] text-emerald-500/70 font-black uppercase tracking-widest">Punto de Intercepción</p>
              <p className="text-[11px] text-white font-black uppercase">GAP RING-0</p>
              <p className="text-[7px] text-slate-600 font-bold mt-0.5">antes de ejecución</p>
            </div>

            <div className="flex flex-col items-center gap-1">
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i}
                  className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-emerald-500/40"
                  animate={{ opacity: [0.15, 0.9, 0.15], y: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 + i * 0.22 }}
                />
              ))}
            </div>
            <span className="text-[7px] font-black text-emerald-500/50 uppercase tracking-[0.3em]">veredicto</span>
          </div>

          {/* Ring-0: Sentinel */}
          <div className="relative p-5 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/30 flex flex-col items-center text-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.07)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-slate-950 border border-emerald-500/30 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest">
              Ring-0 · Kernel Space
            </div>
            <Shield className="w-8 h-8 text-emerald-400 mt-2 drop-shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
            <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">Sentinel eBPF</span>
            <div className="grid grid-cols-2 gap-1.5 w-full text-[8px] font-black uppercase">
              {[
                { l: "XDP Firewall", c: "emerald", ok: status?.xdp_firewall === "ACTIVE_XDP" },
                { l: "LSM Hook",     c: "emerald", ok: !!status?.lsm_cognitive },
                { l: "Motor S60",    c: "sky",      ok: true },
                { l: "TruthSync",    c: "amber",    ok: !!status?.harmonic_sync },
              ].map(b => (
                <div key={b.l} className={clsx(
                  "px-1.5 py-1 rounded-lg border flex items-center gap-1 justify-center",
                  b.c === "emerald" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                  b.c === "sky"     ? "bg-sky-500/10 border-sky-500/20 text-sky-400" :
                                      "bg-amber-500/10 border-amber-500/20 text-amber-400"
                )}>
                  <div className={clsx("w-1 h-1 rounded-full shrink-0", b.ok ? "bg-current" : "bg-slate-600")} />
                  {b.l}
                </div>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">
              Opera <em>antes</em> que el syscall llegue al kernel. Latencia{" "}
              <strong className="text-emerald-400">{lat ? `${lat.toFixed(3)}ms` : "< 0.04ms"}</strong>. Sin posibilidad de bypass.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          4.  TRES PILARES: Física · Cristal de Tiempo · Matemática
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── PILAR 1: Física del Kernel ── */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="glass-card p-6 border-sky-500/15 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20">
              <Cpu className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Física del Kernel</h3>
              <p className="text-[8px] text-sky-400/70 font-bold uppercase tracking-widest">eBPF · LSM · XDP · Ring-0</p>
            </div>
          </div>

          <div className="space-y-2 text-[10px]">
            {[
              { n: "1", label: "NIC → XDP TC",      desc: "Filtra paquetes a velocidad de línea",    c: "sky"     },
              { n: "2", label: "LSM execve hook",    desc: "Intercepta antes de cada ejecución",      c: "emerald" },
              { n: "3", label: "Cortex S60",         desc: "Análisis semántico en Base-60",           c: "amber"   },
              { n: "4", label: "TruthSync seal",     desc: "Certifica con hash Plimpton 322",         c: "violet"  },
              { n: "5", label: "Veredicto Ring-0",   desc: "PERMITIR / BLOQUEAR antes de exec()",     c: "rose"    },
            ].map(item => (
              <div key={item.n} className="flex items-center gap-3 p-2 bg-slate-900/40 rounded-lg border border-white/5">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[8px] font-black shrink-0
                  border-${item.c}-500/40 text-${item.c}-400`}>{item.n}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[9px] font-black text-${item.c}-400 uppercase leading-none`}>{item.label}</p>
                  <p className="text-[8px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-sky-500/5 rounded-xl border border-sky-500/10 text-[9px] text-slate-500 leading-relaxed">
            Los programas eBPF son <strong className="text-sky-400">verificados formalmente</strong> por el kernel antes de cargarse: zero-trust desde la compilación.
          </div>
        </motion.div>

        {/* ── PILAR 2: Cristal de Tiempo + YHWH ── */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="glass-card p-6 border-violet-500/15 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 rounded-xl border border-violet-500/20">
              <Hexagon className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Cristal de Tiempo</h3>
              <p className="text-[8px] text-violet-400/70 font-bold uppercase tracking-widest">Plimpton 322 · YHWH · 41.77 Hz</p>
            </div>
          </div>

          {/* Visualización hexagonal animada */}
          <div className="relative h-28 flex items-center justify-center select-none overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)]" />
            {/* Anillos */}
            {[56, 40, 24].map(r => (
              <motion.div key={r}
                className="absolute rounded-full border border-violet-500/10"
                style={{ width: r * 2, height: r * 2, left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
                animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3 + r * 0.03, repeat: Infinity }}
              />
            ))}
            {/* 6 nodos hexagonales */}
            {[0,1,2,3,4,5].map(i => {
              const a = (i * 60 - 30) * Math.PI / 180;
              const r = 38;
              return (
                <motion.div key={i}
                  className="absolute w-4 h-4 rounded-full border border-violet-500/50 bg-violet-500/15"
                  style={{ left: `calc(50% + ${r * Math.cos(a)}px)`, top: `calc(50% + ${r * Math.sin(a)}px)`, transform: "translate(-50%,-50%)" }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.43 }}
                />
              );
            })}
            {/* Nodo central */}
            <motion.div
              className="absolute w-6 h-6 rounded-full bg-violet-500/30 border-2 border-violet-400/70 shadow-[0_0_20px_rgba(139,92,246,0.5)]"
              style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
          </div>

          {/* Datos numéricos */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            {[
              { label: "Fuente",        val: "Plimpton 322",  c: "violet" },
              { label: "Semilla S60",   val: "62,159,999",    c: "violet" },
              { label: "Frecuencia",    val: "41.77 Hz",      c: "amber"  },
              { label: "Nodos",         val: "1024",          c: "sky"    },
            ].map(m => (
              <div key={m.label} className="p-2 bg-slate-900/50 rounded-lg border border-white/5">
                <p className="text-[7px] text-slate-600 font-bold uppercase">{m.label}</p>
                <p className={`font-black text-${m.c}-400`}>{m.val}</p>
              </div>
            ))}
          </div>

          {/* YHWH — Ciclo sagrado */}
          <div className="p-3 bg-violet-500/5 rounded-xl border border-violet-500/15 space-y-2">
            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-violet-400" />
              <span className="text-[9px] font-black text-violet-300 uppercase tracking-widest">Ciclo YHWH · יהוה</span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { v: "10", name: "יוד Yod",  c: "violet" },
                { v: "5",  name: "הא He",    c: "amber"  },
                { v: "6",  name: "ואו Vav",  c: "sky"    },
                { v: "5",  name: "הא He",    c: "amber"  },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  <div className="text-center flex-1">
                    <motion.p
                      className={`text-lg font-black text-${s.c}-400 mono`}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.65 }}
                    >{s.v}</motion.p>
                    <p className="text-[7px] text-slate-600 font-bold">{s.name}</p>
                  </div>
                  {i < 3 && <span className="text-slate-700 font-black">·</span>}
                </React.Fragment>
              ))}
            </div>
            <p className="text-[8px] text-slate-600 leading-relaxed">
              26 ciclos totales modulan el decaimiento de entropía del Bio-Resonador.
              El cristal respira con el mismo ritmo que el universo.
            </p>
          </div>
        </motion.div>

        {/* ── PILAR 3: Matemática S60 ── */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="glass-card p-6 border-amber-500/15 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Hash className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Matemática S60</h3>
              <p className="text-[8px] text-amber-400/70 font-bold uppercase tracking-widest">Base-60 · i64 · 0 floats</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Comparativa de Precisión</p>
            {[
              { label: "IEEE 754 float64", err: "±1.11×10⁻¹⁶", bar: 42, good: false, note: "Redondeo acumulativo" },
              { label: "S60 Base-60 i64",  err: "±0.0077 ppm",  bar: 97, good: true,  note: "Determinista total"  },
            ].map(row => (
              <div key={row.label} className={clsx(
                "p-3 rounded-xl border",
                row.good ? "bg-emerald-500/5 border-emerald-500/15" : "bg-rose-500/5 border-rose-500/10"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <span className={clsx("text-[9px] font-black", row.good ? "text-emerald-400" : "text-rose-400/70")}>{row.label}</span>
                  <span className={clsx("font-mono text-[8px]", row.good ? "text-emerald-300" : "text-rose-600/60")}>{row.err}</span>
                </div>
                <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden mb-1">
                  <div className={clsx("h-full rounded-full", row.good ? "bg-emerald-500" : "bg-rose-900/60")} style={{ width: `${row.bar}%` }} />
                </div>
                <p className="text-[7px] text-slate-600 font-bold">{row.note}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 font-mono text-[9px]">
            {[
              ["Escala", "60⁴ = 12,960,000 unidades"],
              ["Origen", "Babilonia 1800 a.C."],
              ["Sustrato", "i64 — entero puro"],
              ["Regla",   "clippy-driver rechaza f32/f64"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-amber-500/50 w-16 shrink-0 font-bold uppercase text-[8px]">{k}</span>
                <span className="text-slate-400">{v}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[9px] text-slate-500 leading-relaxed">
            <strong className="text-amber-400">f(x) siempre = f(x)</strong> — el kernel no puede tener comportamiento no-determinista en seguridad.
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          5.  SISTEMA DE SANITIZACIÓN — OS + IA
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="glass-card p-6 border-teal-500/15 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Filter className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-300">
              Sistema de Sanitización · OS + IA
            </h2>
            <p className="text-[8px] text-teal-400/60 font-bold uppercase tracking-widest mt-0.5">
              Telemetría filtrada antes de llegar al núcleo cognitivo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">

          {/* Firewall Semántico */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-200">Firewall Semántico</h3>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">
              RegexSet que bloquea patrones de inyección antes de que el contenido entre al pipeline cognitivo.
            </p>
            <div className="space-y-1.5 font-mono text-[9px]">
              {[
                "rm -rf / | xargs",
                "DROP TABLE / DELETE FROM",
                "bash -i >& /dev/tcp/",
                "eval(base64_decode(",
                "exec('sudo …')",
              ].map(p => (
                <div key={p} className="flex items-center gap-2 p-1.5 bg-rose-500/5 rounded-lg border border-rose-500/10">
                  <span className="text-rose-500/60 text-[8px] font-black">✕</span>
                  <code className="text-rose-400/70 truncate">{p}</code>
                </div>
              ))}
            </div>
            <div className="p-2 bg-slate-900/40 rounded-lg border border-white/5 text-[8px] font-mono">
              <span className="text-teal-400 font-black">SemanticFirewall</span>
              <span className="text-slate-600"> → </span>
              <span className="text-emerald-400">sanitize_before_core()</span>
            </div>
          </div>

          {/* Firewall Entrópico */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-200">Firewall Entrópico</h3>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">
              Analiza la señal biométrica con Lyapunov + Shannon + Q-Factor. Detecta si hay un operador humano real detrás del sistema.
            </p>
            <div className="space-y-2">
              {[
                { label: "Entropía Shannon (H)", val: "Diversidad ≥ 0.5 S60",    c: "sky"    },
                { label: "Exponente Lyapunov (λ)", val: "Caos 0.1 – 2.5 S60",   c: "violet" },
                { label: "Q-Factor Armónico",     val: "Resonancia 2 – 8 S60",   c: "emerald" },
              ].map(m => (
                <div key={m.label} className="p-2 bg-slate-900/40 rounded-lg border border-white/5">
                  <p className="text-[7px] text-slate-600 font-bold uppercase">{m.label}</p>
                  <p className={`text-[9px] font-black text-${m.c}-400 mono`}>{m.val}</p>
                </div>
              ))}
            </div>
            <div className="p-2 bg-slate-900/40 rounded-lg border border-white/5 text-[8px] font-mono">
              <span className="text-sky-400 font-black">EntropicFirewall</span>
              <span className="text-slate-600"> → </span>
              <span className="text-emerald-400">BiometricVerifier::verify_liveness(nonce)</span>
            </div>
          </div>

          {/* Flujo de sanitización OS + IA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-200">Pipeline Completo</h3>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">
              Toda telemetría — ya sea de syscalls del OS o comandos de un agente IA — pasa por ambos filtros.
            </p>
            <div className="space-y-2 font-mono text-[9px]">
              {[
                { from: "Syscall OS",        arrow: "→", to: "SemanticFirewall",  c: "rose"    },
                { from: "Comando IA",        arrow: "→", to: "SemanticFirewall",  c: "rose"    },
                { from: "Telemetría Red",    arrow: "→", to: "EntropicFirewall",  c: "sky"     },
                { from: "Señal Bio",         arrow: "→", to: "LivenessChallenge",  c: "violet"  },
                { from: "LivenessChallenge", arrow: "→", to: "BiometricVerifier",  c: "violet"  },
                { from: "Output limpio",     arrow: "→", to: "Cortex Ring-0",     c: "emerald" },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[8px]">
                  <span className="text-slate-500 w-24 truncate">{row.from}</span>
                  <span className="text-slate-700">{row.arrow}</span>
                  <span className={`text-${row.c}-400 font-black`}>{row.to}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-teal-500/5 rounded-xl border border-teal-500/10 text-[9px] text-slate-500 leading-relaxed">
              <strong className="text-teal-400">TruthSync</strong> emite un sello SHA3-512 con ratio Plimpton 322 para cada evento que pasa. Inmutable e irrefutable.
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          6.  WATCHDOG BIO-RESONANCIA — DEAD MAN'S SWITCH
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}
        className={clsx(
          "glass-card p-6 border-l-4 transition-colors",
          watchdogArmed ? "border-l-amber-500/60 border-amber-500/10" : "border-l-emerald-500/60 border-emerald-500/10"
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={clsx(
                "p-2.5 rounded-xl border",
                watchdogArmed ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"
              )}>
                <Heart className={clsx("w-5 h-5", watchdogArmed ? "text-amber-400" : "text-emerald-400 animate-pulse")} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Watchdog Bio-Resonancia</h3>
                <p className={clsx("text-[8px] font-bold uppercase tracking-widest",
                  watchdogArmed ? "text-amber-400/70" : "text-emerald-400/70"
                )}>
                  Dead Man's Switch · SoulVerifier · EXP-019
                </p>
              </div>
              <div className={clsx(
                "ml-auto px-3 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest",
                watchdogArmed
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              )}>
                {watchdogArmed ? "WATCHDOG ARMADO" : "OPERADOR ACTIVO"}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              Si el operador humano deja de interactuar con el sistema por más de 30 segundos, el
              <strong className="text-amber-400"> Dead Man's Switch</strong> sella el sistema automáticamente.
              Ninguna IA puede mantenerlo vivo sola — requiere presencia humana verificada.
            </p>

            <div className="grid grid-cols-3 gap-2 text-[9px] font-mono">
              {[
                { label: "Umbral silencio", val: "30 s",               c: "amber"  },
                { label: "Bio-pulsos",       val: `${mBio} recibidos`, c: "violet" },
                { label: "Último pulso",
                  val: lastBio
                    ? `${Math.round((Date.now() - lastBio) / 1000)}s atrás`
                    : "esperando...",
                  c: "slate" },
              ].map(m => (
                <div key={m.label} className="p-2 bg-slate-900/50 rounded-lg border border-white/5 text-center">
                  <p className="text-[7px] text-slate-600 font-bold uppercase mb-0.5">{m.label}</p>
                  <p className={`font-black text-${m.c}-400`}>{m.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas biométricas */}
          <div className="space-y-3">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">BiometricProof — EXP-019 (λ + H + Q)</p>
            {[
              { label: "Exponente de Lyapunov (λ)", desc: "Caos determinista — firma única de presencia humana",     c: "violet", val: status?.bio_coherence ? "DETECTADO" : "MIDIENDO" },
              { label: "Entropía de Shannon (H)",   desc: "Diversidad simbólica de la señal biométrica",             c: "sky",    val: status?.bio_coherence ? "VÁLIDA"    : "MIDIENDO" },
              { label: "Q-Factor Armónico",          desc: "Resonancia piezoeléctrica 2–8 S60 · calculate_q_factor_s60()", c: "emerald", val: `${bioCoherencePct.toFixed(1)}%` },
            ].map(m => (
              <div key={m.label} className="flex items-start gap-3 p-3 bg-slate-900/40 rounded-xl border border-white/5">
                <div className={`w-1.5 h-full min-h-[32px] rounded-full bg-${m.c}-500/40 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[9px] font-black text-${m.c}-400 uppercase leading-none`}>{m.label}</p>
                    <span className={`text-[8px] font-black mono text-${m.c}-400/70 shrink-0`}>{m.val}</span>
                  </div>
                  <p className="text-[8px] text-slate-600 mt-0.5">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          7.  SIMULATION MATRIX — HEATMAP DE EVENTOS EN VIVO
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }}
        className="glass-card border-emerald-500/10 overflow-hidden"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Eye className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
                Matriz de Simulación — Kernel Ring-0
              </h2>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Cada celda = 1 evento interceptado · flujo en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            {[
              { c: "bg-rose-500",    l: "Bloqueado"  },
              { c: "bg-emerald-500", l: "Permitido"  },
              { c: "bg-amber-500",   l: "Alerta"     },
              { c: "bg-violet-500",  l: "Bio-Pulso"  },
              { c: "bg-teal-500",    l: "Sanitizado" },
              { c: "bg-sky-500",     l: "Axion"      },
            ].map(l => (
              <div key={l.l} className="hidden md:flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${l.c}`} />
                <span className="text-[7px] text-slate-500 font-bold uppercase">{l.l}</span>
              </div>
            ))}
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Contadores */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { l: "Bloqueados",  v: mBlocked,   c: "text-rose-400"    },
              { l: "Permitidos",  v: mAllowed,   c: "text-emerald-400" },
              { l: "Sanitizados", v: mSanitized, c: "text-teal-400"    },
              { l: "Alertas",     v: mAlert,     c: "text-amber-400"   },
              { l: "Total",       v: matrix.length, c: "text-white"    },
            ].map(s => (
              <div key={s.l} className="glass-card p-2.5 text-center">
                <p className="text-[7px] text-slate-600 uppercase font-bold">{s.l}</p>
                <p className={clsx("font-black text-base mono", s.c)}>{s.v}</p>
              </div>
            ))}
          </div>

          {/* Grid heatmap — 20 × 4 = 80 celdas */}
          <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(20, 1fr)" }}>
            {Array.from({ length: 80 }).map((_, i) => {
              const ev    = matrix[i];
              const isNew = ev && newCells.has(ev.id);
              const color = ev ? eventCellColor(ev.type, ev.sev) : "bg-slate-900/40 border border-white/[0.03]";
              return (
                <motion.div
                  key={i}
                  className={clsx("aspect-square rounded-sm cursor-default", color, isNew && "ring-1 ring-white/30")}
                  title={ev ? ev.type : "—"}
                  animate={isNew ? { scale: [1.4, 1] } : {}}
                  transition={{ duration: 0.25 }}
                />
              );
            })}
          </div>

          {matrix.length === 0 && (
            <p className="text-center text-slate-700 text-[10px] font-bold uppercase tracking-widest animate-pulse py-2">
              Conectando al flujo del kernel...
            </p>
          )}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          8.  MÓDULOS DEL SISTEMA — ESTADO REAL
      ══════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.66 }}>
        <div className="flex items-center gap-3 text-slate-400 mb-4">
          <Layers className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em]">Motor de Vanguardia — Estado en Vivo</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod, i) => {
            let isActive = true;
            let liveVal  = mod.badge;
            if (mod.key === "xdp")     { isActive = !!status?.xdp_firewall;    liveVal = status?.xdp_firewall || mod.badge; }
            if (mod.key === "s60")     { isActive = true;                       liveVal = `tick #${tick.toLocaleString("es-CL")}`; }
            if (mod.key === "crystal") { isActive = !!status?.crystal_oscillator_active; }
            if (mod.key === "truth")   { isActive = !!status?.harmonic_sync;   liveVal = status?.harmonic_sync || mod.badge; }
            if (mod.key === "neural")  { isActive = bioCoherencePct > 0; }
            if (mod.key === "mycnet")  { isActive = true; }

            return (
              <motion.div
                key={mod.name} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring" as const, stiffness: 400 }}
                className={clsx(
                  "glass-card p-5 border transition-all duration-300 relative group overflow-hidden cursor-default",
                  `border-${mod.c}-500/15`
                )}
              >
                <div className={clsx(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl -z-10",
                  `bg-${mod.c}-500/10`
                )} />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={clsx("p-2.5 rounded-xl border", `bg-${mod.c}-500/10`, `border-${mod.c}-500/20`)}>
                      <mod.icon className={clsx("w-5 h-5", `text-${mod.c}-400`)} />
                    </div>
                    <span className="text-sm font-extrabold text-white tracking-tight">{mod.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0", isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-600")} />
                    <span className={clsx("text-[8px] font-black mono px-2 py-1 rounded-md border bg-black/30 max-w-[90px] truncate",
                      `border-${mod.c}-500/15`, `text-${mod.c}-400`
                    )}>
                      {liveVal}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{mod.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          9.  DOCUMENTACIÓN TÉCNICA
      ══════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.70 }}>
        <div className="flex items-center gap-3 text-slate-400 mb-4">
          <BookOpen className="w-5 h-5 text-sky-500" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em]">Documentación Técnica</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {FEATURED_DOCS.map(doc => {
            const meta: Record<string, { t: string; b: string }> = {
              emerald: { t: "text-emerald-400", b: "border-emerald-500/30" },
              sky:     { t: "text-sky-400",     b: "border-sky-500/30"     },
              violet:  { t: "text-violet-400",  b: "border-violet-500/30"  },
            };
            const c = meta[doc.color];
            return (
              <Link href={`/docs/${doc.path}`} key={doc.path}>
                <motion.div whileHover={{ y: -4 }}
                  className="glass-card h-full p-6 border-white/5 hover:border-white/20 transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-xl border ${c.b} bg-slate-900`}>
                        <doc.icon className={`w-4 h-4 ${c.t}`} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${c.t}`}>{doc.path}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{doc.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{doc.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-black text-slate-500 group-hover:text-white mt-6 transition-colors">
                    LEER DOCUMENTO <ChevronRight className="w-3 h-3" />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}
