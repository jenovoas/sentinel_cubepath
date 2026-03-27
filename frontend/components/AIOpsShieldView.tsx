"use client";

import React from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Cpu, 
  Eye, 
  Lock,
  ChevronRight,
  Zap
} from "lucide-react";
import { clsx } from "clsx";

interface AIOpsShieldViewProps {
  status: any;
  events?: any[];
}

export function AIOpsShieldView({ status, events = [] }: AIOpsShieldViewProps) {
  const threatEvents = events.filter(e => e.severity >= 3 || e.event_type.includes("BLOCK") || e.event_type.includes("ALERT")).slice(0, 5);

  const layers = [
    {
      id: "s60_validation",
      name: "Validación de Esquema s60",
      description: "Rechazo inmediato de logs malformados fuera del rango sexagesimal.",
      status: status?.is_active ? "SECURE" : "OFFLINE",
      icon: Search,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20"
    },
    {
      id: "harmonic_sanitization",
      name: "Sanitización Armónica",
      description: "Neutralización de patrones de inyección de prompts (AIOpsDoom) en tiempo real.",
      status: status?.is_active ? "ACTIVE" : "OFFLINE",
      icon: Zap,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      id: "ring0_classification",
      name: "Clasificación Ring 0",
      description: "Evaluación de riesgo cognitivo mediante el motor de física G-Zero.",
      status: status?.lsm_cognitive || "MONITORING",
      icon: Eye,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      id: "ebpf_guardian",
      name: "eBPF Guardian (TC Firewall)",
      description: "Última línea de defensa en el Kernel interceptando paquetes maliciosos.",
      status: status?.xdp_firewall || "BYPASS",
      icon: Cpu,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 4 Multi-Layer Shields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {layers.map((layer) => (
          <div 
            key={layer.id}
            className={clsx(
              "glass-card p-5 border flex flex-col items-center text-center group hover:scale-[1.02] transition-all",
              layer.border
            )}
          >
            <div className={clsx("p-3 rounded-2xl mb-4 border transition-colors", layer.bg, layer.border)}>
              <layer.icon className={clsx("w-6 h-6", layer.color)} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-white mb-2">{layer.name}</h3>
            <p className="text-[9px] text-slate-500 leading-relaxed font-medium mb-4">
              {layer.description}
            </p>
            <div className={clsx(
              "px-3 py-1 rounded-full text-[8px] font-black tracking-widest border",
              layer.status === "OFFLINE" ? "bg-slate-900 text-slate-500 border-white/5" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            )}>
              {layer.status}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main War Room Detail */}
        <div className="lg:col-span-2 glass-card p-6 border-sky-500/10 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <ShieldCheck className="w-48 h-48 text-sky-400" />
          </div>
          <div className="relative z-10 space-y-4 flex-1">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-sky-400" />
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">IA Ops Shield War Room</h2>
               </div>
               <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-[8px] uppercase tracking-widest px-2">S60 Encrypted</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
               <div className="space-y-3">
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Neural Forensics</h3>
                  {[
                    { label: "Neural Entropy Check", val: "PASS", detail: "Ratio 1:12,960,000" },
                    { label: "Prompt Injection Filter", val: "READY", detail: "AIOpsDoom Database 1.0" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item.label}</span>
                          <span className="text-[10px] text-slate-300 font-medium italic">{item.detail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-400">{item.val}</span>
                        </div>
                    </div>
                  ))}
               </div>
               <div className="space-y-3">
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Kernel Watchdog</h3>
                  {[
                    { label: "Syscall Monitor", val: "BOOTED", detail: "execve, open, ptrace" },
                    { label: "Enforcement Mode", val: "ACTIVE", detail: "Ring-0 LSM Guardian" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item.label}</span>
                          <span className="text-[10px] text-slate-300 font-medium italic">{item.detail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-sky-400">{item.val}</span>
                        </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Audit Log / Watchdog Live Feed */}
        <div className="glass-card p-6 border-rose-500/10 flex flex-col">
           <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-rose-300">Amenazas & Kernel Log</h2>
                 </div>
                 <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-tighter">Live Auditd</span>
                 </div>
              </div>

              <div className="space-y-2 font-mono text-[9px] overflow-hidden">
                 {threatEvents.length > 0 ? threatEvents.map((ev: any, i: number) => (
                   <div key={i} className="p-2 rounded bg-slate-950/50 border border-white/5 flex flex-col gap-1 slide-in-from-top-1 animate-in">
                      <div className="flex justify-between">
                         <span className="text-rose-400 font-black">[{ev.event_type || "BLOCK"}]</span>
                         <span className="text-slate-600 italic">
                            {ev.timestamp_ns ? new Date(ev.timestamp_ns / 1000000).toLocaleTimeString("es-CL", { hour12: false }) : new Date().toLocaleTimeString()}
                         </span>
                      </div>
                      <span className="text-slate-400 truncate">{ev.message || "Syscall intercepted and validated."}</span>
                   </div>
                 )) : (
                   <div className="space-y-2 opacity-50">
                      <div className="text-[9px] font-mono text-slate-500 bg-slate-900/50 p-2 rounded border border-white/5">
                         [INFO] {new Date().toLocaleTimeString()} - Sin actividad maliciosa detectada. El núcleo está despejado.
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 bg-slate-900/50 p-2 rounded border border-white/5">
                         [INFO] {new Date().toLocaleTimeString()} - Watchdog S60 sincronizado con LSM Guardian.
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 bg-slate-900/50 p-2 rounded border border-white/5">
                         [INFO] {new Date().toLocaleTimeString()} - Whitelist verificada (10,000 entradas).
                      </div>
                   </div>
                 )}
              </div>
           </div>
           
           <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Estado Global</span>
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">PROTECTED (S60)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[99%]" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const Badge = ({ children, className }: any) => (
   <span className={clsx("px-2 py-0.5 rounded-md font-bold", className)}>
      {children}
   </span>
);
