"use client";

import React, { useState } from "react";
import { Shield, Zap, Activity, Heart, Globe, Cpu, Scale, Database, X, Terminal, ChevronRight, Info } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface StatsGridProps {
  status: any;
}

export function StatsGrid({ status }: StatsGridProps) {
  const [selectedStat, setSelectedStat] = useState<any | null>(null);
  const integrity = status?.integrity || {};
  const bioCoherence = integrity.bio_coherence || 0;
  const bioPercent = Math.min(100, (bioCoherence / 12960000) * 100);

  const stats = [
    {
      id: "shield",
      label: "IA Ops Shield",
      value: status?.ring_status === "SEALED" ? "ACTIVADO" : "PROTEGIDO",
      icon: Shield,
      color: status?.ring_status === "SEALED" ? "text-rose-500" : "text-emerald-400",
      glow: status?.ring_status === "SEALED" ? "glow-rose" : "glow-emerald",
      borderColor: status?.ring_status === "SEALED" ? "border-rose-500/30" : "border-emerald-500/20",
      bgAccent: status?.ring_status === "SEALED" ? "from-rose-500/10" : "from-emerald-500/10",
      pulse: status?.ring_status === "SEALED",
      subtitle: status?.ring_status === "SEALED" ? "Contención Activa" : "Sin Amenazas",
      explanation: "Escudo cognitivo de nivel Ring-3 que intercepta anomalías antes de que lleguen al kernel. Utiliza telemetría S60 para predecir vectores de ataque.",
      technical: `Estado Ring: ${status?.ring_status || "NORMAL"}\nAmenazas Activas: ${status?.threat_count || 0}\nModo Contención: ${status?.ring_status === "SEALED" ? "FORZADO" : "PASIVO"}`
    },
    {
      id: "integrity",
      label: "Integridad Sistema",
      value: integrity.logic_state || "ESTABLE",
      icon: Activity,
      color: integrity.logic_state === "STABLE" || !integrity.logic_state ? "text-emerald-400" : "text-rose-400",
      glow: integrity.logic_state === "STABLE" || !integrity.logic_state ? "glow-emerald" : "glow-rose",
      borderColor: integrity.logic_state === "STABLE" || !integrity.logic_state ? "border-emerald-500/20" : "border-rose-500/20",
      bgAccent: integrity.logic_state === "STABLE" || !integrity.logic_state ? "from-emerald-500/10" : "from-rose-500/10",
      pulse: false,
      subtitle: "Estado Lógico LSM",
      explanation: "Monitor de integridad de archivos y procesos mediante hooks LSM. Refleja el estado lógico real del kernel: STABLE indica operación normal sin desviaciones de firma.",
      technical: `LSM Hook Status: ${integrity.lsm_cognitive || "ACTIVO"}\nFirma TruthSync: ${integrity.truthsync_seal || "N/A"}\nEstado Lógico: ${integrity.logic_state || "ESTABLE"}`
    },
    {
      id: "resonance",
      label: "Resonancia S60",
      value: status?.s60_resonance !== undefined ? `${((status.s60_resonance / 12960000) * 100).toFixed(1)}%` : "0.0%",
      icon: Zap,
      color: "text-sky-400",
      glow: "glow-sky",
      borderColor: "border-sky-500/15",
      bgAccent: "from-sky-500/10",
      subtitle: "Núcleo Base-60",
      explanation: "Frecuencia de oscilación del procesador aritmético sexagesimal (S60). Mide la eficiencia de los cálculos de punto fijo de alta precisión.",
      technical: `Resonancia Cruda: ${status?.s60_resonance || 0}\nModo Aritmético: i64x64\nSincronía Armónica: ${integrity.harmonic_sync || "NORMAL"}`
    },
    {
      id: "portal",
      label: "Fase Portal",
      value: integrity.harmonic_sync || "ESTABLE",
      icon: Activity,
      color: integrity.harmonic_sync === "RESONANCE_MAX" ? "text-violet-400" : "text-slate-400",
      glow: integrity.harmonic_sync === "RESONANCE_MAX" ? "glow-sky" : "",
      borderColor: "border-violet-500/15",
      bgAccent: "from-violet-500/10",
      subtitle: "Multi-Armónico",
      explanation: "Estado de la matriz de resonancia del portal. Coordina la sincronía de datos entre los nodos S60 y el observador humano.",
      technical: `Sincronía: ${integrity.harmonic_sync || "ESTABLE"}\nEstado Oscilador: ${integrity.crystal_oscillator_active ? "ACTIVO" : "OFFLINE"}\nFase: G-ZERO`
    },
    {
      id: "bio",
      label: "Bio-Coherencia",
      value: `${bioPercent.toFixed(1)}%`,
      icon: Heart,
      color: bioPercent > 50 ? "text-rose-400" : "text-rose-600",
      glow: bioPercent > 80 ? "glow-rose" : "",
      borderColor: "border-rose-500/15",
      bgAccent: "from-rose-500/10",
      pulse: true,
      subtitle: "Sincronía Humana",
      bar: bioPercent,
      explanation: "Resonancia armónica de los 17 nodos del núcleo (Salto-17). Mide el acoplamiento real entre el procesador S60 y la intención del operador humano.",
      technical: `Resonancia Núcleo: ${integrity.bio_coherence || 0}\nAcoplamiento: ${bioPercent.toFixed(2)}%\nModo: TRUTHSYNC (S-17)`
    },
    {
      id: "xdp",
      label: "Firewall XDP",
      value: integrity.xdp_firewall || "OFFLINE",
      icon: Globe,
      color: integrity.xdp_firewall === "ACTIVE" ? "text-indigo-400" : "text-slate-500",
      glow: "",
      borderColor: "border-indigo-500/15",
      bgAccent: "from-indigo-500/10",
      subtitle: "Latencia < 0.1ms",
      explanation: "Filtrado de paquetes en eXpress Data Path a nivel de driver de red. Bloquea ataques de denegación de servicio antes del stack TCP/IP.",
      technical: `XDP Mode: ${integrity.xdp_firewall || "BYPASS"}\nLatencia Cortex: ${integrity.cortex_latency_ms || 0}ms\nNodos MycNet: ${status?.mycnet_nodes || 0}`
    },
    {
      id: "lsm",
      label: "LSM Cognitivo",
      value: integrity.lsm_cognitive || "SINCRONIZANDO",
      icon: Cpu,
      color: "text-amber-400",
      glow: "glow-amber",
      borderColor: "border-amber-500/15",
      bgAccent: "from-amber-500/10",
      subtitle: "Filtro Semántico",
      explanation: "Linux Security Module modificado para análisis de intención. Deniega syscalls peligrosas basándose en el contexto cognitivo.",
      technical: `LSM Status: ${integrity.lsm_cognitive || "PENDING"}\nConfianza Cortex: ${integrity.cortex_confidence || 0}%\nEstado: RING-0`
    },
    {
      id: "mass",
      label: "Masa Efectiva",
      value: integrity.effective_mass !== undefined ? `${(integrity.effective_mass / 12960000).toFixed(4)}` : "---",
      icon: Scale,
      color: "text-cyan-400",
      glow: "glow-cyan",
      borderColor: "border-cyan-500/15",
      bgAccent: "from-cyan-500/10",
      subtitle: "Protocolo G-Zero",
      explanation: "Balanceo de carga en la matriz de resonancia. Una masa estable garantiza que los cálculos S60 sean deterministas y libres de ruido.",
      technical: `Masa Cruda: ${integrity.effective_mass || 0}\nRatio P322: ${integrity.p322_ratio_integrity || 0}\nProtocolo: G-ZERO`
    },
    {
      id: "load",
      label: "Carga Cuántica",
      value: integrity.quantum_load !== undefined ? `${((integrity.quantum_load / 1296000).toFixed(1))}%` : "---",
      icon: Database,
      color: "text-orange-400",
      glow: "glow-orange",
      borderColor: "border-orange-500/15",
      bgAccent: "from-orange-500/10",
      subtitle: "Presión Cortex",
      explanation: "Saturación de los búferes de eventos de eBPF. Muestra la carga de trabajo real que está procesando el cortex central.",
      technical: `Quantum Load: ${integrity.quantum_load || 0}\nMemoria Predictiva: ${status?.predictive_memory || 0}%\nGlobal Tick: ${status?.global_tick || 0}`
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStat(stat)}
            className={clsx(
              "glass-card p-4 flex flex-col items-center text-center space-y-3 relative overflow-hidden group cursor-pointer h-full transition-all duration-300",
              stat.borderColor,
              "hover:border-white/20 hover:bg-white/5 shadow-lg shadow-black/20"
            )}
          >
            {/* Background gradient accent */}
            <div className={clsx(
              "absolute inset-0 bg-gradient-to-b to-transparent opacity-30 group-hover:opacity-50 transition-opacity",
              stat.bgAccent
            )} />

            {/* Icon */}
            <div className={clsx(
              "relative z-10 p-2 rounded-xl border shrink-0 bg-slate-900/50",
              stat.borderColor,
              stat.color,
              stat.pulse && "status-pulse"
            )}>
              <stat.icon className={clsx("w-4 h-4", stat.pulse && "status-pulse")} />
            </div>

            {/* Value */}
            <div className="relative z-10 space-y-0.5 flex-1 flex flex-col justify-center">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.1em] line-clamp-1">
                {stat.label}
              </p>
              <p className={clsx("text-base font-extrabold mono tracking-tight", stat.color, stat.glow)}>
                {stat.value}
              </p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-[7px] text-slate-600 font-medium uppercase tracking-widest line-clamp-1">
                  {stat.subtitle}
                </p>
                <Info className="w-2 h-2 text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Bio-Coherence progress bar */}
            {stat.bar !== undefined && (
              <div className="relative z-10 w-full bg-slate-950 h-1 rounded-full mt-auto overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400"
                  animate={{ width: `${stat.bar}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            )}

            {/* Hover glow */}
            <div className={clsx(
              "absolute -bottom-6 -right-6 w-16 h-16 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
              stat.color.includes("emerald") && "bg-emerald-500",
              stat.color.includes("sky") && "bg-sky-500",
              stat.color.includes("violet") && "bg-violet-500",
              stat.color.includes("rose") && "bg-rose-500",
              stat.color.includes("indigo") && "bg-indigo-500",
              stat.color.includes("amber") && "bg-amber-500",
              stat.color.includes("cyan") && "bg-cyan-500",
              stat.color.includes("orange") && "bg-orange-500"
            )} />
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedStat && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStat(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              layoutId={selectedStat.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={clsx(
                "relative w-full max-w-lg glass-card border-none shadow-2xl overflow-hidden bg-slate-900",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-10",
                selectedStat.bgAccent
              )}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={clsx("p-3 rounded-2xl border", selectedStat.borderColor, selectedStat.color)}>
                    <selectedStat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">
                      {selectedStat.label}
                    </h3>
                    <p className={clsx("text-xs font-bold uppercase", selectedStat.color)}>
                      {selectedStat.value} — {selectedStat.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStat(null)}
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
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {selectedStat.explanation}
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Telemetría Ring-0 (Raw Data)
                  </h4>
                  <pre className="text-xs font-mono text-emerald-400 bg-black/20 p-4 rounded-xl border border-emerald-500/10 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {selectedStat.technical}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sincronía S60 Activa
                  </div>
                  <button
                    onClick={() => setSelectedStat(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-white transition-all"
                  >
                    Cerrar Detalle <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
