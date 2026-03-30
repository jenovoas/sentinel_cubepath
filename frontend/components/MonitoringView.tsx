"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, Layout, Terminal, Zap, ShieldAlert, Cpu, 
  RotateCcw, Network, Server, ShieldCheck, Fingerprint
} from "lucide-react";
import { clsx } from "clsx";

interface MetricPoint {
  tick: number;
  resonance_raw: number;
  load_raw: number;
  throughput_raw: number;
  latency_ns: number;
  resonance: number;
  load: number;
  throughput: number;
  latency: number;
  time: string;
}

const IframePanel = ({ title, icon, panelId, color, height = "180px", className = "" }: any) => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const src = `https://${host}/grafana/d-solo/sentinel-ring0-overview/sentinel-ring-0-overview?orgId=1&panelId=${panelId}&theme=dark&from=now-15m&to=now&refresh=5s&kiosk`;
  
  const borders: Record<string, string> = {
    slate: "border-slate-500/20",
    sky: "border-sky-500/20",
    emerald: "border-emerald-500/20",
    rose: "border-rose-500/20",
    amber: "border-amber-500/20",
  };
  const borderColor = borders[color] || "border-white/5";

  const iconsCol: Record<string, string> = {
    slate: "text-slate-400",
    sky: "text-sky-400",
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
  };
  const iconColor = iconsCol[color] || "text-slate-400";

  return (
    <div className={clsx("glass-card p-3 border-white/5 bg-slate-950/40 relative overflow-hidden group flex flex-col glow-on-hover transition-all duration-700", className)}>
      <div className={clsx("w-full rounded-xl overflow-hidden border relative group flex-1 bg-black/40 shadow-inner", borderColor)} style={{ minHeight: height }}>
         <div className={clsx("absolute inset-0 pointer-events-none border opacity-30 group-hover:opacity-100 rounded-xl z-10 transition-opacity duration-700", borderColor)} />
         <iframe
            src={src}
            width="100%"
            height="100%"
            frameBorder="0"
            className="absolute inset-0 brightness-[1.1] contrast-[1.2] opacity-85 hover:opacity-100 mix-blend-screen transition-all duration-700"
         />
      </div>
    </div>
  );
};

export function MonitoringView() {
  const [data, setData] = useState<MetricPoint[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
        const res = await fetch(`http://${host}:8000/api/v1/observability/metrics`);
        if (res.ok) {
          const rawData = await res.json();
          if (Array.isArray(rawData)) setData(rawData);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      }
    };
    fetchMetrics();
    const iv = setInterval(fetchMetrics, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col space-y-8 h-full animate-in fade-in duration-700 pb-12 overflow-y-auto custom-scrollbar pr-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Observabilidad Multi-Capa</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Inspección de Espectro Completo — Prometheus, Loki & Grafana</p>
        </div>
        <div className={clsx(
          "px-4 py-2 border rounded-xl flex items-center gap-3 shrink-0",
          error ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20"
        )}>
          <div className={clsx("w-2 h-2 rounded-full animate-pulse", error ? "bg-rose-500" : "bg-emerald-500")} />
          <span className={clsx("text-[10px] font-black tracking-widest uppercase", error ? "text-rose-400" : "text-emerald-400")}>
            {error ? "Enlace Disonante" : "Sincronía Total S60"}
          </span>
        </div>
      </div>

      {data.length === 0 && !error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
           <div className="flex flex-col items-center gap-4">
              <RotateCcw className="w-8 h-8 text-sky-500 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">Desplegando Matrices de Datos...</span>
           </div>
        </div>
      )}

      {/* SECCIÓN 1: INFRAESTRUCTURA (PROMETHEUS) */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-white/5 pb-2">
           <Server className="w-5 h-5 text-slate-400" />
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Infraestructura Core (Prometheus)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
           <IframePanel title="CPU Usage" icon={<Cpu className="w-4 h-4" />} panelId={1} color="slate" />
           <IframePanel title="RAM Usage" icon={<Activity className="w-4 h-4" />} panelId={2} color="slate" />
           <IframePanel title="CPU & RAM Timeline" icon={<Activity className="w-4 h-4" />} panelId={5} color="slate" className="md:col-span-2 xl:col-span-2" />
        </div>
      </section>

      {/* SECCIÓN 2: REDES Y TRÁFICO */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-white/5 pb-2">
           <Network className="w-5 h-5 text-sky-400" />
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">Redes y Syscalls (Tráfico eBPF)</h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
           <IframePanel title="Métricas de Entrada (In)" icon={<Activity className="w-4 h-4" />} panelId={3} color="sky" />
           <IframePanel title="Métricas de Salida (Out)" icon={<Activity className="w-4 h-4" />} panelId={4} color="sky" />
        </div>
      </section>

      {/* SECCIÓN 3: RESONANCIA Y CRISTALES S60 */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-white/5 pb-2">
           <Zap className="w-5 h-5 text-emerald-400" />
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Lattice de Cristales S60 y Coherencia</h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
           <IframePanel title="S60 Resonance Score" icon={<Activity className="w-4 h-4" />} panelId={7} color="emerald" height="180px" />
           <IframePanel title="System Bio-Coherence" icon={<Fingerprint className="w-4 h-4" />} panelId={8} color="emerald" height="180px" />
        </div>
      </section>

      {/* SECCIÓN 4: DEFENSA Y AUDITORÍA LOKI */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-white/5 pb-2">
           <ShieldAlert className="w-5 h-5 text-rose-500" />
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-rose-400">Auditoría Activa (Intercepts & Loki Logs)</h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
           {/* Columna Izquierda: Amenazas */}
           <div className="flex flex-col gap-4">
               <IframePanel title="Ring-0 Intercepts" icon={<ShieldCheck className="w-4 h-4" />} panelId={9} color="rose" height="180px" />
               <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 flex items-center justify-between mt-auto">
                 <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                    <div className="flex flex-col">
                       <span className="text-[8px] text-slate-500 font-black uppercase">Veredicto Ring-0</span>
                       <span className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase italic tracking-tighter truncate">Comparativa eBPF O(1) vs Ruteo O(N)</span>
                    </div>
                 </div>
                 <div className="text-right shrink-0">
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest leading-tight">Confirmado<br/>&lt; 0.1ms</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Columna Derecha: Loki */}
           <IframePanel title="Sentinel Audit & Event Stream" icon={<Terminal className="w-4 h-4" />} panelId={6} color="amber" height="100%" className="min-h-[260px] h-full" />
        </div>
      </section>

    </div>
  );
}
