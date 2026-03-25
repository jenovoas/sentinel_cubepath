"use client";

import React, { useState, useEffect } from "react";
import { TelemetryFeed } from "./TelemetryFeed";
import { TruthClaimConsole } from "./TruthClaimConsole";
import { StatsGrid } from "./StatsGrid";
import { Activity, ShieldCheck, Zap, Heart } from "lucide-react";

export function Dashboard() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/sentinel_status`);
        const data = await res.json();
        setStatus(data);
      } catch (e) {
        console.error("Failed to fetch status", e);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <StatsGrid status={status} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 glass-card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-sentinel-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sentinel-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-sentinel-300">Ring-0 Telemetry</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-sentinel-500 font-bold uppercase">Real-time Stream</span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <TelemetryFeed />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex-1 glass-card p-6 flex flex-col space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-sentinel-300">Truth Claim Console</h2>
            </div>
            <TruthClaimConsole />
          </div>

          <div className="glass-card p-6 border-l-4 border-l-sentinel-500">
             <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
                <h3 className="font-bold text-sentinel-100">Bio-Resonance Pulse</h3>
             </div>
             <p className="text-xs text-sentinel-400 leading-relaxed font-mono">
               Sincronización semántica con el operador humano cada 60s (S60). El umbral de resonancia actual es {status?.bio_coherence || "calculando..."}.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
