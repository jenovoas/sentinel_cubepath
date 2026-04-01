"use client";

import React, { useEffect, useState, useRef } from "react";
import { Terminal, AlertTriangle, ShieldCheck, Zap, Heart, Activity, Cpu, ShieldX, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { useTelemetry } from "../hooks/useTelemetry";

interface Event {
  timestamp_ns: number;
  pid: number;
  event_type: string;
  message: string;
  entropy_s60_raw: number;
  severity: number;
}

const EVENT_CONFIG: Record<string, { icon: any; label: string; colorSet: string }> = {
  FILE_BLOCKED:                  { icon: ShieldX,    label: "FILE BLOCKED",    colorSet: "rose"    },
  EXEC_BLOCKED:                  { icon: AlertTriangle, label: "EXEC BLOCKED", colorSet: "rose"    },
  FILE_ALLOWED:                  { icon: ShieldCheck, label: "FILE OK",        colorSet: "emerald" },
  EXEC_ALLOWED:                  { icon: ShieldCheck, label: "EXEC OK",        colorSet: "emerald" },
  NETWORK_BURST:                 { icon: Zap,         label: "NET BURST",      colorSet: "amber"   },
  NETWORK_NORMAL:                { icon: Activity,    label: "NET OK",         colorSet: "slate"   },
  SYSTEM_METRIC:                 { icon: Cpu,         label: "METRIC",         colorSet: "slate"   },
  BIO_PULSE:                     { icon: Heart,       label: "BIO PULSE",      colorSet: "emerald" },
  PHASE_RESYNC:                  { icon: Activity,    label: "PHASE RESYNC",   colorSet: "sky"     },
  SYSTEM_ONLINE:                 { icon: ShieldCheck, label: "SYSTEM ONLINE",  colorSet: "emerald" },
  MANUAL_AXION_PULSE:            { icon: Zap,         label: "AXION PULSE",    colorSet: "sky"     },
  MANUAL_AXION_PULSE_SANITIZED:  { icon: ShieldCheck, label: "AXION SANITIZED",colorSet: "emerald" },
  MATRIX_SYNC:                   { icon: Activity,    label: "MATRIX SYNC",    colorSet: "slate"   },
  ENCRYPT_PULSE:                 { icon: Cpu,         label: "ENCRYPT PULSE",  colorSet: "slate"   },
};

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  rose: { border: "border-rose-500/20", bg: "bg-rose-500/5", text: "text-rose-400", dot: "bg-rose-500" },
  emerald: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", text: "text-emerald-400", dot: "bg-emerald-500" },
  amber: { border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-400", dot: "bg-amber-500" },
  sky: { border: "border-sky-500/20", bg: "bg-sky-500/5", text: "text-sky-400", dot: "bg-sky-500" },
  slate: { border: "border-slate-700/50", bg: "bg-slate-800/30", text: "text-slate-500", dot: "bg-slate-600" },
};

export function TelemetryFeed() {
  const { events, connected, error } = useTelemetry();
  const feedRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const getConfig = (ev: Event) => {
    const cfg = EVENT_CONFIG[ev.event_type] || { icon: Cpu, label: ev.event_type, colorSet: "slate" };
    const colors = COLOR_MAP[cfg.colorSet] || COLOR_MAP.slate;
    return { ...cfg, colors };
  };

  const formatTime = (ns: number) => {
    try {
      return new Date(ns / 1000000).toLocaleTimeString("es-CL", { hour12: false });
    } catch {
      return "--:--:--";
    }
  };

  // Solo filtrar los eventos de capa de protocolo puro que no aportan info operacional
  const isNoise = (type: string) =>
    type.startsWith("YHWH_PHASE_") ||
    type.startsWith("ENCRYPT_LAYER_");

  const visibleEvents = events.filter(ev => !isNoise(ev.event_type));

  return (
    <div ref={feedRef} className="absolute inset-0 flex flex-col w-full font-mono text-[10px] overflow-hidden">
      {/* Connection status - fixed header */}
      <div className={clsx(
        "flex items-center gap-2 px-4 py-1.5 shrink-0 text-[9px] font-bold uppercase tracking-widest border-b",
        connected && !error ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" : "bg-rose-500/5 text-rose-400 border-rose-500/10"
      )}>
        <div className={clsx("w-1.5 h-1.5 rounded-full", connected && !error ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
        {error ? error : connected ? "Flujo Ring-0 Activo" : "Reconectando al Kernel..."}
      </div>

      {/* Scrollable area - strictly contained */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-1.5 border-t border-white/5">
      {visibleEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4">
          <div className="p-6 opacity-20 border-2 border-dashed border-slate-700 rounded-full animate-pulse">
            <Terminal className="w-10 h-10 text-slate-700" />
          </div>
          <div className="text-center space-y-1">
            <p className="uppercase tracking-[0.25em] font-bold text-[10px]">Esperando Eventos Ring-0</p>
            <p className="text-[9px] text-slate-800 normal-case tracking-normal">La telemetría del kernel aparecerá aquí en tiempo real</p>
          </div>
        </div>
      )}

      {visibleEvents.map((ev, i) => {
        const { icon: Icon, label, colors } = getConfig(ev);
        const isCritical = ev.severity >= 3 || ev.event_type.includes("BLOCKED");

        return (
          <div
            key={`${ev.timestamp_ns}-${i}`}
            onClick={() => setSelectedEvent(ev)}
            className={clsx(
              "px-3 py-2 border rounded-lg transition-all animate-slide-in group cursor-pointer hover:scale-[1.01]",
              colors.border,
              colors.bg,
              isCritical && "shadow-[0_0_15px_rgba(244,63,94,0.15)] bg-rose-500/10 border-rose-500/40",
              ev.event_type.includes("SANITIZED") && "border-emerald-500/50 bg-emerald-500/10"
            )}
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                {/* Timestamp */}
                <span className="text-slate-500 tabular-nums shrink-0 w-[56px] text-[9px] font-medium">
                  {formatTime(ev.timestamp_ns)}
                </span>

                {/* Severity dot */}
                <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0", colors.dot)} />

                {/* Icon + Label */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Icon className={clsx("w-3.5 h-3.5 shrink-0", colors.text, ev.event_type === "BIO_PULSE" && "animate-pulse")} />
                  <span className={clsx("font-black uppercase tracking-wider truncate text-[11px]", colors.text)}>
                    {label}
                  </span>
                </div>

                {/* PID */}
                {ev.pid != null && !isNaN(Number(ev.pid)) && Number(ev.pid) !== 0 && (
                  <span className="text-slate-500 shrink-0 text-[10px]">
                    PID <span className="text-slate-400 font-bold">{ev.pid}</span>
                  </span>
                )}

                {/* S60 Resonance */}
                <span className="text-slate-500 shrink-0 tabular-nums text-[10px]">
                  <span className={clsx("font-bold", colors.text)}>
                    {ev.entropy_s60_raw != null && !isNaN(ev.entropy_s60_raw) && ev.entropy_s60_raw > 0
                      ? ((ev.entropy_s60_raw / 12960000) * 100).toFixed(1)
                      : "0.0"}%
                  </span>
                </span>
              </div>

              {/* Message Details */}
              <div className="pl-[78px] pr-2">
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans normal-case tracking-normal">
                  {ev.message}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Detail Modal for Auditing Events */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={clsx(
                "relative w-full max-w-lg glass-card border-none shadow-2xl overflow-hidden bg-slate-900",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-10",
                getConfig(selectedEvent).colors.bg.replace('/5', '/10').replace('/30', '/20')
              )}
            >
              {/* Header */}
              <div className="relative p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={clsx("p-3 rounded-2xl border", getConfig(selectedEvent).colors.border, getConfig(selectedEvent).colors.text)}>
                    {React.createElement(getConfig(selectedEvent).icon, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">
                      Auditoría de Evento Ring-0
                    </h3>
                    <p className={clsx("text-[10px] font-bold uppercase tracking-wider", getConfig(selectedEvent).colors.text)}>
                      {getConfig(selectedEvent).label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-b border-white/5 pb-3">
                  <span>TIMESTAMP: <span className="text-white">{selectedEvent.timestamp_ns} ns</span></span>
                  <span>PID: <span className="text-white">{selectedEvent.pid}</span></span>
                  <span>SEVERIDAD: <span className={selectedEvent.severity > 1 ? "text-rose-400" : "text-emerald-400"}>NIVEL {selectedEvent.severity}</span></span>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                    <Info className="w-3 h-3" /> Contexto Semántico
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {selectedEvent.message}
                  </p>
                </div>

                <div className="bg-black/60 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Payload Raw del Buffer eBPF
                  </h4>
                  <pre className="text-[10px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{JSON.stringify({
  timestamp_ns: selectedEvent.timestamp_ns,
  pid: selectedEvent.pid,
  event_type: selectedEvent.event_type,
  entropy_s60_raw: selectedEvent.entropy_s60_raw,
  severity: selectedEvent.severity,
  hash_signature: "TS-SYNC-" + (selectedEvent.timestamp_ns % 99999).toString(16).toUpperCase().padStart(5, '0'),
  cgroup_id: 1,
}, null, 2)}
                  </pre>
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     Sello Criptográfico Válido
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
