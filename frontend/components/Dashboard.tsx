"use client";

import React, { useState, useEffect } from "react";
import { TelemetryFeed } from "./TelemetryFeed";
import { TruthClaimConsole } from "./TruthClaimConsole";
import { StatsGrid } from "./StatsGrid";
import { ShieldCheck, Zap, Heart, Timer, BarChart3, Fingerprint } from "lucide-react";
import { ShieldControl } from "./ShieldControl";
import { TruthSyncReport } from "./TruthSyncReport";
import { MyCNetNodeGraph } from "./MyCNetNodeGraph";
import { Sidebar } from "./Sidebar";
import { AIOpsShieldView } from "./AIOpsShieldView";
import { clsx } from "clsx";

export function Dashboard() {
  const [status, setStatus] = useState<any>(null);
  const [cycleTime, setCycleTime] = useState(0);
  const [tick, setTick] = useState(0);
  const [encryptionLayer, setEncryptionLayer] = useState<string>("S60_SHIELD_INITIALIZING");
  const [yhwhPhase, setYhwhPhase] = useState<string>("HE2");
  const [networkOpen, setNetworkOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

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
    <div className="flex gap-6 h-[calc(100vh-240px)] overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
        {activeTab === "dashboard" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
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
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
              <div className="lg:col-span-2 flex flex-col overflow-hidden">
                <div className="glass-card overflow-hidden flex flex-col h-full border-white/5">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
                        Ring-0 Telemetry
                      </h2>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <TelemetryFeed />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="glass-card p-5 flex flex-col flex-1 border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
                      Truth Claim Console
                    </h2>
                  </div>
                  <TruthClaimConsole />
                </div>

                <TruthSyncReport status={status} />

                <div className="glass-card p-5 border-l-2 border-l-emerald-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="phase-ring p-2">
                      <Heart className="w-5 h-5 text-rose-500 bio-heartbeat" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-200">Bio-Resonance</h3>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
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

            {/* Specialized Controls Bottom */}
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
                      <p className="text-slate-500 text-[10px] font-medium mt-1 uppercase tracking-[0.2em]">
                        Plimpton 322 Phase Alignment Verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "aiops_shield" ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
             <div className="mb-6 flex items-center justify-between">
                <div>
                   <h1 className="text-3xl font-black uppercase tracking-tighter text-white">IA Ops Shield</h1>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Multi-Layer Cognitive Defense Suite</p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">Núcleo s60 Activo</span>
                </div>
             </div>
             <AIOpsShieldView status={status} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-600 space-y-4 glass-card border-dashed">
             <Lock className="w-12 h-12 opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Modulo: {activeTab} en proceso de sincronización s60...</p>
          </div>
        )}
      </div>
    </div>
  );
}
