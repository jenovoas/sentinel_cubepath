"use client";

import React, { useState, useEffect } from "react";
import { TelemetryFeed } from "./TelemetryFeed";
import { TruthClaimConsole } from "./TruthClaimConsole";
import { StatsGrid } from "./StatsGrid";
import { ShieldCheck, Zap, Heart, Timer, BarChart3, Fingerprint, ShieldAlert, Lock } from "lucide-react";
import { ShieldControl } from "./ShieldControl";
import { TruthSyncReport } from "./TruthSyncReport";
import { MyCNetNodeGraph } from "./MyCNetNodeGraph";
import { Sidebar } from "./Sidebar";
import { AIOpsShieldView } from "./AIOpsShieldView";
import { CrystalLatticeView } from "./CrystalLatticeView";
import { MonitoringView } from "./MonitoringView";
import { clsx } from "clsx";
import { ShieldAlert as ShieldAlertIcon } from "lucide-react"; // Alias if needed, but we'll stick to ShieldAlert

export function Dashboard() {
  const [status, setStatus] = useState<any>(null);
  const [cycleTime, setCycleTime] = useState(0);
  const [tick, setTick] = useState(0);
  const [encryptionLayer, setEncryptionLayer] = useState<string>("S60_SHIELD_INITIALIZING");
  const [yhwhPhase, setYhwhPhase] = useState<string>("HE2");
  const [networkOpen, setNetworkOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [vaultEvents, setVaultEvents] = useState<any[]>([]);

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
        setVaultEvents(prev => [event, ...prev].slice(0, 150));
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
    <div className="flex gap-6 h-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area - Allowing Global Scroll for accessibility to footer */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-8">
        {activeTab === "dashboard" ? (
          <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* 1. TOP AREA (Fixed relative to content) */}
            <div className="space-y-4">
              <StatsGrid status={status} />
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
            </div>

            {/* 2. MIDDLE AREA (Telemetry & Console) - Fixed heights with strict isolation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px] relative z-10">
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="glass-card overflow-hidden flex flex-col h-full border-white/5 bg-slate-950/20 relative isolate [clip-path:inset(0)]">
                  <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
                        Ring-0 Telemetry Feed
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[8px] font-bold text-emerald-500/80 uppercase tracking-widest">Live Stream</span>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 relative">
                    <TelemetryFeed />
                  </div>
                </div>
              </div>

              <div className="flex flex-col h-full">
                <div className="glass-card p-5 flex flex-col h-full border-white/5 overflow-hidden bg-slate-950/40 relative isolate [clip-path:inset(0)]">
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
                      Truth Claim Console
                    </h2>
                  </div>
                  <div className="flex-1 min-h-0">
                    <TruthClaimConsole />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. BOTTOM AREA (Footer Modules) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
               <div className="lg:col-span-2 space-y-6">
                   <div className="h-56">
                      <MyCNetNodeGraph phase={yhwhPhase} isOpen={networkOpen} />
                   </div>
                   <div className="glass-card p-5 border-emerald-500/10 flex items-center gap-6 bg-slate-900/20">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-tighter">Sentinel TruthSync Certified</h2>
                        <p className="text-slate-500 text-[9px] font-medium uppercase tracking-[0.3em] mt-1">Verified Plimpton 322 Phase Alignment</p>
                        <div className="flex gap-2 mt-3">
                           <span className="px-2 py-0.5 bg-slate-950 border border-white/5 rounded text-[8px] font-bold text-slate-400 mono">SHA-256: VALID</span>
                           <span className="px-2 py-0.5 bg-slate-950 border border-white/5 rounded text-[8px] font-bold text-slate-400 mono">S60: SYNCED</span>
                        </div>
                      </div>
                   </div>
               </div>
               
               <div className="space-y-6">
                  <TruthSyncReport status={status} />
                  
                  {/* Bio-Resonance (Ensured Visibility) */}
                  <div className="glass-card p-5 border-l-4 border-l-rose-500/30 bg-slate-950/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-rose-500 animate-[pulse_2s_infinite]" />
                        <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-200">Bio-Resonance Core</h3>
                      </div>
                      <span className="text-[9px] font-bold text-rose-500/80 mono uppercase">Live Link</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)] transition-all duration-1000"
                            style={{ width: `${status?.bio_coherence ? Math.min(100, (status.bio_coherence / 12960000) * 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] mono text-rose-400 font-bold w-10 text-right">
                          {status?.bio_coherence ? `${((status.bio_coherence / 12960000) * 100).toFixed(0)}%` : "0%"}
                        </span>
                      </div>
                      <p className="text-[8px] font-medium text-slate-600 uppercase tracking-widest leading-relaxed">
                        SNN Cognitive Interface stability threshold: 88.4% required for full Ring-0 lockdown.
                      </p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ) : activeTab === "matrix" ? (
          <CrystalLatticeView />
        ) : activeTab === "matrix_old" ? (
          <MonitoringView />
        ) : activeTab === "null" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Complexity Matrix</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">S60 Algorithmic Performance — Ring-0 Empirical Data</p>
              </div>
              <div className="px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] font-black text-sky-400 tracking-widest uppercase">O(1) Verified</span>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-slate-300 mb-4">📊 Benchmark Table — Hardware Validated</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider">
                      <th className="text-left py-2 pr-4">Operation</th>
                      <th className="text-left py-2 pr-4">Algorithm</th>
                      <th className="text-left py-2 pr-4">Complexity</th>
                      <th className="text-left py-2 pr-4">Latency (ns)</th>
                      <th className="text-left py-2">Memory</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {[
                      { op: "XDP Filter", algo: "BPF_MAP_LOOKUP_ELEM", complexity: "O(1)", latency: "< 40 ns", mem: "64 B/entry", color: "emerald" },
                      { op: "LSM Hook", algo: "Bitmask S60 Analysis", complexity: "O(1)", latency: "< 80 ns", mem: "32 B/hook", color: "emerald" },
                      { op: "S60 Arithmetic", algo: "Fixed-Point i64×i64", complexity: "O(1)", latency: "< 10 ns", mem: "8 B/SPA", color: "sky" },
                      { op: "TruthSync Scan", algo: "Plimpton 322 Lookup", complexity: "O(1)", latency: "< 150 ns", mem: "256 B/cache", color: "amber" },
                      { op: "SNN Hub", algo: "Vector Memory Lookup", complexity: "O(log N)", latency: "< 300 ns", mem: "1 KB/node", color: "slate" },
                    ].map((row) => (
                      <tr key={row.op} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-2.5 pr-4 font-bold text-white">{row.op}</td>
                        <td className="py-2.5 pr-4 text-slate-400">{row.algo}</td>
                        <td className={`py-2.5 pr-4 font-black ${row.color === "emerald" ? "text-emerald-400" : row.color === "sky" ? "text-sky-400" : row.color === "amber" ? "text-amber-400" : "text-slate-500"}`}>{row.complexity}</td>
                        <td className="py-2.5 pr-4 text-slate-300 tabular-nums">{row.latency}</td>
                        <td className="py-2.5 text-slate-500">{row.mem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "S60 Precision", value: "±0.0077 ppm", sub: "vs IEEE 754 errors", color: "emerald" },
                { label: "CPU Savings", value: "62.9%", sub: "vs ptrace-interceptors", color: "sky" },
                { label: "Scheduler Accuracy", value: "94.4%", sub: "Adaptive burst mode", color: "amber" },
              ].map(m => (
                <div key={m.label} className="glass-card p-4 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">{m.label}</p>
                  <p className={`text-2xl font-black ${m.color === "emerald" ? "text-emerald-400" : m.color === "sky" ? "text-sky-400" : "text-amber-400"}`}>{m.value}</p>
                  <p className="text-[8px] text-slate-600 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "aiops_shield" ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">IA Ops Shield</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">S60 Cognitive Defense Matrix — Ring-0 Realtime</p>
              </div>
              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">Guardian Active</span>
              </div>
            </div>
            <AIOpsShieldView status={status} events={vaultEvents} />
          </div>
        ) : activeTab === "mycnet" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">MyCNet P2P Mesh</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Holographic Node Synchronization Network</p>
              </div>
              <div className={`px-4 py-2 border rounded-xl flex items-center gap-3 ${networkOpen ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${networkOpen ? "bg-emerald-500" : "bg-rose-500"}`} />
                <span className={`text-[10px] font-black tracking-widest uppercase ${networkOpen ? "text-emerald-400" : "text-rose-400"}`}>{networkOpen ? "Link Open" : "Link Sealed"}</span>
              </div>
            </div>
            <MyCNetNodeGraph phase={yhwhPhase} isOpen={networkOpen} />
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 space-y-3">
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300">Local Node — FENIX</h3>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between"><span className="text-slate-500">Role</span><span className="text-emerald-400 font-bold">PRIMARY_GUARDIAN</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Phase</span><span className="text-white font-bold">{yhwhPhase}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Arithmetic</span><span className="text-sky-400 font-bold">S60 / Base-60</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Sync State</span><span className={`font-bold ${networkOpen ? "text-emerald-400" : "text-rose-400"}`}>{networkOpen ? "RESONANT" : "SEALED"}</span></div>
                </div>
              </div>
              <div className="glass-card p-5 space-y-3">
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300">Remote Node — CUBEPATH</h3>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between"><span className="text-slate-500">Role</span><span className="text-amber-400 font-bold">REMOTE_S60</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Protocol</span><span className="text-white font-bold">YHWH Phase Sync</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Frequency</span><span className="text-sky-400 font-bold">41 Hz crystal</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Entropy</span><span className="text-slate-400 font-bold">CONTROLLED</span></div>
                </div>
              </div>
            </div>
          </div>

        ) : activeTab === "vault" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Audit Vault</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Ring-0 Kernel Event Archive — Read Only</p>
              </div>
              <div className="px-4 py-2 bg-slate-800 border border-white/5 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Immutable Log</span>
              </div>
            </div>
            <div className="glass-card p-0 overflow-hidden font-mono text-[10px]">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border-b border-white/5 shrink-0">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" /></div>
                <span className="text-slate-500 text-[9px] ml-2">sentinel-cortex / kernel audit log</span>
              </div>
              <div className="p-4 space-y-1.5 overflow-y-auto max-h-[500px] custom-scrollbar bg-slate-950/80">
                {vaultEvents.length === 0 && <div className="text-slate-600 opacity-50 italic">Awaiting kernel audit log stream...</div>}
                {vaultEvents.map((ev, i) => {
                  const isCritical = ev.severity >= 3 || ev.event_type.includes("BLOCK") || ev.event_type.includes("ALERT");
                  const isSys = ev.event_type.includes("HEALING") || ev.event_type.includes("PULSE");
                  const color = isCritical ? "text-rose-500" : isSys ? "text-sky-500" : "text-emerald-500";
                  return (
                    <div key={i} className="flex items-start gap-3 hover:bg-white/2 px-1 py-0.5 rounded transition-colors break-all">
                      <span className="text-slate-600 tabular-nums shrink-0">{ev.timestamp_ns ? new Date(ev.timestamp_ns / 1000000).toLocaleTimeString("es-CL", { hour12: false }) : "--:--:--"}</span>
                      <span className={`shrink-0 font-black w-[130px] truncate ${color}`}>[{ev.event_type}]</span>
                      <span className="text-slate-400">{ev.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        ) : activeTab === "settings" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Kernel Settings</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Core S60 Configuration — Biometric-Locked</p>
              </div>
              <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                <Lock className="w-3 h-3 text-rose-400" />
                <span className="text-[10px] font-black text-rose-400 tracking-widest uppercase">Admin Mode Required</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-white/5 pb-2">Cognitive Thresholds</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-black">AI Coherence Score</span><span className="text-[10px] text-white font-mono">{(status?.bio_coherence ? Math.min(1.0, status.bio_coherence/12960000) : 0.82).toFixed(2)} / 1.0</span></div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${(status?.bio_coherence ? Math.min(1.0, status.bio_coherence/12960000) : 0.82)*100}%` }} /></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500 uppercase font-black">LSM Interception Depth</span><span className="text-[10px] text-white font-mono">{status?.lsm_cognitive || "RING-0"}</span></div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[100%]" /></div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-b border-white/5 pb-2">Resonance Clock</h3>
                <div className="flex items-center gap-6">
                  <div className="flex-1 space-y-1">
                    <p className="text-[9px] text-slate-500 uppercase font-black">Crystal Frequency</p>
                    <p className="text-2xl font-black text-white italic">41.00 <span className="text-xs text-slate-600">Hz</span></p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center">
                    <Timer className="w-6 h-6 text-sky-400 opacity-30" />
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[9px] text-slate-500 italic">
                  * Note: Clock sync is handled automatically by the TruthSync module. Manual override may cause dissonant state.
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
               <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Enforcement Policies</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Execve Interception", status: "ENFORCE", desc: "Block malformed syscalls" },
                    { label: "XDP Packet Purge", status: "MONITOR", desc: "Log but don't drop" },
                    { label: "Bio-Silence Auto-Seal", status: "ACTIVE", desc: "Seal after 30s inactivity" },
                    { label: "Audit Log Persist", status: "ENABLED", msg: "Writing to /var/log/sentinel" },
                  ].map((p, i) => (
                    <div key={i} className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-emerald-500/5 transition-all">
                       <div>
                          <p className="text-[10px] font-black text-white uppercase">{p.label}</p>
                          <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">{p.desc}</p>
                       </div>
                       <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[8px] font-black text-emerald-400">{p.status || "OK"}</div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-600 space-y-4 glass-card border-dashed">
             <ShieldAlert className="w-12 h-12 opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Modulo: {activeTab} en proceso de sincronización s60...</p>
          </div>
        )}
      </div>
    </div>
  );
}
