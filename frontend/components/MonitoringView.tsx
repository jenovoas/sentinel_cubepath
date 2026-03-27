"use client";

import React from "react";
import { Activity, Layout, Terminal } from "lucide-react";

export function MonitoringView() {
  const grafanaUrl = "http://vps23309.cubepath.net:3001";
  
  return (
    <div className="flex flex-col space-y-6 h-full animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Visual Matrix Monitoring</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Real-time Ring-0 Observability & Cognitive Logs</p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">Streams Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[500px]">
        {/* System Resources (CPU/RAM) */}
        <div className="glass-card overflow-hidden h-full border-white/5 bg-slate-950/40">
           <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-slate-900/40">
             <Layout className="w-3.5 h-3.5 text-sky-400" />
             <h2 className="text-[10px] font-extrabold uppercase tracking-[.2em] text-slate-300">Hard-Metrics Monitor</h2>
           </div>
           <iframe 
              src={`${grafanaUrl}/d-solo/system-metrics/securepenguin-servidores-y-filesystem?orgId=1&panelId=11&theme=dark&kiosk`}
              width="100%" 
              height="100%" 
              frameBorder="0"
              className="opacity-80 hover:opacity-100 transition-opacity"
           />
        </div>

        {/* Ring-0 Threats & Resonance */}
        <div className="glass-card overflow-hidden h-full border-white/5 bg-slate-950/40">
           <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-slate-900/40">
             <Activity className="w-3.5 h-3.5 text-rose-400" />
             <h2 className="text-[10px] font-extrabold uppercase tracking-[.2em] text-slate-300">S60 Resonance Pulse</h2>
           </div>
           <iframe 
              src={`${grafanaUrl}/d-solo/sentinel-ring0/sentinel-ring0-operations?orgId=1&panelId=1&theme=dark&kiosk`}
              width="100%" 
              height="100%" 
              frameBorder="0"
              className="opacity-80 hover:opacity-100 transition-opacity"
           />
        </div>
      </div>

      {/* Cognitive Logs Panel */}
      <div className="glass-card overflow-hidden h-[400px] border-white/5 bg-slate-950/60">
         <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-slate-900/40">
           <Terminal className="w-3.5 h-3.5 text-amber-400" />
           <h2 className="text-[10px] font-extrabold uppercase tracking-[.2em] text-slate-300">Ring-0 Cognitive Logs Feed (Loki)</h2>
         </div>
         <iframe 
            src={`${grafanaUrl}/d-solo/sentinel-ring0/sentinel-ring0-operations?orgId=1&panelId=3&theme=dark&kiosk`}
            width="100%" 
            height="100%" 
            frameBorder="0"
            className="filter grayscale brightness-125 contrast-125"
         />
      </div>
    </div>
  );
}
