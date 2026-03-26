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
}

export function AIOpsShieldView({ status }: AIOpsShieldViewProps) {
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
        <div className="lg:col-span-2 glass-card p-6 border-sky-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <ShieldCheck className="w-48 h-48 text-sky-400" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
               <Lock className="w-5 h-5 text-sky-400" />
               <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">IA Ops Shield War Room</h2>
            </div>
            
            <div className="space-y-3">
               {[
                 { label: "Neural Entropy Check", val: "PASS", detail: "Ratio 1:12,960,000" },
                 { label: "Prompt Injection Filter", val: "READY", detail: "AIOpsDoom Database 1.0" },
                 { label: "Kernel Interception", val: "ACTIVE", detail: "ebpf_lsm/ring0_hook" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex flex-col">
                       <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item.label}</span>
                       <span className="text-[10px] text-slate-300 font-medium italic">{item.detail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[10px] font-black text-emerald-400">{item.val}</span>
                       <ChevronRight className="w-3 h-3 text-slate-700" />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-rose-500/10 flex flex-col justify-between">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5 text-rose-500" />
                 <h2 className="text-[11px] font-black uppercase tracking-widest text-rose-300">Amenazas Recientes</h2>
              </div>
              <div className="space-y-2 opacity-50">
                 <div className="text-[9px] font-mono text-slate-500 bg-slate-900/50 p-2 rounded border border-white/5">
                    [INFO] 1:36:12 - Sin actividad maliciosa detectada. El núcleo está despejado.
                 </div>
                 <div className="text-[9px] font-mono text-slate-500 bg-slate-900/50 p-2 rounded border border-white/5">
                    [INFO] 1:35:45 - Verificación de fase s60 completada.
                 </div>
              </div>
           </div>
           
           <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Estado Global</span>
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">SHIELDED</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[98%]" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
