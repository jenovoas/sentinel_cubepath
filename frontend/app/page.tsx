"use client";

import React, { useState, useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Shield, Clock, HardDrive, Terminal } from "lucide-react";

export default function Home() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter sentinel-gradient-text uppercase">
              Sentinel <span className="text-white opacity-90">Ring-0</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] md:pl-14">
            <span className="text-emerald-500">Cognitive Firewall</span> 
            <span className="opacity-30">|</span> 
            <span>Hackatón CubePath 2026</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 glass-card px-6 py-3 border-emerald-500/10">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Node Sovereign Identity</span>
            <span className="text-xs font-bold text-emerald-400 mono">SCL-CUBEPATH-01</span>
          </div>
          
          <div className="flex items-center gap-4 pl-6 border-l border-white/5">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> S60 Sync
              </span>
              <span className="text-sm font-bold text-white mono tabular-nums">
                {time.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard UI */}
      <Dashboard />
      
      {/* Bottom Identity Footer */}
      <footer className="pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest px-2">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               <span>Kernel Link: Solid</span>
            </div>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               <span>Ring-Buffer: Synchronized</span>
            </div>
         </div>
         <div className="flex items-center gap-2 italic opacity-50">
            Powered by S60 Sexagesimal Core
         </div>
      </footer>
    </div>
  );
}
