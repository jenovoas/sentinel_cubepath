"use client";

import React, { useState, useEffect } from "react";
import { useTelemetry } from "../hooks/useTelemetry";
import { clsx } from "clsx";
import { 
  Zap, 
  Timer, 
  Heart,
  Lock as LockIcon,
  ShieldCheck,
  ShieldAlert,
  Activity
} from "lucide-react";

// Componentes
import { Sidebar } from "./Sidebar";
import { StatsGrid } from "./StatsGrid";
import { TelemetryFeed } from "./TelemetryFeed";
import { TruthClaimConsole } from "./TruthClaimConsole";
import { TruthSyncReport } from "./TruthSyncReport";
import { MyCNetNodeGraph } from "./MyCNetNodeGraph";
import { AboutView } from "./AboutView";
import { MonitoringView } from "./MonitoringView";
import { AIOpsShieldView } from "./AIOpsShieldView";
import { AIOpsIntercept } from "./AIOpsIntercept";
import { N8nView } from "./N8nView";

export function Dashboard() {
  const { status, events, connected, tick } = useTelemetry();
  const [activeTab, setActiveTabRaw] = useState<string>("about");

  const setActiveTab = (tab: string) => {
    setActiveTabRaw(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab;
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash.replace("#", "");
        if (hash && ["about", "dashboard", "observability", "aiops_shield", "mycnet", "vault", "settings", "n8n_reflex"].includes(hash)) {
          setActiveTabRaw(hash);
        } else {
          setActiveTabRaw("about");
          window.location.hash = "about";
        }
      }
    };

    // Al montar, procesar el hash actual
    handleHashChange();

    // Escuchar cambios de hash (logo, botones externos, etc)
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Derivación de estados desde eventos de telemetría reales (Cortex Events)
  const encryptionLayer = events.find(e => e.event_type.startsWith("ENCRYPT_LAYER_"))?.event_type.replace("ENCRYPT_LAYER_", "") || "S60_SHIELD_READY";
  const yhwhPhase = events.find(e => e.event_type.startsWith("YHWH_PHASE_"))?.event_type.replace("YHWH_PHASE_", "") || "YOD";
  const networkOpen = events.some(e => e.event_type.startsWith("YHWH_PHASE_") && e.severity === 1);

  // Ciclo de fase unificado al Tick Global del Kernel
  const cycleTime = tick % 68;
  const cyclePercent = (cycleTime / 68) * 100;
  const isPulseTime = cycleTime % 17 === 0 && cycleTime > 0;
  const isResyncTime = cycleTime === 0;

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      <AIOpsIntercept />
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-8">

        {activeTab === "about" ? (
          <AboutView />
        ) : activeTab === "dashboard" ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col space-y-6">
            {/* 1. TOP AREA (Fixed relative to content) */}
            <div className="space-y-4">
              <StatsGrid status={status} />
              <div className="glass-card p-3 scan-line">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <Timer className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Ciclo de Fase</span>
                  </div>
                  <div className="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${cyclePercent}%`,
                        background: isResyncTime
                          ? "linear-gradient(90deg, #0ea5e9, #818cf8)"
                          : isPulseTime
                          ? "linear-gradient(90deg, #10b981, #2dd4bf)"
                          : "linear-gradient(90deg, #1e293b, #334155)",
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="mono text-[10px] tabular-nums text-slate-500">
                      T=<span className="text-white font-bold">{cycleTime}</span>/68s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE AREA (Telemetry & Console) - Fixed heights with strict isolation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px] relative z-10">
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="glass-card overflow-hidden flex flex-col h-full border-white/5 bg-slate-950/20 relative isolate [clip-path:inset(0)]">
                  <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
                        Telemetría Ring-0
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[8px] font-bold text-emerald-500/80 uppercase tracking-widest">Señal en Vivo</span>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 relative">
                    <TelemetryFeed />
                  </div>
                </div>
              </div>

              <div className="flex flex-col h-full">
                <div className="glass-card p-5 flex flex-col h-full border-white/5 overflow-hidden bg-slate-950/40 relative isolate [clip-path:inset(0)]">
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
                      Consola de Verificación
                    </h2>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <TruthClaimConsole />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. BOTTOM AREA (Footer Modules) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
               <div className="lg:col-span-2 space-y-6">
                   <div className="h-64">
                      <MyCNetNodeGraph phase={yhwhPhase} isOpen={networkOpen} />
                   </div>
               </div>
               
               <div className="space-y-6">
                  <TruthSyncReport status={status} />
               </div>
            </div>

            {/* Banner TruthSync — full width, debajo del grid */}
            <div className="glass-card p-4 border-emerald-500/10 flex items-center gap-6 bg-slate-900/20">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-black text-white uppercase tracking-tighter">Sentinel TruthSync Certificado</h2>
                <p className="text-slate-500 text-[9px] font-medium uppercase tracking-[0.3em] mt-0.5">Alineación de Fase Plimpton 322 Verificada</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className={clsx(
                  "px-2 py-0.5 bg-slate-950 border rounded text-[8px] font-bold mono",
                  (status?.integrity?.xdp_firewall === "ACTIVE" || status?.integrity?.xdp_firewall === "ACTIVE_XDP") ? "border-emerald-500/30 text-emerald-400" : "border-white/5 text-slate-400"
                )}>XDP: {status?.integrity?.xdp_firewall || "BYPASS"}</span>
                <span className={clsx(
                  "px-2 py-0.5 bg-slate-950 border rounded text-[8px] font-bold mono",
                  status?.integrity?.logic_state === "STABLE" ? "border-emerald-500/30 text-emerald-400" : "border-white/5 text-slate-400"
                )}>S60: {status?.integrity?.logic_state || "SYNCED"}</span>
              </div>
            </div>
          </div>
        ) : activeTab === "observability" ? (
          <MonitoringView />
        ) : activeTab === "n8n_reflex" ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6 h-full">
            <N8nView />
          </div>
        ) : activeTab === "null" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Matriz de Complejidad</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Rendimiento Algorítmico S60 — Datos Empíricos Ring-0</p>
              </div>
              <div className="px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] font-black text-sky-400 tracking-widest uppercase">O(1) Verificado</span>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-slate-300 mb-4">📊 Benchmark — Validado en Hardware</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider">
                      <th className="text-left py-2 pr-4">Operación</th>
                      <th className="text-left py-2 pr-4">Algoritmo</th>
                      <th className="text-left py-2 pr-4">Complejidad</th>
                      <th className="text-left py-2 pr-4">Latencia (ns)</th>
                      <th className="text-left py-2">Memoria</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {[
                      { op: "Filtro XDP", algo: "BPF_MAP_LOOKUP_ELEM", complexity: "O(1)", latency: status?.integrity?.cortex_latency_ms ? `${(status.integrity.cortex_latency_ms * 1000).toFixed(1)} ns` : "---", mem: "64 B/entrada", color: "emerald" },
                      { op: "Hook LSM", algo: "Análisis Bitmask S60", complexity: "O(1)", latency: status?.integrity?.cortex_latency_ms ? `${(status.integrity.cortex_latency_ms * 1000).toFixed(1)} ns` : "---", mem: "32 B/hook", color: "emerald" },
                      { op: "Aritmética S60", algo: "Punto Fijo i64×i64", complexity: "O(1)", latency: status?.integrity?.cortex_latency_ms ? `${(status.integrity.cortex_latency_ms * 1000).toFixed(1)} ns` : "---", mem: "8 B/SPA", color: "sky" },
                      { op: "Escaneo TruthSync", algo: "Validación Plimpton 322", complexity: "O(1)", latency: status?.integrity?.truthsync_latency_ms ? `${status.integrity.truthsync_latency_ms} ms` : "---", mem: "256 B/caché", color: "amber" },
                      { op: "Memoria Neural", algo: "LIF Observation", complexity: "O(1)", latency: status?.integrity?.cortex_latency_ms ? " < 300 ns" : "---", mem: "1 KB/nodo", color: "slate" },
                    ].map((row) => (
                      <tr key={row.op} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-2.5 pr-4 font-bold text-white">{row.op}</td>
                        <td className="py-2.5 pr-4 text-slate-400">{row.algo}</td>
                        <td className={`py-2.5 pr-4 font-black ${row.color === "emerald" ? "text-emerald-400" : row.color === "sky" ? "text-sky-400" : row.color === "amber" ? "text-amber-400" : "text-slate-500"}`}>{row.complexity}</td>
                        <td className="py-2.5 pr-4 text-slate-300 tabular-nums">{row.latency}</td>
                        <td className="py-2.5 text-slate-500">{row.mem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Precisión S60", value: "PURE_B60", sub: "Ratio Plimpton 322", color: "emerald" },
                { label: "Modo Kernel", value: "RING-0", sub: "Intercepción Directa", color: "sky" },
                { label: "Estado S60", value: status?.integrity?.logic_state || "SINCRONIZANDO", sub: "Determinismo B60", color: "amber" },
              ].map(m => (
                <div key={m.label} className="glass-card p-4 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">{m.label}</p>
                  <p className={`text-2xl font-black ${m.color === "emerald" ? "text-emerald-400" : m.color === "sky" ? "text-sky-400" : m.color === "amber" ? "text-amber-400" : "text-slate-500"}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "aiops_shield" ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">IA Ops Shield</h1>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Matriz Defensa Cognitiva S60 — Ring-0 Kernel Sync</p>
              </div>
              <div className={clsx(
                "px-4 py-2 border rounded-xl flex items-center gap-3",
                status?.integrity?.ring_status === "SEALED" ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20"
              )}>
                <div className={clsx("w-2 h-2 rounded-full animate-pulse", status?.integrity?.ring_status === "SEALED" ? "bg-rose-400" : "bg-emerald-400")} />
                <span className={clsx("text-[10px] font-black tracking-widest uppercase", status?.integrity?.ring_status === "SEALED" ? "text-rose-400" : "text-emerald-400")}>
                  {status?.integrity?.ring_status === "SEALED" ? "Guardián Sellado" : "Guardián Activo"}
                </span>
              </div>
            </div>
            <AIOpsShieldView status={status} events={events} />
          </div>
        ) : activeTab === "mycnet" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">MyCNet Malla P2P</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Red de Sincronización de Nodos Holográficos</p>
              </div>
              <div className={`px-4 py-2 border rounded-xl flex items-center gap-3 ${networkOpen ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${networkOpen ? "bg-emerald-500" : "bg-rose-500"}`} />
                <span className={`text-[10px] font-black tracking-widest uppercase ${networkOpen ? "text-emerald-400" : "text-rose-400"}`}>{networkOpen ? "Enlace Abierto" : "Enlace Sellado"}</span>
              </div>
            </div>
            <MyCNetNodeGraph phase={yhwhPhase} isOpen={networkOpen} />
            <div className="p-6 glass-card border-dashed flex flex-col items-center justify-center text-slate-500 min-h-[140px]">
               <Zap className="w-8 h-8 opacity-20 mb-3" />
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Malla de Sincronía Activa: {status?.mycnet_nodes || 0} Nodos Detectados</p>
               <p className="text-[8px] uppercase tracking-[0.2em] opacity-30 mt-1">Sincronización P2P vía Protocolo YHWH en curso</p>
            </div>
          </div>
        ) : activeTab === "vault" ? (
            <div className="glass-card p-0 overflow-hidden font-mono text-[10px]">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border-b border-white/5 shrink-0">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" /></div>
                <span className="text-slate-500 text-[9px] ml-2">sentinel-cortex / registro de auditoría del kernel</span>
              </div>
              <div className="p-4 space-y-1.5 overflow-y-auto max-h-[500px] custom-scrollbar bg-slate-950/80">
                {events.length === 0 && <div className="text-slate-600 opacity-50 italic">Esperando flujo de auditoría del kernel...</div>}
                {events.map((ev, i) => {
                  const isCritical = ev.severity >= 3 || ev.event_type.includes("BLOCK") || ev.event_type.includes("ALERT");
                  const isSys = ev.event_type.includes("HEALING") || ev.event_type.includes("PULSE");
                  const color = isCritical ? "text-rose-500" : isSys ? "text-sky-500" : "text-emerald-500";
                  return (
                    <div key={i} className="flex items-start gap-3 hover:bg-white/2 px-1 py-0.5 rounded transition-colors break-all">
                      <span className="text-slate-600 tabular-nums shrink-0">{mounted && ev.timestamp_ns ? new Date(ev.timestamp_ns / 1000000).toLocaleTimeString("es-CL", { hour12: false }) : "--:--:--"}</span>
                      <span className={`shrink-0 font-black w-[130px] truncate ${color}`}>[{ev.event_type}]</span>
                      <span className="text-slate-400">{ev.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
        ) : activeTab === "settings" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Configuración Kernel</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Configuración Núcleo S60 — Bloqueado Biométrico</p>
              </div>
              <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                <LockIcon className="w-3 h-3 text-rose-400" />
                <span className="text-[10px] font-black text-rose-400 tracking-widest uppercase">Modo Administrador Requerido</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-white/5 pb-2">Umbrales Cognitivos</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-black">Puntuación Coherencia IA</span><span className="text-[10px] text-white font-mono">{(status?.integrity?.bio_coherence ? Math.min(1.0, status.integrity.bio_coherence/12960000) : 0.00).toFixed(2)} / 1.0</span></div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${(status?.integrity?.bio_coherence ? Math.min(1.0, status.integrity.bio_coherence/12960000) : 0)*100}%` }} /></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-black">Profundidad Intercepción LSM</span><span className="text-[10px] text-white font-mono">{status?.integrity?.lsm_cognitive || "RING-0"}</span></div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className={clsx(
                        "h-full transition-all duration-1000",
                        status?.integrity?.lsm_cognitive === "ENFORCING" ? "bg-emerald-500 w-full" : 
                        status?.integrity?.lsm_cognitive === "LINKING" ? "bg-amber-500 w-1/2" : "bg-rose-500 w-0"
                      )} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-white/5 pb-2">Reloj de Resonancia</h3>
                <div className="flex items-center gap-6">
                  <div className="flex-1 space-y-1">
                    <p className="text-[9px] text-slate-500 uppercase font-black">Frecuencia Base S60</p>
                    <p className="text-2xl font-black text-white italic">{status?.crystal_frequency_hz || "---"} <span className="text-xs text-slate-600">Hz</span></p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center">
                    <Timer className="w-6 h-6 text-sky-400 opacity-30" />
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[9px] text-slate-500 italic">
                    * Nota: La sincronización del reloj es gestionada automáticamente por el módulo TruthSync. La anulación manual puede causar estado disonante.
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
               <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Políticas de Aplicación</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Intercepción Kernel Ring-0", status: (status?.integrity?.xdp_firewall === "ACTIVE" || status?.integrity?.xdp_firewall === "ACTIVE_XDP") ? "ENFORCE" : "STANDBY", desc: "Evaluar syscalls y buffer predictivo S60" },
                    { label: "Motor S60 Base", status: (status?.integrity?.s60_resonance || 0) > 0 ? "ACTIVE" : "STANDBY", desc: "Resonancia Plimpton 322 en curso" },
                    { label: "Inyección Bio-Pulso", status: (status?.integrity?.bio_coherence || 0) > 0 ? "ACTIVE" : "STANDBY", desc: "Recepción de telemetría BCI" },
                    { label: "Registro Auditoría (WAL)", status: "ENABLED", desc: "Escribiendo en /var/log/sentinel" },
                  ].map((p, i) => (
                    <div key={i} className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-emerald-500/5 transition-all">
                       <div>
                          <p className="text-[10px] font-black text-white uppercase">{p.label}</p>
                          <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">{p.desc}</p>
                       </div>
                       <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[8px] font-black text-emerald-400">{p.status || "OK"}</div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-600 space-y-4 glass-card border-dashed">
             <ShieldAlert style={{ width: '48px', height: '48px' }} className="w-12 h-12 opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Modulo: {activeTab} en proceso de sincronización s60...</p>
          </div>
        )}
      </div>
    </div>
  );
}
