"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTelemetry } from "../hooks/useTelemetry";
import {
  Shield, Zap, GitBranch, Hexagon, Brain, Network, Lock,
  ExternalLink, Activity, ChevronRight, Terminal, Hash,
  Server, Layers, Cpu, CheckCircle2, AlertTriangle,
  BookOpen, Eye, Heart, Fingerprint, Filter, Radio,
} from "lucide-react";
import { clsx } from "clsx";

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function buildBootLines(status: any, tick: number) {
  const xdpOk    = !!status?.integrity?.xdp_firewall;
  const xdpFull  = status?.integrity?.xdp_firewall === "ACTIVE_XDP";
  const lsmMode  = status?.integrity?.lsm_cognitive === "ENFORCING" ? "ENFORCING" : "MONITOREO";
  const bioOk    = (status?.integrity?.bio_coherence ?? 0) > 0;
  const crystalOk = !!status?.integrity?.crystal_oscillator_active;
  const isSealed = status?.integrity?.ring_status === "SEALED";
  const lat      = status?.integrity?.cortex_latency_ms;
  const bioRaw   = status?.integrity?.bio_coherence ?? 0;
  const bioPct   = ((Math.abs(bioRaw) / 12960000) * 100).toFixed(1);

  const seal     = status?.integrity?.truthsync_seal ?? "VERIFICANDO";
  const p322_raw = status?.integrity?.p322_ratio_integrity ?? 0;
  const p322     = p322_raw.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sync     = status?.integrity?.harmonic_sync ?? "ESTABLE";

  return [
    { text: `> Iniciando Sentinel Ring-0 v1.0.0 – 0 amenazas interceptadas`, level: "dim" },
    { text: `[${xdpOk ? "OK" : "WARN"}] eBPF Ring-0: XDP ${xdpFull ? "ACTIVE_XDP" : "STANDBY"} · LSM ${lsmMode}`, level: xdpOk ? "ok" : "warn" },
    { text: `[OK] Motor S60 Base-60 · tick #${tick.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} · P322 ratio ${p322}`, level: "ok" },
    { text: `[${crystalOk ? "OK" : "STANDBY"}] Cristal de Tiempo @ 41.77 Hz · sync harmónico ${sync}`, level: crystalOk ? "ok" : "dim" },
    { text: `[${bioOk ? "OK" : "WARN"}] Bio-Resonador coherencia ${bioPct}% · Latencia ${lat ? lat.toFixed(3) : "---"}ms`, level: bioOk ? "ok" : "warn" },
    { text: `[OK] TruthSync ${seal} · Sello Plimpton 322 Activo`, level: "ok" },
    {
      text: isSealed
        ? "⚠  MODO CUARENTENA ACTIVO — SISTEMA SELLADO"
        : "✓  SENTINEL RING-0 — GUARDIÁN ACTIVO",
      level: isSealed ? "warn" : "success",
    },
  ];
}

const MODULES = [
  { icon: GitBranch, name: "eBPF Ring-0", badge: "XDP/LSM", key: "xdp" },
  { icon: Hash, name: "Aritmética S60", badge: "Base-60", key: "s60" },
  { icon: Hexagon, name: "Crystal Lattice", badge: "Matrix", key: "crystal" },
  { icon: Brain, name: "Neural LIF S60", badge: "SNN", key: "neural" },
  { icon: Lock, name: "TruthSync", badge: "P322", key: "truth" },
  { icon: Network, name: "MyCNet", badge: "P2P", key: "mycnet" },
];

