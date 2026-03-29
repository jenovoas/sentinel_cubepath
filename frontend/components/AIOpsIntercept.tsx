"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Terminal, Lock, AlertOctagon } from "lucide-react";
import { clsx } from "clsx";

interface InterceptEvent {
  timestamp_ns: number;
  pid: number;
  event_type: string;
  message: string;
  severity: number;
}

export function AIOpsIntercept() {
  const [activeEvent, setActiveEvent] = useState<InterceptEvent | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connect = () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      let wsUrl: string;
      if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
        wsUrl = apiUrl.replace(/^http/, "ws") + "/api/v1/telemetry";
      } else {
        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        wsUrl = `${proto}://${window.location.host}/api/v1/telemetry`;
      }
      
      ws = new WebSocket(wsUrl);

      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          // ESCUCHAR SOLO BLOQUEOS Y SEGURIDAD CRÍTICA
          if (event.event_type.includes("BLOCKED") || event.severity >= 4) {
             triggerIntercept(event);
          }
        } catch (err) {}
      };

      ws.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    const triggerIntercept = (event: InterceptEvent) => {
      setActiveEvent(event);
      setShake(true);
      
      // Audio feedback (opcional, pero impactante para hackaton)
      // Note: El navegador bloquea audio auto-play, así que solo visual por ahora.
      
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setActiveEvent(null), 4000); // 4 segundos de exposición
    };

    connect();

    return () => {
      ws?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes glitch-shake {
          0% { transform: translate(0); }
          20% { transform: translate(-5px, 5px); }
          40% { transform: translate(-5px, -5px); }
          60% { transform: translate(5px, 5px); }
          80% { transform: translate(5px, -5px); }
          100% { transform: translate(0); }
        }
        .animate-glitch {
          animation: glitch-shake 0.2s cubic-bezier(.25,.46,.45,.94) infinite;
        }
        .screen-flash {
          position: fixed;
          inset: 0;
          background: rgba(244, 63, 94, 0.1);
          pointer-events: none;
          z-index: 9998;
        }
      `}</style>

      {/* Screen Shake container */}
      <div className={clsx("fixed inset-0 pointer-events-none z-[10000] transition-all", shake && "animate-glitch")}>
        <AnimatePresence>
          {activeEvent && (
            <>
              {/* Alerta de Fondo */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="screen-flash"
              />

              {/* Overlay de Intercepción */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0, y: -20 }}
                className="fixed bottom-12 right-12 w-[400px] glass-card border-rose-500/50 bg-rose-950/20 p-6 shadow-[0_0_50px_rgba(244,63,94,0.2)]"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-500 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                    <ShieldAlert className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-rose-400 uppercase tracking-widest italic">Intercepción Ring-0</h4>
                      <span className="text-[10px] mono text-rose-500/60 font-medium">#{activeEvent.timestamp_ns.toString().slice(-6)}</span>
                    </div>
                    <div className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                       {activeEvent.event_type.replace("_", " ")}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-rose-300/80 uppercase tracking-wide bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                       <Lock className="w-3 h-3" /> Acceso Denegado por Política Sentinel
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3 bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[10px]">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>PID ORIGEN</span>
                    <span className="text-white font-bold">{activeEvent.pid}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>SEVERIDAD CORTEX</span>
                    <span className="text-rose-500 font-bold">CRÍTICO ({activeEvent.severity}/5)</span>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[11px] text-slate-300 italic leading-relaxed">
                     "{activeEvent.message}"
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-rose-900/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "100%" }} 
                      animate={{ width: "0%" }} 
                      transition={{ duration: 4, ease: "linear" }}
                      className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                    />
                  </div>
                  <span className="text-[9px] font-black text-rose-500 uppercase">Bloqueo Activo</span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
