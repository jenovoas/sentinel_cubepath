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
      value: status?.threat_count > 0 ? "ALERTA" : "PROTEGIDO",
      icon: Shield,
      color: status?.threat_count > 0 ? "text-rose-500" : "text-emerald-400",
      glow: status?.threat_count > 0 ? "glow-rose" : "glow-emerald",
      borderColor: status?.threat_count > 0 ? "border-rose-500/30" : "border-emerald-500/20",
      bgAccent: status?.threat_count > 0 ? "from-rose-500/10" : "from-emerald-500/10",
      pulse: status?.threat_count > 0,
      subtitle: status?.threat_count > 0 ? `${status.threat_count} Amenazas` : "Sin Amenazas",
      explanation: "El IA Ops Shield es el motor de decisión del sistema. A diferencia de soluciones EDR (Ring-3) que escanean firmas, Sentinel evalúa eventos en el Kernel (Ring-0) mediante filtros eBPF. Determina malicia calculando el score de entropía de cada señal con aritmética sexagesimal (S60) pura. [Ver Documentación: flujos de eBPF].",
      technical: `Intenciones bloqueadas: ${status?.threat_count || 0}\nEstado Kernel (Ring-0): ${integrity.ring_status || "NORMAL"}\nFirma TruthSync: ${integrity.truthsync_seal || "VERIFICANDO"}\nConfianza Red Neuronal: ${integrity.cortex_confidence || 0}\nLatencia decisión: ${integrity.cortex_latency_ms ? integrity.cortex_latency_ms.toFixed(3) + " ms" : "---"}`
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
      subtitle: "Acoplamiento P322",
      explanation: "Verifica matemáticamente que el kernel no está adulterado calculando el ratio Plimpton-322 (Fila 12). Sentinel descarta arquitecturas inseguras de punto flotante (IEEE-754) que acumulan ruido. Si la coherencia del estado difiere de la fracción P322 (12709/13500), se asume contaminación del hypervisor. [Ver Docs: TruthSync].",
      technical: `Estado Lógico: ${integrity.logic_state || "STABLE"}\nRatio P322 actual: ${integrity.p322_ratio_integrity || 0} / 12,960,000\nEstado LSM: ${integrity.lsm_cognitive || "ACTIVO"}\nNervio A: ${integrity.nerve_a_status || "---"}\nNervio B: ${integrity.nerve_b_status || "---"}`
    },
    {
      id: "resonance",
      label: "Resonancia S60",
      value: integrity.s60_resonance !== undefined ? `${((Math.abs(integrity.s60_resonance) / 12960000) * 100).toFixed(1)}%` : "0.0%",
      icon: Zap,
      color: "text-sky-400",
      glow: "glow-sky",
      borderColor: "border-sky-500/15",
      bgAccent: "from-sky-500/10",
      subtitle: "Núcleo Base-60",
      explanation: "Nivel de coherencia de las operaciones matemáticas base-60. El motor S60 ejecuta operaciones en escala de 60⁴ = 12,960,000, logrando un determinismo absoluto con enteros de 64-bits. Este mecanismo es inmune a los ataques de inyección tipo AIOpsDoom (desbordamientos flotantes que evaden LLMs convencionales). [Ref: Motor Matemático S60].",
      technical: `Valor crudo (S60): ${integrity.s60_resonance || 0}\nEscala base: 60^4 = 12,960,000\nAritmética: i64 × i64 (No-floating-point)\nSincronía Armónica: ${integrity.harmonic_sync || "STABLE"}\nTick Sistema: ${status?.global_tick || 0}`
    },
    {
      id: "portal",
      label: "Fase Portal SASR",
      value: integrity.harmonic_sync || "ESTABLE",
      icon: Activity,
      color: integrity.harmonic_sync === "RESONANCE_MAX" ? "text-violet-400" : "text-slate-400",
      glow: integrity.harmonic_sync === "RESONANCE_MAX" ? "glow-sky" : "",
      borderColor: "border-violet-500/15",
      bgAccent: "from-violet-500/10",
      subtitle: "Multi-Armónico",
      explanation: "El Portal SASR (Sovereign Arithmetic Synchrony Ring) orquesta el ritmo de los nodos de la topología MyCNet. Aplica la secuencia YHWH (10-5-6-5) para que los nodos oscilen sincronizando sus búferes sin usar locks tradicionales ni latencia de red. [Ver Docs: Crystal Lattice Matrix].",
      technical: `Fase: ${integrity.harmonic_sync || "STABLE"}\nCiclo Secuencia (Tick % 4): ${status?.global_tick ? status.global_tick % 4 : 0}\nNodos MyCNet: ${status?.mycnet_nodes || 0} topológicamente activos\nFrec. Oscilador (Base P322): ${status?.crystal_frequency_hz || 41.77} Hz\nEstado Matrix: ${integrity.harmonic_sync === "RESONANCE_MAX" ? "ACOPLADO" : "SINTONIZANDO"}`
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
      explanation: "Acoplamiento entre el operador y el kernel (BioResonador). Transforma la señal física entropica (vía jiffies del sistema o un bioenlace BCI haptico) usando la constelación Salto-17 del Crystal Lattice. Garantiza que la IA siempre reporta a una entidad biológica (dead-man switch de 30s). [Ver Docs: BioResonator].",
      technical: `Coherencia de Hardware: ${integrity.bio_coherence || 0}\nPeso de señal (/ 12.96 M): ${bioPercent.toFixed(2)}%\nOrigen de Señal: jiffies (/proc/stat)\nAlgoritmo de Filtrado: Promedio Salto-17\nFirma Humana Verificada: ${integrity.truthsync_seal || "PENDIENTE"}`
    },
    {
      id: "xdp",
      label: "Firewall XDP",
      value: integrity.xdp_firewall || "STANDBY",
      icon: Globe,
      color: integrity.xdp_firewall === "ACTIVE" ? "text-indigo-400" : "text-slate-500",
      glow: "",
      borderColor: "border-indigo-500/15",
      bgAccent: "from-indigo-500/10",
      subtitle: `Cortex < 0.1ms`,
      explanation: "eXpress Data Path (XDP): ejecuta programas eBPF compilados directamente en la tarjeta de red (Tx/Rx queues) antes de que el kernel procese la pila TCP/IP, descartando paquetes a velocidad de línea en < 0.04 ms sin copias de memoria (zero-copy). [Ref: xdp_firewall.c].",
      technical: `Driver level: eBPF BPF_PROG_TYPE_XDP\nEstado XDP actual: ${integrity.xdp_firewall || "STANDBY"}\nLatencia intercepción: ${integrity.cortex_latency_ms || 0} ms\nBuffers de kernel (RingBuf): 256KB\nTotal eventos filtrados cognitivamente: ${status?.threat_count || 0}`
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
      explanation: "Linux Security Module (LSM) con hook profundo. Analiza la intención semántica de llamadas al sistema (execve, file_open) con redes neuronales LIF interconectadas en el backend (Rust). Bloquea agentes IA que exhiban comportamientos anómalos (ej. rm -rf) incluso si corren como root. [Ref: lsm_ai_guardian.c].",
      technical: `LSM Enforcement: ${integrity.lsm_cognitive || "PENDIENTE"}\nConfianza Red: ${integrity.cortex_confidence || 0}%\nHooks registrados: execve, file_open\nArquitectura Backend: Rust 1.75+ (Axum/Tokio)\nIntención: Determinística y auditable`
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
      explanation: "Indica cuántos de los 1024 osciladores (matriz 32x32) del Crystal Lattice están portando carga cognitiva. Un exceso de masa indica un posible intento de inyección de entropía (DoS en capa semántica). El Protocolo G-Zero estabiliza la red equilibrando cargas sin algoritmos probabilísticos. [Ref: Protocolo G-Zero].",
      technical: `Valor de masa puro: ${integrity.effective_mass || 0}\nOcupación de Malla: ${integrity.effective_mass ? (integrity.effective_mass / 12960000).toFixed(6) : "0"} (escalado P322)\nCrystal Lattice Size: 1024 (32x32) Nodos\nTipo Math: S60 Exacto\nRatio de Integridad: ${integrity.p322_ratio_integrity || 0}`
    },
    {
      id: "load",
      label: "Carga Cuántica",
      value: integrity.quantum_load !== undefined ? `${integrity.quantum_load}` : "---",
      icon: Database,
      color: "text-orange-400",
      glow: "glow-orange",
      borderColor: "border-orange-500/15",
      bgAccent: "from-orange-500/10",
      subtitle: "Presión Cortex",
      explanation: "Saturación instantánea de los búferes Predictivos V2 (memoria Non-Markovian y WAL RingBuffers). Cada bloque interceptado eleva la presión; una presión sostenida invoca rutinas locales de protección y genera logs forenses auditables por Gemini 2.0. [Ver Docs: arquitectura eBPF Bridge].",
      technical: `Eventos encolados: ${integrity.quantum_load || 0}\nMemoria Predictiva (Non-Markov): ${status?.predictive_memory || 0}%\nFuente de datos: eBPF shared RingBuffer\nTren de Pulsos Globales: ${status?.global_tick || 0}\nCapas WAL activas: 2 (Binary + S60)`
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