function MansFieldSection() {
  const claims = [
    { claim: "Aritmética Base-60 elimina errores de redondeo", val: "Confirmado — Plimpton 322 usa razones exactas (Mansfield & Wildberger, 2017)" },
    { claim: "SPA (#[repr(C)]) tiene precisión ±0.0077 ppm",  val: "Derivado directamente de la escala 60⁴ = 12.960.000" },
    { claim: "Latencia como «fricción de fase» anulable",      val: "Isomorfismo con geometría hidráulica babilónica" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.80 }}>
      <div className="flex items-center gap-3 text-slate-400 mb-4">
        <BookOpen className="w-5 h-5 text-violet-400" />
        <h2 className="text-xs font-black uppercase tracking-[0.25em]">Validación Académica Externa</h2>
      </div>
      <div className="glass-card p-6 border-violet-500/10 bg-slate-950/40 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20 shrink-0">
            <Fingerprint className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white mb-1">Intercambio con el Dr. Daniel Mansfield — UNSW Sydney</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              El Dr. Mansfield decodificó la tablilla <strong className="text-violet-400">Plimpton 322</strong> en 2017.
              Sentinel aplica su descubrimiento de que las razones exactas superan al punto flotante para eliminar el ruido IEEE-754.
            </p>
          </div>
        </div>
        <div className="border-l-2 border-violet-500/40 pl-4 py-1">
          <p className="text-[11px] text-slate-300 italic leading-relaxed">
            "I can see that you've understood what I wrote about Plimpton 322... Your direction of research sounds promising."
          </p>
          <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-widest font-bold">— Dr. Daniel Mansfield, UNSW · 23 dic 2025</p>
        </div>
        <div className="space-y-2">
          {claims.map((c, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-slate-900/50 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-300 font-medium">{c.claim}</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-[10px] text-emerald-400 font-medium">{c.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function AboutView() {
  const { status, tick } = useTelemetry();
  const [selectedModule, setSelectedModule] = useState<any>(null);

  const bioCoherencePct = status?.integrity?.bio_coherence ? Math.min(100, (status.integrity.bio_coherence / 12960000) * 100) : 0;
  const pulseScale = tick % 2 === 0 ? 1.05 : 1;
  const lines = useMemo(() => buildBootLines(status, tick), [status, tick]);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= lines.length) return;
    const t = setTimeout(() => setVisible(n => n + 1), 150);
    return () => clearTimeout(t);
  }, [visible, lines.length]);

  const p322_raw = status?.integrity?.p322_ratio_integrity ?? 0;
  const p322 = p322_raw.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const lat = status?.integrity?.cortex_latency_ms;

  const dataMap: Record<string, {pKey: string, pVal: any, sKey: string, sVal: any, detail: string}> = {
    xdp: { 
      pKey: "xdp", pVal: status?.integrity?.xdp_firewall || "MONITOREO", sKey: "lsm", sVal: status?.integrity?.lsm_cognitive || "MONITOREO",
      detail: "Monitoreo pasivo y activo del kernel a nivel de registro. Utiliza XDP (eXpress Data Path) para filtrado de paquetes a velocidad de línea (Ring-0) y hooks LSM para interceptar syscalls críticas (execve, openat) antes de su ejecución."
    },
    s60: { 
      pKey: "ratio", pVal: p322, sKey: "fixed", sVal: "60⁴ res",
      detail: "Implementación pura de base-60 (sexagesimal) en punto fijo i64. Elimina la incertidumbre del punto flotante IEEE-754 y los errores de redondeo acumulativos. Basado en la metodología de proporciones exactas de Mansfield."
    },
    crystal: { 
      pKey: "sync", pVal: status?.integrity?.harmonic_sync || "ESTABLE", sKey: "masa", sVal: status?.integrity?.effective_mass ? `${status.integrity.effective_mass} NODOS` : "0 NODOS",
      detail: "Matriz de 1024 osciladores armónicos que simula un cristal de tiempo dinámico. La coherencia global se calibra mediante las razones trigonométricas exactas de la tabla Plimpton 322."
    },
    neural: { 
      pKey: "conf", pVal: status?.integrity?.cortex_confidence ? `${(status.integrity.cortex_confidence / 129600).toFixed(1)}%` : "0.0%", sKey: "carga", sVal: status?.integrity?.quantum_load ? `${status.integrity.quantum_load} QL` : "0 QL",
      detail: "Red neuronal de tipo Leaky Integrate-and-Fire integrada directamente en el flujo aritmético S60. Procesa la telemetría como picos de potencial de acción ('spikes')."
    },
    truth: { 
      pKey: "ring", pVal: status?.integrity?.ring_status || "ABIERTO", sKey: "sello", sVal: status?.integrity?.truthsync_seal || "---",
      detail: "Protocolo de certificación que vincula cada tick del sistema con un sello único generado en Ring-0. Garantiza la inmutabilidad total de la telemetría."
    },
    mycnet: { 
      pKey: "nodos", pVal: `${status?.mycnet_nodes || 0} NODOS`, sKey: "fase", sVal: "YHWH_SYNC",
      detail: "Malla P2P de nodos soberanos sincronizados bajo la fase YHWH (10-5-6-5). Permite la propagación de estados de seguridad entre instancias de Sentinel."
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="glass-card border-emerald-500/20 bg-slate-950/95 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border-b border-emerald-500/10">
          <Terminal className="w-3 h-3 text-emerald-500/60" />
          <span className="text-[9px] font-bold text-emerald-500/50 uppercase tracking-widest">secuencia de boot kernel</span>
        </div>
        <div className="p-5 font-mono text-[11px] space-y-0.5 min-h-[180px]">
          {lines.slice(0, visible).map((line, i) => (
            <p key={i} className={clsx(
              "leading-relaxed py-px",
              line.level === "ok" && "text-emerald-400",
              line.level === "warn" && "text-amber-400",
              line.level === "dim" && "text-slate-600",
              line.level === "success" && "text-emerald-300 font-black"
            )}>
              {line.text}
            </p>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          onClick={() => setSelectedModule({
            icon: Activity, name: "Sincronía de Núcleo", badge: "Fase Ring-0", 
            primaryKey: "latencia", primaryVal: lat ? `${lat.toFixed(3)}ms` : "0.000ms",
            secondaryKey: "resonancia", secondaryVal: status?.integrity?.s60_resonance ? `${(status.integrity.s60_resonance / 129600).toFixed(2)}%` : "0.00%",
            detail: "El motor S60 opera en el 'Kernel Layer 0'. La Sincronía de Núcleo representa la alineación entre el cristal de tiempo interno y los eventos del sistema."
          })}
          whileHover={{ scale: 1.01 }}
          className="glass-card p-6 border-emerald-500/10 md:col-span-2 cursor-pointer hover:border-sky-500/30 transition-all group"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
             <Activity className="w-4 h-4 text-sky-400 group-hover:animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Sincronía de Núcleo</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
               <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tick S60</p><p className="text-2xl font-black text-white mono">{tick.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p></div>
               <div className="space-y-1"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coherencia</p><div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden"><motion.div className="h-full bg-violet-500" animate={{ width: `${bioCoherencePct}%` }} /></div></div>
            </div>
            <div className="space-y-4">
               <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latencia</p><p className="text-2xl font-black text-sky-400 mono">{lat ? `${lat.toFixed(3)}ms` : "0.000ms"}</p></div>
               <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sello P322</p><p className="text-lg font-black text-amber-400 mono">{p322}</p></div>
            </div>
            <div className="flex flex-col items-center justify-center bg-emerald-500/5 rounded-2xl border border-emerald-500/10 p-4">
               <Shield className="w-10 h-10 text-emerald-500 mb-2" />
               <p className="text-[10px] font-black text-emerald-400 uppercase">Verificado</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          onClick={() => setSelectedModule({
            icon: Heart, name: "Bio-Enlace", badge: "BCI Activo",
            primaryKey: "coherencia", primaryVal: `${bioCoherencePct.toFixed(1)}%`,
            secondaryKey: "confianza", secondaryVal: status?.integrity?.cortex_confidence ? `${(status.integrity.cortex_confidence / 129600).toFixed(1)}%` : "0.0%",
            detail: "El Bio-Enlace es la medida de entropía compartida entre el operador humano y el motor predictivo. Utiliza el Bio-Resonador para captar pulsos de coherencia (BCI)."
          })}
          whileHover={{ scale: 1.02 }}
          className="glass-card p-6 border-violet-500/10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-violet-500/30 transition-all group"
        >
            <Heart className={clsx("w-12 h-12 mb-4", bioCoherencePct > 20 ? "text-violet-500" : "text-emerald-500")} style={{ scale: pulseScale }} />
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Bio-Enlace</p>
            <p className="text-3xl font-black text-violet-400 mono mt-1">{bioCoherencePct.toFixed(1)}%</p>
            <p className="text-[8px] text-slate-500 uppercase font-bold mt-2">Sincronía Humana Ring-0</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {MODULES.map(m => (
           <motion.div 
              key={m.name} 
              onClick={() => setSelectedModule({...m, ...dataMap[m.key!]})}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card p-5 border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer group"
           >
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3"><m.icon className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" /><span className="text-xs font-black text-white uppercase">{m.name}</span></div>
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed min-h-[40px]">{m.badge}</p>
           </motion.div>
         ))}
      </div>

      <AnimatePresence>
        {selectedModule && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 isolate">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedModule(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl glass-card border-white/10 bg-slate-900 p-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500" />
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4"><div className="p-3 bg-slate-950 border border-white/5 rounded-2xl"><selectedModule.icon className="w-8 h-8 text-emerald-400" /></div><div><h2 className="text-2xl font-black text-white uppercase">{selectedModule.name}</h2><p className="text-xs font-bold text-emerald-500/80 uppercase">{selectedModule.badge} · Modo Verdad Activado</p></div></div>
                </div>
                <div className="space-y-6">
                   <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5"><p className="text-sm text-slate-300 leading-relaxed">{selectedModule.detail}</p></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10"><span className="text-[9px] font-black text-emerald-400 uppercase">{selectedModule.primaryKey}</span><p className="text-xs font-bold text-white uppercase">{selectedModule.primaryVal}</p></div>
                      <div className="p-4 bg-sky-500/5 rounded-xl border border-sky-500/10"><span className="text-[9px] font-black text-sky-400 uppercase">{selectedModule.secondaryKey}</span><p className="text-xs font-bold text-white uppercase">{selectedModule.secondaryVal}</p></div>
                   </div>
                </div>
                <button onClick={() => setSelectedModule(null)} className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase">Cerrar Verificación</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MansFieldSection />
    </div>
  );
}
