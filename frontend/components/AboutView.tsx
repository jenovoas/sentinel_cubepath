"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
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
  Server,
  Layers
} from "lucide-react";
import { clsx } from "clsx";

const FEATURED_DOCS = [
  { path: "README.md", title: "Visión General del Proyecto", desc: "Qué es Sentinel Ring-0, arquitectura y despliegue.", color: "emerald", icon: Shield },
  { path: "DOCUMENTACION_TECNICA.md", title: "Documentación Técnica", desc: "Módulos, matemática S60, eBPF, y API reference.", color: "sky", icon: Terminal },
  { path: "CRYSTAL_LATTICE.md", title: "Crystal Lattice Matrix", desc: "Física piezoeléctrica, Plimpton 322 y heatmap.", color: "violet", icon: Hexagon },
];

const MODULES = [
  { icon: GitBranch, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", name: "eBPF Ring-0", badge: "< 0.04 ms", desc: "Hooks LSM en execve/file_open + XDP a velocidad de línea." },
  { icon: Hash, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", name: "Aritmética S60", badge: "±0.0077 ppm", desc: "Base-60 en i64 puro, sin floats. Precisión determinista total." },
  { icon: Hexagon, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", name: "Crystal Lattice", badge: "1024 nodos", desc: "Red de osciladores en S60 derivado de Plimpton 322." },
  { icon: Brain, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", name: "Neural LIF S60", badge: "0 floats", desc: "Red Spiking Neural Network con cifrado dinámico por pulsos." },
  { icon: Lock, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", name: "TruthSync", badge: "Plimpton 322", desc: "Certificación matemática anti AIOpsDoom." },
  { icon: Network, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20", name: "MyCNet", badge: "41.77 Hz", desc: "Red P2P mallada con sincronización holográfica YHWH." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
};

export function AboutView() {
  const [status, setStatus] = useState<any>(null);
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const fetch_ = () => fetch(`${apiBase}/api/v1/sentinel_status`).then(r => r.json()).then(setStatus).catch(() => {});
    fetch_();
    const iv = setInterval(fetch_, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const fetch_ = () => fetch(`${apiBase}/api/v1/lattice/state`).then(r => r.json()).then(d => setTick(d.global_tick)).catch(() => {});
    fetch_();
    const iv = setInterval(fetch_, 3000);
    return () => clearInterval(iv);
  }, []);

  const bioCoherencePct = status ? Math.min(100, (Math.abs(status.bio_coherence) / 12_960_000) * 100) : 0;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* ── BENTO HERO ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] -z-10 rounded-full pointer-events-none" />
        
        {/* Main Presentation Box */}
        <div className="glass-card col-span-1 lg:col-span-8 p-8 md:p-12 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700" />
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white">
                Sentinel <span className="text-emerald-400">Ring-0</span>
              </h1>
            </div>
            
            <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl font-medium mb-8">
              El <strong className="text-white">Firewall Cognitivo</strong> que intercepta Syscalls maliciosos de IA directamente en el Kernel de Linux a través de eBPF. Precisión armónica forjada en aritmética hiper-determinista Base-60.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a href="https://vps23309.cubepath.net/" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                Demo en Vivo
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href="https://github.com/jenovoas/sentinel_cubepath" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs font-black text-slate-300 uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all">
                Repositorio GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Live Metrics Sidebar Box */}
        <div className="glass-card col-span-1 lg:col-span-4 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/30 transition-colors">
           <div className="absolute bottom-0 right-0 p-24 bg-sky-500/10 rounded-full blur-[60px] group-hover:bg-sky-500/20 transition-all duration-700" />
           <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                 <div className="flex items-center gap-2 text-slate-500">
                    <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tick Core S60</span>
                 </div>
                 <span className="text-xl font-bold mono text-white tabular-nums">{tick.toLocaleString("es-CL")}</span>
              </div>
              
              <div className="space-y-4">
                 <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-400">
                       <span>Bio Coherencia</span>
                       <span className="text-violet-400">{bioCoherencePct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                       <motion.div 
                          className="h-full bg-violet-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${bioCoherencePct}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                       />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                       <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Ahorro CPU</span>
                       <p className="text-xl font-black text-emerald-400 mono">62.9%</p>
                    </div>
                    <div>
                       <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Predictividad</span>
                       <p className="text-xl font-black text-amber-400 mono">94.4%</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>

      {/* ── BENTO MODULES ── */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-3 text-slate-400">
           <Layers className="w-5 h-5 text-emerald-500" />
           <h2 className="text-xs font-black uppercase tracking-[0.25em]">Motor de Vanguardia</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod.name}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: "spring" as const, stiffness: 400 }}
              className={clsx(
                "glass-card p-6 border transition-all duration-300 relative group overflow-hidden cursor-default",
                mod.border,
                mod.bg.replace("10", "5") // Less intense background normally
              )}
            >
              <div className={clsx("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10", mod.bg)} />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2.5 rounded-xl border", mod.bg, mod.border)}>
                    <mod.icon className={clsx("w-5 h-5 drop-shadow-md", mod.color)} />
                  </div>
                  <span className="text-sm font-extrabold text-white tracking-tight">{mod.name}</span>
                </div>
                <span className={clsx("text-[9px] font-black mono px-2 py-1 rounded-md border bg-black/40", mod.border, mod.color)}>
                  {mod.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{mod.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── ARCHITECTURE VISUALIZATION ── */}
      <motion.div variants={itemVariants} className="glass-card p-6 border-white/5 relative overflow-hidden group">
         <div className="flex items-center gap-3 text-slate-400 mb-8">
            <Server className="w-5 h-5 text-sky-500" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em]">Arquitectura eBPF en Profundidad</h2>
         </div>
         
         <div className="relative z-10 py-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 px-4">
               
               {/* User Space Node */}
               <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-full md:w-64 p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20 flex col items-center flex-col text-center"
               >
                  <Brain className="w-8 h-8 text-rose-500 mb-3" />
                  <span className="text-xs font-black text-rose-400 uppercase tracking-widest">Agente de IA</span>
                  <span className="text-[9px] text-slate-500 mt-1 block font-mono">rm -rf /data | bash</span>
               </motion.div>

               {/* Connection Line (Syscall) */}
               <div className="relative flex flex-col items-center justify-center my-4 md:my-0 md:w-20">
                  <div className="hidden md:block w-full h-[2px] bg-gradient-to-r from-slate-700 via-rose-500 to-emerald-500" />
                  <div className="md:hidden h-10 w-[2px] bg-gradient-to-b from-slate-700 via-rose-500 to-emerald-500" />
                  <span className="absolute -top-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-950 px-2 rounded-full border border-white/5">Syscall</span>
               </div>

               {/* Ring-0 Node */}
               <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-full md:w-72 p-5 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.15)] z-20 flex col items-center flex-col text-center relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-[url('/matrix-bg.png')] opacity-10 mix-blend-overlay" />
                  <Shield className="w-8 h-8 text-emerald-400 mb-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Hooks LSM + XDP</span>
                  <span className="text-[9px] text-emerald-500/60 mt-1 block font-mono">Ejecución en Kernel Ring-0</span>
               </motion.div>

               {/* Buffer Line */}
               <div className="relative flex flex-col items-center justify-center my-4 md:my-0 md:w-20">
                  <div className="hidden md:block w-full h-[2px] bg-gradient-to-r from-emerald-500 via-sky-500 to-sky-500 border-dashed" />
                  <div className="md:hidden h-10 w-[2px] bg-gradient-to-b from-emerald-500 via-sky-500 to-sky-500 border-dashed" />
                  <span className="absolute -bottom-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-950 px-2 rounded-full border border-white/5">0-Copy Buffer</span>
               </div>

               {/* Rust Sentinel Node */}
               <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-full md:w-64 p-5 rounded-2xl bg-sky-950/20 border-2 border-sky-500/40 shadow-[0_0_30px_rgba(14,165,233,0.15)] z-20 flex col items-center flex-col text-center"
               >
                  <Zap className="w-8 h-8 text-sky-400 mb-3" />
                  <span className="text-xs font-black text-sky-400 uppercase tracking-widest">Motor S60 (Rust)</span>
                  <span className="text-[9px] text-sky-500/60 mt-1 block font-mono">Análisis semántico en Ring-3</span>
               </motion.div>

            </div>
         </div>
      </motion.div>

      {/* ── DOCS & FOOTER ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {FEATURED_DOCS.map((doc) => {
            const colorMeta: Record<string, { t: string, b: string }> = {
               emerald: { t: "text-emerald-400", b: "border-emerald-500/30" },
               sky: { t: "text-sky-400", b: "border-sky-500/30" },
               violet: { t: "text-violet-400", b: "border-violet-500/30" }
            };
            const c = colorMeta[doc.color];
            return (
               <Link href={`/docs/${doc.path}`} key={doc.path}>
                  <motion.div whileHover={{ y: -4 }} className="glass-card h-full p-6 border-white/5 hover:border-white/20 transition-all group flex flex-col justify-between cursor-pointer">
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
            )
         })}
      </motion.div>
    </motion.div>
  );
}
