"use client";

import React, { useEffect, useState, useRef } from "react";
import { Terminal, AlertTriangle, ShieldCheck, Zap, Heart, Activity, Cpu, ShieldX } from "lucide-react";
import { clsx } from "clsx";

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
  const [events, setEvents] = useState<Event[]>([]);
  const [connected, setConnected] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<Event[]>([]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connect = () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      let wsUrl: string;
      if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
        wsUrl = apiUrl.replace(/^http/, "ws") + "/api/v1/telemetry";
      } else {
        const proto = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
        const host = typeof window !== "undefined" ? window.location.host : "localhost";
        wsUrl = `${proto}://${host}/api/v1/telemetry`;
      }
      
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnected(true);
        console.log("Ring-0 Sentinel: Telemetry WebSocket Connected");
      };

      ws.onclose = () => {
        setConnected(false);
        console.warn("Ring-0 Sentinel: Telemetry WebSocket Closed. Reconnecting in 3s...");
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("Ring-0 Sentinel: Telemetry WebSocket Error", err);
        ws?.close();
      };

      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          queueRef.current = [event, ...queueRef.current].slice(0, 200);
        } catch (err) {
          console.error("WS parse error", err);
        }
      };
    };

    connect();

    const flushTimer = setInterval(() => {
      if (queueRef.current.length > 0) {
        setEvents(queueRef.current.slice(0, 150));
      }
    }, 800);

    return () => {
      ws?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(flushTimer);
    };
  }, []);

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
        connected ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" : "bg-rose-500/5 text-rose-400 border-rose-500/10"
      )}>
        <div className={clsx("w-1.5 h-1.5 rounded-full", connected ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
        {connected ? "Flujo Ring-0 Activo" : "Conectando al Kernel..."}
      </div>

      {/* Scrollable area - strictly contained */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-1.5 border-t border-white/5">
      {visibleEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4">
          <div className="phase-ring p-6">
            <Terminal className="w-10 h-10 text-slate-700" />
          </div>
          <div className="text-center space-y-1">
            <p className="uppercase tracking-[0.25em] font-bold text-[10px]">Esperando Eventos Ring-0</p>
            <p className="text-[9px] text-slate-700 normal-case tracking-normal">La telemetría del kernel aparecerá aquí en tiempo real</p>
          </div>
        </div>
      )}

      {visibleEvents.map((ev, i) => {
        const { icon: Icon, label, colors } = getConfig(ev);
        const isCritical = ev.severity >= 3 || ev.event_type.includes("BLOCKED");

        return (
          <div
            key={`${ev.timestamp_ns}-${i}`}
            className={clsx(
              "px-3 py-2 border rounded-lg transition-all animate-slide-in group",
              colors.border,
              colors.bg,
              isCritical && "severity-critical",
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
                  <Icon className={clsx("w-3.5 h-3.5 shrink-0", colors.text, ev.event_type === "BIO_PULSE" && "bio-heartbeat")} />
                  <span className={clsx("font-bold uppercase tracking-wider truncate text-[11px]", colors.text)}>
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
    </div>
  );
}
