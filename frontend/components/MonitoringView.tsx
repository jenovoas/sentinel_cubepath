"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, Layout, Terminal, Zap, ShieldAlert, Cpu, 
  BarChart as BarChartIcon, MousePointer2, RotateCcw 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, Cell 
} from "recharts";
import { clsx } from "clsx";

interface MetricPoint {
  tick: number;
  resonance_raw: number;
  load_raw: number;
  throughput_raw: number;
  latency_ns: number;
  // Campos normalizados para visualización
  resonance: number;
  load: number;
  throughput: number;
  latency: number;
  time: string;
}

export function MonitoringView() {
  const [data, setData] = useState<MetricPoint[]>([]);
  const [error, setError] = useState(false);
  
  const apiBase = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "") : "";

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
        const url = `http://${host}:8000`;
        
        const res = await fetch(`${url}/api/v1/observability/metrics`);
        if (res.ok) {
          const rawData = await res.json();
          if (!Array.isArray(rawData)) throw new Error("Invalid data format");
          
          const normalized = rawData.map((d: any) => ({
            ...d,
            resonance: Math.abs(d.resonance_raw) / 10000,
            load: Math.abs(d.load_raw) / 1000,
            throughput: d.throughput_raw / 10,
            latency: d.latency_ns / 1000,
            time: `${d.tick}s`
          }));
          setData(normalized);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      }
    };

    fetchMetrics();
    const iv = setInterval(fetchMetrics, 2000); // Polling cada 2s para no saturar
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col space-y-6 h-full animate-in fade-in duration-700 pb-12 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Observabilidad Ring-0</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Dashboards Nativos S60 — Telemetría de VPS en Vivo</p>
        </div>
        <div className={clsx(
          "px-4 py-2 border rounded-xl flex items-center gap-3",
          error ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20"
        )}>
          <div className={clsx("w-2 h-2 rounded-full animate-pulse", error ? "bg-rose-500" : "bg-emerald-500")} />
          <span className={clsx("text-[10px] font-black tracking-widest uppercase", error ? "text-rose-400" : "text-emerald-400")}>
            {error ? "Enlace Disonante" : "Sincronía S60"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative">
        {data.length === 0 && !error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-3xl border border-white/5">
             <div className="flex flex-col items-center gap-4">
                <RotateCcw className="w-8 h-8 text-sky-500 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">Sincronizando Telemetría i64...</span>
             </div>
          </div>
        )}
        
        {/* 1. Pulso de Resonancia S60 (Área) */}
        <div className="glass-card p-6 border-white/5 bg-slate-950/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
             <Zap className="w-24 h-24 text-sky-500" />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <h2 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-300">Resonancia Cuántica S60</h2>
            </div>
            <span className="text-[9px] mono text-slate-600 uppercase">Aritmética Determinista</span>
          </div>
          <div className="h-[250px] w-full bg-slate-950/20 rounded-xl overflow-hidden border border-white/5">
            <iframe
              src={`${typeof window !== 'undefined' ? window.location.protocol : 'http:'}//${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3000/d-solo/resonance-s60/s60-quantum-resonance?orgId=1&panelId=1&theme=dark&kiosk=tv`}
              width="100%"
              height="100%"
              frameBorder="0"
            />
          </div>
        </div>

        {/* 2. Latencia Determinsta Ring-0 (Línea) */}
        <div className="glass-card p-6 border-white/5 bg-slate-950/40 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h2 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-300">Latencia de Decisión (µs)</h2>
            </div>
            <span className="text-[9px] font-black text-emerald-500/60 uppercase">Efecto XDP/LSM</span>
          </div>
          <div className="h-[250px] w-full bg-slate-950/20 rounded-xl overflow-hidden border border-white/5">
            <iframe
              src={`${typeof window !== 'undefined' ? window.location.protocol : 'http:'}//${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3000/d-solo/latency-xdp/xdp-decision-latency?orgId=1&panelId=1&theme=dark&kiosk=tv`}
              width="100%"
              height="100%"
              frameBorder="0"
            />
          </div>
        </div>

        {/* 3. Intercepciones de Seguridad (Barras) */}
        <div className="glass-card p-6 border-white/5 bg-slate-950/40 relative xl:col-span-2 overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h2 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-300">Intensidad de Amenazas eBPF (PPS)</h2>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /><span className="text-[8px] font-bold text-slate-500 uppercase">Barrera Activa</span></div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-800" /><span className="text-[8px] font-bold text-slate-500 uppercase">Capacidad Máxima</span></div>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', fontSize: '10px' }}
                />
                <Bar dataKey="throughput" radius={[2, 2, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.throughput > 400 ? '#f43f5e' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
                <div className="flex flex-col">
                   <span className="text-[8px] text-slate-500 font-black uppercase">Veredicto Ring-0</span>
                   <span className="text-sm font-black text-white uppercase italic tracking-tighter">Comparativa: Sentinel (O(1)) vs UserSpace (O(N))</span>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[7px] text-slate-600 font-bold uppercase mb-1">Ventaja Determinsta</p>
                <div className="flex items-center gap-2">
                   <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-black uppercase tracking-widest">Ahorro CPU: 62.9%</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 4. Logs Cognitivos Ring-0 (Reemplazo Visual) */}
      <div className="glass-card p-6 border-white/5 bg-slate-950/60 h-[300px] flex flex-col group">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h2 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-300">Observabilidad Histórica — Ciclo Plimpton 322</h2>
          </div>
          <div className="flex gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-800" /><div className="w-1.5 h-1.5 rounded-full bg-slate-800" /><div className="w-1.5 h-1.5 rounded-full bg-slate-800" /></div>
        </div>
        <div className="flex-1 overflow-hidden pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
           <div className="grid grid-cols-12 gap-1 h-full font-mono text-[7px] leading-tight text-slate-700">
             {Array.from({ length: 400 }).map((_, i) => (
                <div key={i} className={clsx(
                  "p-1 truncate",
                  Math.random() > 0.95 ? "text-emerald-500 font-black" : 
                  Math.random() > 0.98 ? "text-rose-500" : ""
                )}>
                  {Math.random().toString(16).slice(2, 10).toUpperCase()}
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
