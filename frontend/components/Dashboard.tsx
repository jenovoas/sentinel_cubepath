"use client";

import React, { useState, useEffect } from "react";
import { TelemetryFeed } from "./TelemetryFeed";
import { TruthClaimConsole } from "./TruthClaimConsole";
import { StatsGrid } from "./StatsGrid";
import { ShieldCheck, Zap, Heart, Timer, BarChart3, Fingerprint } from "lucide-react";
import { ShieldControl } from "./ShieldControl";
import { TruthSyncReport } from "./TruthSyncReport";
import { MyCNetNodeGraph } from "./MyCNetNodeGraph";

export function Dashboard() {
  const [status, setStatus] = useState<any>(null);
  const [cycleTime, setCycleTime] = useState(0);
  const [tick, setTick] = useState(0);
  const [encryptionLayer, setEncryptionLayer] = useState<string>("S60_SHIELD_INITIALIZING");
  const [yhwhPhase, setYhwhPhase] = useState<string>("HE2");
  const [networkOpen, setNetworkOpen] = useState<boolean>(false);

  // Telemetry listener for dynamic encryption layer (SNN+RMM acoplado)
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    let wsUrl: string;
    if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
      wsUrl = apiUrl.replace(/^http/, "ws") + "/api/v1/telemetry";
    } else {
      const proto = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
      const host = typeof window !== "undefined" ? window.location.host : "localhost:8000";
      wsUrl = `${proto}://${host}/api/v1/telemetry`;
    }
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.event_type.startsWith("ENCRYPT_LAYER_")) {
          setEncryptionLayer(event.event_type.replace("ENCRYPT_LAYER_", ""));
        } else if (event.event_type.startsWith("YHWH_PHASE_")) {
          setYhwhPhase(event.event_type.replace("YHWH_PHASE_", ""));
          setNetworkOpen(event.severity === 1);
        }
      } catch (err) {}
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/sentinel_status`);
        const data = await res.json();
        setStatus({ ...data, is_active: true });
      } catch (e) {
        // Honest Offline State
        setStatus({
          ring_status: "UNKNOWN",
          xdp_firewall: "OFFLINE",
          lsm_cognitive: "OFFLINE",
          s60_resonance: 0,
          bio_coherence: 0,
          portal_intensity: 0,
          is_active: false,
          harmonic_sync: "OFFLINE",
        });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [tick]);

  // Phase cycle counter (68s)
  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setTick(t => t + 1);
      setCycleTime(prev => (prev + 1) % 68);
    }, 1000);
    return () => clearInterval(cycleTimer);
  }, []);

  const cyclePercent = (cycleTime / 68) * 100;
  const isPulseTime = cycleTime % 17 === 0 && cycleTime > 0;
  const isResyncTime = cycleTime === 0;

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <StatsGrid status={status} />

      {/* Phase Cycle Bar */}
      <div className="glass-card p-3 scan-line">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Timer className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Phase Cycle</span>
          </div>

          <div className="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${cyclePercent}%`,
                background: isResyncTime
                  ? "linear-gradient(90deg, #0ea5e9, #818cf8)"
                  : isPulseTime
                  ? "linear-gradient(90deg, #10b981, #2dd4bf)"
                  : "linear-gradient(90deg, #1e293b, #334155)",
              }}
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="mono text-[10px] tabular-nums text-slate-500">
              T=<span className="text-white font-bold">{cycleTime}</span>/68s
            </span>
            {isPulseTime && (
              <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 glow-emerald animate-pulse">
                ♥ BIO
              </span>
            )}
            {isResyncTime && (
              <span className="text-[8px] font-bold uppercase tracking-widest text-sky-400 glow-sky animate-pulse">
                ⟳ RESYNC
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}>
        {/* Telemetry Feed (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col overflow-hidden">
          <div className="glass-card overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
                  Ring-0 Telemetry
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3 h-3 text-slate-600" />
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                  Kernel Events
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <TelemetryFeed />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          {/* Truth Claim Console */}
          <div className="glass-card p-5 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
                Truth Claim Console
              </h2>
            </div>
            <TruthClaimConsole />
          </div>

          {/* TruthSync Report */}
          <TruthSyncReport status={status} />

          {/* Bio-Resonance Card */}
          <div className="glass-card p-5 border-l-2 border-l-emerald-500/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="phase-ring p-2">
                <Heart className="w-5 h-5 text-rose-500 bio-heartbeat" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-200">Bio-Resonance</h3>
                <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Dead-Man Switch Active</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Human operator synchronization every <span className="text-emerald-400 font-bold mono">17s</span>.
              System quarantines at <span className="text-rose-400 font-bold mono">0%</span> coherence.
              Phase resets every <span className="text-sky-400 font-bold mono">68s</span>.
            </p>

            {/* Mini coherence bar */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[8px] text-slate-600 font-bold uppercase w-14">Coherence</span>
              <div className="flex-1 bg-slate-950 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${status?.bio_coherence ? Math.min(100, (status.bio_coherence / 12960000) * 100) : 0}%` }}
                />
              </div>
              <span className="text-[9px] mono text-emerald-400 font-bold w-10 text-right">
                {status?.bio_coherence ? `${((status.bio_coherence / 12960000) * 100).toFixed(0)}%` : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MyCNet Hexagonal Mesh */}
      <div className="h-64">
        <MyCNetNodeGraph phase={yhwhPhase} isOpen={networkOpen} />
      </div>

      {/* Bottom Grid for specialized controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <ShieldControl status={status} />
        </div>
        <div className="lg:col-span-2 flex gap-5">
           <div className="glass-card p-6 border-emerald-500/10 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shrink-0">
                      <ShieldCheck className="w-10 h-10 text-emerald-400" />
                   </div>
                   <div>
                      <h2 className="text-lg font-black text-white uppercase tracking-tighter">Sentinel TruthSync Certified</h2>
                      <p className="text-slate-500 text-[10px] font-medium mt-1">
                         Alineación perfecta con la constante fase Plimpton 322 en modelo Zero-Trust.
                      </p>
                   </div>
                </div>
           </div>
           
           <div className="glass-card p-6 border-sky-500/10 flex-1 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Fingerprint className="w-24 h-24 text-sky-400" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-3">
                        <Fingerprint className="w-4 h-4 text-sky-400" />
                        <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
                          Escudo Dinámico Activo
                        </h2>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-sky-500/20 font-mono text-center w-full">
                        <span className="text-sky-400 font-bold tracking-[0.15em] text-[12px] glow-sky">
                            {encryptionLayer}
                        </span>
                    </div>
                    <p className="text-slate-500 text-[8px] uppercase tracking-widest mt-2 text-center font-bold">
                        Cifrado Híbrido Acoplado a SNN + RMM
                    </p>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
}
