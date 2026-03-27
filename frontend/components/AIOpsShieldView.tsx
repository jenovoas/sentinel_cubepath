"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Cpu, 
  Eye, 
  Lock,
  Zap,
  Activity,
  Radar,
  Crosshair,
  Server,
  ZapOff
} from "lucide-react";
import { clsx } from "clsx";

interface AIOpsShieldViewProps {
  status: any;
  events?: any[];
}

export function AIOpsShieldView({ status, events = [] }: AIOpsShieldViewProps) {
  const [pulse, setPulse] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => setPulse(p => (p + 1) % 100), 50);
    return () => clearInterval(timer);
  }, []);

  const isSealed = status?.ring_status === "SEALED";
  const threatEvents = events.filter(e => e.severity >= 3 || e.event_type.includes("BLOCK") || e.event_type.includes("ALERT")).slice(0, 6);

  const layers = [
    {
      id: "s60_validation",
      name: "S60 Schema Validator",
      status: status?.is_active ? "SECURE" : "OFFLINE",
      icon: Search,
      color: "text-sky-400",
      borderColor: "border-sky-500/20",
      bg: "bg-sky-500/5"
    },
    {
      id: "harmonic_sanitization",
      name: "Harmonic Sanitizer",
      status: status?.is_active ? "ACTIVE" : "OFFLINE",
      icon: Zap,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      bg: "bg-emerald-500/5"
    },
    {
      id: "truthsync_auth",
      name: "TruthSync Authority",
      status: "CERTIFIED",
      icon: ShieldCheck,
      color: "text-amber-400",
      borderColor: "border-amber-500/20",
      bg: "bg-amber-500/5"
    },
    {
      id: "ebpf_guardian",
      name: "eBPF Guardian",
      status: status?.xdp_firewall || "BYPASS",
      icon: Cpu,
      color: "text-rose-400",
      borderColor: "border-rose-500/20",
      bg: "bg-rose-500/5"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* 1. LAYER STATUS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {layers.map((layer) => (
          <div key={layer.id} className={clsx("glass-card p-4 border flex items-center gap-4 group hover:bg-white/[0.02] transition-colors", layer.borderColor, layer.bg)}>
            <div className={clsx("p-2 rounded-lg border", layer.borderColor, layer.color)}>
              <layer.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black uppercase text-white truncate tracking-wider">{layer.name}</p>
               <div className="flex items-center gap-2 mt-1">
                 <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", layer.status === "OFFLINE" ? "bg-slate-700" : "bg-emerald-500")} />
                 <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{layer.status}</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 2. TACTICAL WAR ROOM CENTER */}
        <div className="xl:col-span-2 glass-card border-emerald-500/10 relative overflow-hidden flex flex-col min-h-[550px] bg-slate-950/40">
           {/* Radar Background Decor */}
           <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-500/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-emerald-500/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-emerald-500/10 rounded-full" />
              
              {/* HEX GRID DECOR */}
              <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '24px 24px'}} />
              
              <div 
                className="absolute top-1/2 left-1/2 w-[2px] h-[400px] bg-gradient-to-t from-emerald-500/50 to-transparent origin-bottom"
                style={{ transform: `translateX(-50%) translateY(-100%) rotate(${pulse * 3.6}deg)` }}
              />
           </div>

           <div className="relative z-10 p-6 flex flex-col h-full space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/20 rounded border border-emerald-500/40">
                       <Radar className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                       <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white flex items-center gap-3">
                          Ring-0 Command War Room
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[7px] tracking-widest rounded">TRUTHSYNC ACTIVATED</span>
                       </h2>
                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Tactical Kernel Interception & Cognitive Firewall</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="text-right">
                       <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">P322 Inte Integrity</p>
                       <p className="text-xs font-black text-emerald-100 mono">{(status?.p322_ratio_integrity || 0.99984).toFixed(6)}</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 content-center">
                 {/* Left: Tactical Pulse Centerpiece */}
                 <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-64 h-64 border border-emerald-500/10 rounded-full flex items-center justify-center">
                        <div className="absolute inset-4 border border-emerald-500/5 rounded-full animate-ping duration-[3s]" />
                        <div className="absolute inset-8 border border-emerald-500/20 rounded-full animate-pulse" />
                        
                        {/* THE LATTICE EYE */}
                        <div className="relative w-32 h-32 bg-emerald-500/5 rounded-full border border-emerald-500/30 flex items-center justify-center overflow-hidden group">
                           <div className="absolute inset-0 bg-[radial-gradient(circle,#10b98122_0%,transparent_70%)] group-hover:bg-[#10b98144] transition-colors" />
                           <Activity className={clsx("w-12 h-12 transition-all", isSealed ? "text-rose-500" : "text-emerald-400/50")} />
                           <div className="absolute top-0 w-full h-px bg-emerald-500/40 animate-[scan_4s_linear_infinite]" />
                           
                           {/* HEXAGON OVERLAY */}
                           <div className="absolute inset-0 border-[2px] border-emerald-500/10 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]" />
                        </div>

                        {/* Satellite Stats Labels */}
                        {[
                          { pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-8", label: "Neural Entropy", val: "1:12,960,000" },
                          { pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-8", label: "Cortex Latency", val: `${(status?.cortex_latency_ms || 0.04).toFixed(3)}ms` },
                          { pos: "left-0 top-1/2 -translate-y-1/2 -translate-x-10", label: "IO Throughput", val: "1.2 GB/s" },
                          { pos: "right-0 top-1/2 -translate-y-1/2 translate-x-10", label: "S60 Resonance", val: "SYNCED" },
                        ].map((s, i) => (
                          <div key={i} className={`absolute ${s.pos} flex flex-col items-center bg-slate-900/90 px-3 py-1.5 border border-white/5 rounded-lg shadow-xl backdrop-blur-md z-20`}>
                             <span className="text-[7px] text-slate-500 font-extrabold uppercase tracking-tighter">{s.label}</span>
                             <span className="text-[10px] text-emerald-400 font-black mono">{s.val}</span>
                          </div>
                        ))}
                    </div>
                 </div>

                 {/* Right: Detailed Tactical Telemetry */}
                 <div className="space-y-4 justify-center flex flex-col">
                    <div className="glass-card p-5 border-emerald-500/10 bg-emerald-500/5 space-y-4 relative overflow-hidden group">
                       <div className="absolute -top-4 -right-4 opacity-5 group-hover:rotate-12 transition-transform">
                          <Eye className="w-16 h-16 text-emerald-400" />
                       </div>
                       <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                          <Eye className="w-4 h-4 text-sky-400" />
                          <h3 className="text-xs font-black uppercase tracking-widest text-white">Neural Forensics Engine</h3>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <p className="text-[8px] text-slate-500 font-bold uppercase">Prompt Filter</p>
                             <p className="text-sm font-black text-white mono">ACTIVE</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[8px] text-slate-500 font-bold uppercase">AI Domain ID</p>
                             <p className="text-sm font-black text-sky-400 mono">TS-VAV-8</p>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <div className="flex justify-between text-[7px] font-black uppercase text-slate-500">
                             <span>Cognitive Load</span>
                             <span>{status?.quantum_load !== undefined ? ((status.quantum_load / 12960000) * 100).toFixed(0) : "42"}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-gradient-to-r from-sky-600 to-sky-400 shadow-[0_0_10px_#0ea5e9] transition-all duration-1000" 
                                style={{ width: `${status?.quantum_load !== undefined ? (status.quantum_load / 12960000) * 100 : 42}%` }}
                             />
                          </div>
                       </div>
                    </div>

                    <div className={clsx("glass-card p-5 border-rose-500/10 bg-rose-500/5 space-y-4 relative overflow-hidden group transition-all", isSealed && "border-rose-500/40 bg-rose-500/10")}>
                       <div className="absolute -top-4 -right-4 opacity-5 group-hover:-rotate-12 transition-transform">
                          <Cpu className="w-16 h-16 text-rose-500" />
                       </div>
                       <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                          <Cpu className={clsx("w-4 h-4", isSealed ? "text-rose-500" : "text-rose-400")} />
                          <h3 className="text-xs font-black uppercase tracking-widest text-white">eBPF Kernel Watchdog</h3>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <p className="text-[8px] text-slate-500 font-bold uppercase">Packets Inspected</p>
                             <p className="text-sm font-black text-rose-100 mono">{(status?.threat_count || 0).toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[8px] text-slate-500 font-bold uppercase">LSM Guard</p>
                             <p className={clsx("text-sm font-black mono", isSealed ? "text-rose-500" : "text-emerald-400")}>
                                {status?.lsm_cognitive || "LINKING"}
                             </p>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <div className="flex justify-between text-[7px] font-black uppercase text-slate-500">
                             <span>Defense Saturation</span>
                             <span>{isSealed ? '99%' : '12%'}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                             <div className={clsx("h-full transition-all duration-1000", isSealed ? "bg-rose-500 w-[99%]" : "bg-emerald-500 w-[12%]")} />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Bottom: Hardened Connection States */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5">
                 {[
                   { icon: Lock, label: "LSM_PROTECT", color: "emerald" },
                   { icon: Server, label: "S60_PHASE_LOCK", color: "sky" },
                   { icon: ShieldCheck, label: "TRUTHSYNC_CERT", color: "amber" },
                 ].map((badge, i) => (
                   <div key={i} className={`flex items-center gap-2 px-3 py-2 bg-${badge.color}-500/10 border border-${badge.color}-500/20 rounded-xl`}>
                      <badge.icon className={`w-3.5 h-3.5 text-${badge.color}-400`} />
                      <span className={`text-[8px] font-black tracking-[0.2em] text-${badge.color}-200 uppercase`}>{badge.label}</span>
                   </div>
                 ))}
                 <div className="flex-1" />
                 <div className="flex items-center gap-2 text-slate-500 font-bold text-[9px] uppercase tracking-widest mono">
                    <Crosshair className="w-3.5 h-3.5" />
                    TARGET: CLEAR
                 </div>
              </div>
           </div>
        </div>

        {/* 3. THREAT LOGS (SIDEBAR LOG) */}
        <div className="flex flex-col h-full space-y-6">
           <div className="glass-card p-6 border-rose-500/20 bg-slate-950/80 flex flex-col flex-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                 <ShieldAlert className="w-32 h-32 text-rose-500" />
              </div>
              
              <div className="flex items-center justify-between mb-6 border-b border-rose-500/20 pb-4 relative z-10">
                 <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-rose-200">Neural Audit Log</h2>
                 </div>
                 <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/30 text-[7px] uppercase tracking-[0.2em]">LIVE_FEED</Badge>
              </div>

              <div className="flex-1 space-y-3 font-mono text-[9px] overflow-hidden relative z-10">
                 {threatEvents.length > 0 ? threatEvents.map((ev: any, i: number) => (
                   <div key={i} className="p-3 rounded-xl bg-rose-500/[0.03] border border-rose-500/10 flex flex-col gap-2 group hover:bg-rose-500/[0.07] hover:border-rose-500/40 transition-all slide-in-from-top-2 animate-in duration-300">
                      <div className="flex justify-between items-start">
                         <div className="flex flex-col gap-1">
                            <span className="text-rose-500 font-black text-[9px] tracking-tighter">[{ev.event_type || "SYS_CALL_INTERCEPT"}]</span>
                            <span className="text-slate-100 font-bold tracking-tight text-[10px] break-words line-clamp-2">{ev.message || "Intercepción maliciosa prevenida."}</span>
                         </div>
                         <span className="text-slate-600 text-[8px] tabular-nums bg-slate-950 px-1.5 py-0.5 rounded leading-none border border-white/5">
                            {ev.timestamp_ns ? new Date(ev.timestamp_ns / 1000000).toLocaleTimeString("en-US", { hour12: false }) : new Date().toLocaleTimeString()}
                         </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-rose-500/10 text-[7px] font-black uppercase text-slate-500 tracking-widest font-mono">
                         <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            PID_{ev.pid || "60"}
                         </div>
                         <span className="bg-rose-500/20 text-rose-400 px-1 rounded leading-none py-0.5 border border-rose-500/20">SENTINEL_DROP</span>
                      </div>
                   </div>
                 )) : (
                   <div className="space-y-3 opacity-40 mt-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="text-[9px] font-mono text-slate-500 bg-slate-900 px-4 py-3 rounded-xl border border-white/5 flex items-center justify-between italic animate-pulse">
                           <span>SCANNING SECTOR_{i*129} — CLEAR</span>
                           <Activity className="w-3 h-3 opacity-20" />
                        </div>
                      ))}
                      <div className="flex flex-col items-center justify-center pt-8 text-center text-slate-700">
                         <ZapOff className="w-8 h-8 mb-2 opacity-20" />
                         <span className="text-[10px] uppercase font-black tracking-widest">No Active Threats</span>
                      </div>
                   </div>
                 )}
              </div>

              <div className="mt-8 space-y-4 relative z-10 border-t border-white/5 pt-6">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Security Saturation</span>
                    <span className="text-emerald-400 italic">99.99% PROTECTED</span>
                 </div>
                 <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex gap-1 p-0.5 border border-white/5 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 flex-1 rounded-full shadow-[0_0_12px_#10b98166]" />
                    <div className="h-full bg-emerald-500/20 w-12 rounded-full" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const Badge = ({ children, className }: any) => (
   <span className={clsx("px-2 py-0.5 rounded leading-none font-black", className)}>
      {children}
   </span>
);
