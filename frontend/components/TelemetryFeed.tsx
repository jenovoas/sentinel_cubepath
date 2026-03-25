"use client";

import React, { useEffect, useState } from "react";
import { Terminal, AlertTriangle, ShieldCheck, Zap, Heart, Activity, Cpu } from "lucide-react";
import { clsx } from "clsx";

interface Event {
  timestamp_ns: number;
  pid: number;
  event_type: string;
  entropy_s60_raw: number;
  severity: number;
}

export function TelemetryFeed() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const wsUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace("http", "ws") + "/api/v1/telemetry";
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        setEvents((prev) => [event, ...prev].slice(0, 100));
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    return () => ws.close();
  }, []);

  const getEventStyle = (type: string, severity: number) => {
    if (severity >= 3 || type.includes("BLOCKED")) return "border-rose-500/30 bg-rose-500/5 text-rose-400";
    if (type.includes("BURST")) return "border-amber-500/30 bg-amber-500/5 text-amber-400";
    if (type === "BIO_PULSE") return "border-emerald-500/30 bg-emerald-500/5 text-emerald-400";
    if (type === "QHC_RESET") return "border-sky-500/30 bg-sky-500/5 text-sky-400";
    return "border-slate-800 bg-slate-900/40 text-slate-400";
  };

  const getEventIcon = (type: string, severity: number) => {
    if (severity >= 3 || type.includes("BLOCKED")) return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
    if (type === "BIO_PULSE") return <Heart className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />;
    if (type.includes("BURST")) return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    if (type === "QHC_RESET") return <Activity className="w-3.5 h-3.5 text-sky-400" />;
    return <Cpu className="w-3.5 h-3.5 text-slate-500" />;
  };

  return (
    <div className="h-full overflow-y-auto w-full font-mono text-[10px] p-4 space-y-2 custom-scrollbar">
      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4 opacity-50">
          <Terminal className="w-12 h-12 text-slate-800 animate-pulse" />
          <p className="uppercase tracking-[0.2em] font-bold">Awaiting Ring-0 Telemetry...</p>
        </div>
      )}
      {events.map((ev, i) => (
        <div 
          key={i} 
          className={clsx(
            "p-2.5 border rounded-lg transition-all hover:bg-white/5 animate-in slide-in-from-left-2 duration-300",
            getEventStyle(ev.event_type, ev.severity)
          )}
        >
           <div className="flex items-center gap-3">
              <span className="opacity-40 tabular-nums">[{new Date(ev.timestamp_ns / 1000000).toLocaleTimeString()}]</span>
              
              <div className="flex items-center gap-2 flex-1">
                {getEventIcon(ev.event_type, ev.severity)}
                <span className="font-bold uppercase tracking-wider">{ev.event_type}</span>
              </div>

              <div className="flex items-center gap-4 text-xs">
                {ev.pid !== 0 && (
                  <span className="opacity-70">
                    PID <span className="text-white">{ev.pid}</span>
                  </span>
                )}
                <span className="opacity-70">
                  RESONANCE <span className="text-white mono">{(ev.entropy_s60_raw / 129600).toFixed(2)}%</span>
                </span>
              </div>
           </div>
        </div>
      ))}
    </div>
  );
}
