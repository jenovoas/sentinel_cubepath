"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Dashboard } from "@/components/Dashboard";
import { Shield, Clock, HardDrive, Terminal, Github } from "lucide-react";

export default function Home() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden p-2 lg:p-4 space-y-2 bg-slate-950">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="space-y-1">
          <button 
            onClick={() => window.location.hash = "dashboard"}
            className="flex items-center gap-3 hover:scale-105 hover:opacity-90 active:scale-95 transition-all text-left group"
          >
            <div className="p-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="Sentinel S60" className="w-9 h-9 object-contain" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter sentinel-gradient-text uppercase">
              Sentinel <span className="text-white opacity-90 transition-opacity">Ring-0</span>
            </h1>
          </button>
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] md:pl-14">
            <span className="text-emerald-500">Firewall Cognitivo Ring-0</span>
            <span className="opacity-30">|</span>
            <span>Hackatón CubePath 2026 · MiduDev</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 glass-card px-6 py-3 border-emerald-500/10">
          <a
            href="https://github.com/jenovoas/sentinel_cubepath"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-3 pr-6 border-r border-white/5 hover:text-emerald-400 transition-colors group"
          >
            <div className="p-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
              <Github className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Repositorio</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">GitHub</span>
            </div>
          </a>

          <Link
            href="/docs"
            className="hidden sm:flex items-center gap-3 pr-6 border-r border-white/5 hover:text-emerald-400 transition-colors group"
          >
            <div className="p-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
              <Terminal className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Documentación</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">/docs</span>
            </div>
          </Link>


          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Nodo Soberano</span>
            <span className="text-xs font-bold text-emerald-400 mono">SCL-CUBEPATH-01</span>
          </div>
          
          <div className="flex items-center gap-4 pl-6 border-l border-white/5">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Reloj S60
              </span>
              <span className="text-sm font-bold text-white mono tabular-nums">
                {time ? time.toLocaleTimeString("es-CL", { hour12: false }) : "--:--:--"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard UI - Takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Dashboard />
      </div>
      
      {/* Bottom Identity Footer - Stick to bottom */}
      <footer className="shrink-0 p-2 border-t border-white/5 flex justify-between items-center text-[9px] text-slate-600 font-extrabold uppercase tracking-widest bg-slate-950/80 backdrop-blur-sm z-50">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span>Kernel Link: Activo</span>
            </div>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span>Ring-Buffer: Sincronizado</span>
            </div>
         </div>
         <div className="flex items-center gap-2 italic opacity-50">
            Hackatón CubePath 2026 · Jaime Novoa · Motor S60 Base-60
         </div>
      </footer>
    </div>
  );
}
