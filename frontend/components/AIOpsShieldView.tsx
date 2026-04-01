"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Cpu,
  Lock,
  Zap,
  Activity,
  Radar,
  Server,
  CheckCircle2,
  Crosshair,
  Terminal,
  X,
  ChevronRight,
  Info,
} from "lucide-react";
import { clsx } from "clsx";

interface AIOpsShieldViewProps {
  status: any;
  events?: any[];
}

// Derivación de métricas de integridad desde los datos del núcleo S60
function derivedMetrics(status: any) {
  const integrity = status?.integrity || {};
  const bioCoherence = integrity.bio_coherence ?? 0;
  const maxCoherence = 12_960_000;
  const quantumLoad = integrity.quantum_load ?? 0;
  const effectiveMass = integrity.effective_mass ?? 0;
  const isSealed = integrity.ring_status === "SEALED";

  const truthSyncActive = (integrity.p322_ratio_integrity || 0) > 0;
  const truthSyncCertified = (integrity.p322_ratio_integrity || 0) > 6_480_000;

  return {
    isSealed,
    xdpActivo: integrity.xdp_firewall === "ACTIVE" || integrity.xdp_firewall === "ACTIVE_XDP",
    lsmEnforce: integrity.lsm_cognitive === "ENFORCING" || integrity.lsm_cognitive === "RING-0",
    harmSync: integrity.harmonic_sync === "STABLE" || integrity.harmonic_sync === "RESONANCE_MAX",
    crystalActivo: (status?.crystal_frequency_hz || 0) > 0,
    truthSyncActive,
    truthSyncCertified,
    // Porcentaje de coherencia bio [0..100]
    pctBio: Math.min(100, (Math.abs(bioCoherence) / maxCoherence) * 100),
    // Carga cognitiva del kernel [0..100] basada en amenazas / bloqueos recientes
    pctCarga: Math.min(100, quantumLoad * 20 + (status?.threat_count || 0) * 2),
    // Saturación de masa efectiva basada en celdas cristalinas de lattice (N=1024)
    pctMasa: Math.min(100, (effectiveMass / 1024) * 100),
    // Intensidad del portal S60 escalada correctamente a %
    pctPortal: Math.min(100, ((integrity.s60_resonance || 0) / maxCoherence) * 100),
    // Ratio P322 — Constante Yatra S60 original sin redondear
    p322: integrity.p322_ratio_integrity !== undefined ? integrity.p322_ratio_integrity.toLocaleString() : "---",
    // Latencia cortex en ns normalizado a ms de forma precisa
    latenciaMs: integrity.cortex_latency_ns !== undefined ? (integrity.cortex_latency_ns / 1_000_000).toFixed(3) : "0.000",
  };
}

const SECTORES = ["EXEC", "NET", "FILE", "PROC", "MEM", "IPC", "SYS", "AIO"];

