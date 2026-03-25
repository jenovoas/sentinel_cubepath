"use client";

import React, { useEffect, useState, useRef } from "react";
import { Terminal, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="h-full overflow-y-auto w-full font-mono text-[11px] p-4 space-y-2 custom-scrollbar">
      {events.length === 0 && (
        <div className="flex items-center justify-center h-full text-sentinel-500/30 uppercase italic">
          Esperando flujo de datos del kernel...
        </div>
      )}
      {events.map((ev, i) => (
        <div key={i} className={clsx(
          "p-2 border border-sentinel-500/5 rounded bg-sentinel-950/20 group transition-all hover:bg-sentinel-500/5",
          ev.severity >= 3 ? "border-red-500/30 bg-red-950/10" : "border-sentinel-500/5"
        )}>
           <div className="flex items-center gap-3">
              <span className="text-sentinel-500/40 tabular-nums">[{new Date(ev.timestamp_ns / 1000000).toLocaleTimeString()}]</span>
              <span className={clsx(
                "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                ev.severity >= 3 ? "bg-red-500/20 text-red-400" : "bg-sentinel-500/10 text-sentinel-400"
              )}>
                {ev.event_type}
              </span>
              <span className="text-sentinel-300 flex-1 truncate">{ev.pid !== 0 ? `PID: ${ev.pid} | Entropía: ${ev.entropy_s60_raw}` : "System Heartbeat"}</span>
              {ev.severity >= 3 ? <AlertTriangle className="w-3 h-3 text-red-500" /> : <ShieldCheck className="w-3 h-3 text-sentinel-500/40" />}
           </div>
        </div>
      ))}
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return <CheckCircle2 className={className} />;
}