export function AIOpsShieldView({ status, events = [] }: AIOpsShieldViewProps) {
  const [pulse, setPulse] = useState(0);
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [sectorStates, setSectorStates] = useState<Record<string, "OK" | "ALERTA" | "BLOQUEADO">>({});
  const [selectedCapa, setSelectedCapa] = useState<any | null>(null);

  const m = derivedMetrics(status);

  // Animación del radar
  useEffect(() => {
    const timer = setInterval(() => setPulse(p => (p + 1) % 100), 40);
    return () => clearInterval(timer);
  }, []);

  // Inicializar estados de sectores
  useEffect(() => {
    const newStates: Record<string, "OK" | "ALERTA" | "BLOQUEADO"> = {};
    SECTORES.forEach(s => {
      if (m.isSealed && (s === "EXEC" || s === "NET")) {
        newStates[s] = "BLOQUEADO";
      } else if (!m.xdpActivo && s === "NET") {
        newStates[s] = "ALERTA";
      } else if (!m.lsmEnforce && s === "EXEC") {
        newStates[s] = "ALERTA";
      } else {
        newStates[s] = "OK";
      }
    });
    setSectorStates(newStates);
  }, [m.isSealed, m.xdpActivo, m.lsmEnforce]);

  const handleSectorClick = useCallback((sector: string) => {
    setActiveSector(prev => (prev === sector ? null : sector));
  }, []);

  const integrity = status?.integrity || {};
  const capas = [
    {
      id: "s60",
      nombre: "Validador de Esquema S60",
      descripcion: "Rechaza eventos con hash fuera del dominio Plimpton 322",
      estado: m.harmSync ? "ACTIVO" : "OFFLINE",
      icon: Search,
      color: "sky",
      valor: `P322: ${m.p322}`,
      activo: m.harmSync,
      explanation: "El Validador de Esquema S60 es la primera línea de defensa. Cada evento que entra al sistema es evaluado contra la constante Plimpton 322 (fila 12: 12709/13500). Si el hash del evento no cae dentro del dominio matemático del sistema base-60, es descartado en Ring-0 antes de llegar al espacio de usuario. Esto es inmune a inyecciones que funcionan explotando ambigüedades de punto flotante IEEE-754.",
      technical: `Sincronía Armónica: ${integrity.harmonic_sync || "---"}\nRatio P322 actual: ${integrity.p322_ratio_integrity || 0}\nEscala S60 (60^4): 12,960,000\nRatio canónico (12709/13500): 0.94141...\nEstado Lógico: ${integrity.logic_state || "---"}\nTick Global: ${status?.global_tick || 0}`,
    },
    {
      id: "sanitizacion",
      nombre: "Sanitizador Armónico",
      descripcion: "Neutraliza patrones de inyección (rm -rf, DROP, bash pipes)",
      estado: m.crystalActivo ? "ACTIVO" : "OFFLINE",
      icon: Zap,
      color: "emerald",
      valor: `Masa: ${m.pctMasa.toFixed(0)}%`,
      activo: m.crystalActivo,
      explanation: "El Sanitizador Armónico analiza la masa efectiva del Crystal Lattice (matriz 32×32 = 1024 osciladores). Cuando un patrón de inyección semántica (rm -rf, DROP TABLE, pipe chaining) es detectado, el módulo de control de brechas activa el Protocolo G-Zero: equilibra la carga de la célula afectada sin algoritmos probabilísticos, usando solo aritmética S60 entera. Garantiza latencia de decisión menor a 300 ns.",
      technical: `Masa Efectiva (nodos activos): ${integrity.effective_mass || 0} / 1024\nOcupación Lattice: ${m.pctMasa.toFixed(2)}%\nFrecuencia Cristal: ${status?.crystal_frequency_hz || "---"} Hz\nProtocolo G-Zero: ACTIVO\nTipo Aritmética: i64 × i64 (sin punto flotante)\nAmplitud máxima (S60): 12,960,000`,
    },
    {
      id: "truthsync",
      nombre: "Autoridad TruthSync",
      descripcion: "Certifica la integridad matemática de cada evento Ring-0",
      estado: m.truthSyncCertified ? "CERTIFICADO" : "VERIFICANDO",
      icon: ShieldCheck,
      color: "amber",
      valor: `Bio: ${Math.round(m.pctBio)}%`,
      activo: m.truthSyncActive,
      explanation: "TruthSync es el módulo de certificación continua del sistema. Calcula en tiempo real si la coherencia global del kernel coincide con la fracción Plimpton 322 esperada. Si la diferencia supera el 50% del umbral (6,480,000 en escala S60), el sistema emite una advertencia de contaminación. Actúa como dead-man switch: si el operador biológico no responde en 30s, el sistema sella el Ring-0.",
      technical: `Sello TruthSync: ${integrity.truthsync_seal || "---"}\nRatio P322 Integridad: ${integrity.p322_ratio_integrity || 0}\nUmbral certificación (50%): 6,480,000\nBio-Coherencia: ${Math.round(m.pctBio)}% (${integrity.bio_coherence || 0} raw)\nLatencia TruthSync: ${integrity.truthsync_latency_ms || "---"} ms\nConfianza Cortex: ${integrity.cortex_confidence || 0}`,
    },
    {
      id: "ebpf",
      nombre: "Guardián eBPF Kernel",
      descripcion: "LSM hooks + XDP TC firewall en Ring-0",
      estado: integrity.xdp_firewall || "BYPASS",
      icon: Cpu,
      color: m.isSealed ? "rose" : m.xdpActivo ? "emerald" : "slate",
      valor: `LSM: ${integrity.lsm_cognitive || "—"}`,
      activo: m.xdpActivo,
      explanation: "El Guardián eBPF opera en dos capas simultáneas: (1) XDP — eXpress Data Path ejecuta programas BPF directamente en el driver de red antes que el stack TCP/IP, filtrando paquetes a velocidad de línea con zero-copy y latencia < 0.04 ms. (2) LSM — Linux Security Module con hooks semánticos en execve y file_open, analizando la intención de cada syscall mediante la red neuronal LIF del backend Rust. Bloquea agentes IA con comportamientos anómalos incluso con privilegios root.",
      technical: `XDP Firewall: ${integrity.xdp_firewall || "---"}\nLSM Enforcement: ${integrity.lsm_cognitive || "---"}\nNervio A (LSM): ${integrity.nerve_a_status || "---"}\nNervio B (XDP): ${integrity.nerve_b_status || "---"}\nLatencia Cortex: ${m.latenciaMs} ms\nEstado Ring-0: ${integrity.ring_status || "---"}\nAmenazas interceptadas: ${status?.threat_count || 0}`,
    },
  ];

  const sectorColor: Record<string, string> = {
    OK: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    ALERTA: "text-amber-400 border-amber-500/40 bg-amber-500/10 animate-pulse",
    BLOQUEADO: "text-rose-400 border-rose-500/40 bg-rose-500/10",
  };

  const activeThreats = (events || [])
    .filter(e => e.severity >= 3 || e.event_type?.includes("BLOCK") || e.event_type?.includes("ALERT") || e.event_type?.includes("THREAT"))
    .slice(0, 6);

  return (
    <div className="space-y-6">

      {/* ── 1. ESTADO DE CAPAS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {capas.map((capa) => (
          <div
            key={capa.id}
            onClick={() => setSelectedCapa(capa)}
            className={clsx(
              "glass-card p-4 border flex flex-col gap-3 cursor-pointer group hover:scale-[1.01] transition-all duration-200 hover:border-white/20",
              capa.activo
                ? `border-${capa.color}-500/20 bg-${capa.color}-500/5`
                : "border-slate-800 bg-slate-900/20"
            )}
            title={capa.descripcion}
          >
            <div className="flex items-center justify-between">
              <div className={clsx("w-10 h-10 flex items-center justify-center rounded-lg border shrink-0", capa.activo ? `border-${capa.color}-500/30 bg-${capa.color}-500/10` : "border-slate-700 bg-slate-900")} style={{ width: '40px', height: '40px' }}>
                <capa.icon className={clsx("w-5 h-5", capa.activo ? `text-${capa.color}-400` : "text-slate-600")} style={{ width: '20px', height: '20px' }} />
              </div>
              <div className="flex items-center gap-1.5">
                <div className={clsx("w-1.5 h-1.5 rounded-full", capa.activo ? "bg-emerald-400 animate-pulse" : "bg-slate-700")} />
                <span className={clsx("text-[8px] font-black uppercase tracking-widest", capa.activo ? "text-emerald-400" : "text-slate-600")}>
                  {capa.estado}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-tight leading-snug">{capa.nombre}</p>
              <p className={clsx("text-[9px] font-bold mono mt-1", capa.activo ? `text-${capa.color}-400` : "text-slate-600")}>{capa.valor}</p>
            </div>
            {/* Indicador clickeable */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Info className="w-2.5 h-2.5 text-slate-600" />
              <p className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">Ver detalle técnico</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2. GRID CENTRAL: RADAR + MÉTRICAS + LOG ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Panel del Centro — Radar de Sectores Interactivo */}
        <div className="xl:col-span-2 glass-card border-emerald-500/10 relative overflow-hidden flex flex-col bg-slate-950/40">
          {/* Fondo radar decorativo */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            {[800, 600, 400, 200].map(size => (
              <div key={size} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-emerald-500/10 rounded-full"
                style={{ width: size, height: size }} />
            ))}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div
              className="absolute top-1/2 left-1/2 w-[2px] h-[400px] bg-gradient-to-t from-emerald-500/60 to-transparent origin-bottom"
              style={{ transform: `translateX(-50%) translateY(-100%) rotate(${pulse * 3.6}deg)` }}
            />
          </div>

          <div className="relative z-10 p-6 flex flex-col h-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded border border-emerald-500/40">
                  <Radar className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                    Centro de Mando Ring-0
                    <span className={clsx(
                      "px-2 py-0.5 border text-[7px] tracking-widest rounded font-black",
                      m.isSealed
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {m.isSealed ? "⚠ MODO CUARENTENA" : "TRUTHSYNC ACTIVO"}
                    </span>
                  </h2>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    Haz clic en un sector para inspeccionarlo
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Latencia Cortex</p>
                <p className="text-xl font-black text-sky-400 mono">{m.latenciaMs} ms</p>
              </div>
            </div>

            {/* Grid de sectores interactivos + métricas en vivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">

              {/* Sectores del Kernel interactivos */}
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Sectores del Kernel</p>
                <div className="grid grid-cols-4 gap-2">
                  {SECTORES.map(sector => {
                    const estado = sectorStates[sector] || "OK";
                    const isActive = activeSector === sector;
                    return (
                      <button
                        key={sector}
                        onClick={() => handleSectorClick(sector)}
                        className={clsx(
                          "p-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all duration-200",
                          sectorColor[estado],
                          isActive && "ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-950 scale-110"
                        )}
                      >
                        {sector}
                      </button>
                    );
                  })}
                </div>
                {/* Detalle del sector activo */}
                <div className={clsx(
                  "p-3 rounded-xl border transition-all duration-300 min-h-[80px] flex flex-col justify-center",
                  activeSector
                    ? "border-emerald-500/30 bg-emerald-500/5 opacity-100"
                    : "border-white/5 bg-transparent opacity-40"
                )}>
                  {activeSector ? (
                    <>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">{activeSector} — Inspección en Curso</p>
                      <div className="space-y-1 text-[9px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Estado LSM</span>
                          <span className={clsx("font-black", m.lsmEnforce ? "text-emerald-400" : "text-amber-400")}>
                            {m.lsmEnforce ? "ENFORCING" : "PERMISSIVE"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">XDP Firewall</span>
                          <span className={clsx("font-black", m.xdpActivo ? "text-emerald-400" : "text-rose-400")}>
                            {status?.integrity?.xdp_firewall || "BYPASS"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Eventos capturados</span>
                          <span className="text-white font-black">
                            {events.filter(e => e.event_type?.includes(activeSector)).length || 0}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-[9px] text-slate-600 italic text-center">Selecciona un sector para ver detalles</p>
                  )}
                </div>
              </div>

              {/* Métricas en tiempo real del backend */}
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Métricas del Motor S60</p>

                {[
                  { label: "Coherencia Bio-Cognitiva", val: m.pctBio, color: "rose", unit: `${Math.round(m.pctBio)}%` },
                  { label: "Carga del Kernel (Quantum)", val: m.pctCarga, color: "sky", unit: `${Math.round(m.pctCarga)}%` },
                  { label: "Intensidad Portal Crystal", val: m.pctPortal, color: "violet", unit: `${Math.round(m.pctPortal)}%` },
                  { label: "Masa Efectiva S60", val: m.pctMasa, color: "emerald", unit: `${Math.round(m.pctMasa)}%` },
                ].map(({ label, val, color, unit }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-[8px] font-black uppercase text-slate-500">
                      <span>{label}</span>
                      <span className={`text-${color}-400`}>{unit}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${color}-500 rounded-full transition-all duration-1000`}
                        style={{ width: `${Math.max(2, val)}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="p-3 rounded-lg bg-black/30 border border-slate-900 group hover:border-emerald-500/20 transition-colors mt-2">
                  <p className="text-[8px] text-slate-600 font-bold uppercase mb-1 tracking-widest">Integridad P322</p>
                  <div className="text-sm font-mono text-emerald-400">{m.p322}</div>
                </div>
              </div>
            </div>

            {/* Estado del Arco de Reflejo */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
              {[
                { icon: Lock, label: "LSM_PROTEGIDO", activo: m.lsmEnforce },
                { icon: Server, label: "S60_SINCRONIZADO", activo: m.harmSync },
                { icon: CheckCircle2, label: "TRUTHSYNC_CERT", activo: m.truthSyncCertified },
                { icon: Cpu, label: "XDP_FIREWALL", activo: m.xdpActivo },
              ].map((badge, i) => (
                <div key={i} className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors",
                  badge.activo
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-slate-900 border-slate-800 text-slate-600"
                )}>
                  <badge.icon className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black tracking-[0.2em] uppercase">{badge.label}</span>
                </div>
              ))}
              <div className="flex-1" />
              <div className={clsx(
                "flex items-center gap-2 font-bold text-[9px] uppercase tracking-widest mono",
                m.isSealed ? "text-rose-400" : "text-slate-500"
              )}>
                <Crosshair className="w-3.5 h-3.5" />
                {m.isSealed ? "MODO CUARENTENA ACTIVO" : "OBJETIVO: DESPEJADO"}
              </div>
            </div>
          </div>
        </div>

        {/* Panel del Feed de Amenazas en Vivo */}
        <div className="flex flex-col h-full space-y-4 overflow-hidden">
          <div className="glass-card p-5 border-rose-500/20 bg-slate-950/80 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <ShieldAlert className="w-24 h-24 text-rose-500" style={{ width: '96px', height: '96px' }} />
            </div>

            <div className="flex items-center justify-between mb-4 border-b border-rose-500/20 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-rose-200">
                  Amenazas
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[7px] font-black uppercase tracking-widest text-rose-400">RING-0</span>
              </div>
            </div>

            <div className="flex-1 space-y-2 font-mono text-[9px] overflow-y-auto relative z-10 custom-scrollbar">
              {activeThreats.length > 0 ? activeThreats.map((ev: any, i: number) => {
                const isCritical = ev.severity >= 4;
                return (
                  <div key={i} className={clsx(
                    "p-3 rounded-xl border flex flex-col gap-2 transition-all hover:bg-white/5",
                    isCritical ? "bg-rose-500/10 border-rose-500/30" : "bg-slate-900 border-white/5"
                  )}>
                    <div className="flex justify-between items-start gap-2">
                      <span className={clsx("font-black text-[9px] tracking-tight shrink-0", isCritical ? "text-rose-400" : "text-amber-400")}>
                        [{ev.event_type}]
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium text-[9px] leading-snug line-clamp-2">{ev.message}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[7px] font-black uppercase text-slate-500">
                      <span>PID_{ev.pid || "—"}</span>
                      <span className={isCritical ? "text-rose-400" : "text-amber-400"}>{isCritical ? "BLOQUEADO" : "ALERTA"}</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-700">
                   <Activity className="w-8 h-8 mb-2 opacity-10 animate-pulse" />
                   <p className="text-[9px] font-black uppercase tracking-widest">Escaneo Pasivo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ── MODAL DETALLE TÉCNICO DE CAPA ── */}
      {selectedCapa && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSelectedCapa(null)}
          />
          {/* Panel */}
          <div className="relative w-full max-w-lg glass-card shadow-2xl overflow-hidden bg-slate-900 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={clsx(
                  "p-3 rounded-2xl border",
                  selectedCapa.activo
                    ? `border-${selectedCapa.color}-500/30 bg-${selectedCapa.color}-500/10 text-${selectedCapa.color}-400`
                    : "border-slate-700 bg-slate-900 text-slate-500"
                )}>
                  <selectedCapa.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">{selectedCapa.nombre}</h3>
                  <p className={clsx("text-xs font-bold uppercase", selectedCapa.activo ? `text-${selectedCapa.color}-400` : "text-slate-500")}>
                    {selectedCapa.estado} — {selectedCapa.valor}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCapa(null)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                  <Info className="w-3 h-3" /> Explicación del Protocolo
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">{selectedCapa.explanation}</p>
              </div>
              <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Terminal className="w-3 h-3" /> Telemetría Ring-0 (Raw Data)
                </h4>
                <pre className="text-xs font-mono text-emerald-400 bg-black/20 p-4 rounded-xl border border-emerald-500/10 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selectedCapa.technical}
                </pre>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Datos en Tiempo Real — S60 Ring-0
                </div>
                <button
                  onClick={() => setSelectedCapa(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-white transition-all"
                >
                  Cerrar <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
