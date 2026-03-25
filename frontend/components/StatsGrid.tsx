"use client";

import React from "react";
import { Shield, Zap, Activity, Heart, Globe, Cpu } from "lucide-react";
import { clsx } from "clsx";

interface StatsGridProps {
  status: any;
}

export function StatsGrid({ status }: StatsGridProps) {
  const bioCoherence = status?.bio_coherence || 0;
  const bioPercent = Math.min(100, (bioCoherence / 12960000) * 100);

  const stats = [
    {
      label: "System Integrity",
      value: status?.ring_status === "SEALED" ? "SEALED" : "BREACH",
      icon: Shield,
      color: status?.ring_status === "SEALED" ? "text-emerald-400" : "text-rose-400",
      glow: status?.ring_status === "SEALED" ? "glow-emerald" : "glow-rose",
      borderColor: status?.ring_status === "SEALED" ? "border-emerald-500/20" : "border-rose-500/20",
      bgAccent: status?.ring_status === "SEALED" ? "from-emerald-500/10" : "from-rose-500/10",
      pulse: status?.ring_status === "SEALED",
      subtitle: "Ring-0 Lock",
    },
    {
      label: "S60 Resonance",
      value: status?.s60_resonance ? `${(status.s60_resonance / 12960000 * 100).toFixed(1)}%` : "0.0%",
      icon: Zap,
      color: "text-sky-400",
      glow: "glow-sky",
      borderColor: "border-sky-500/15",
      bgAccent: "from-sky-500/10",
      subtitle: "Base-60 Core",
    },
    {
      label: "Portal Phase",
      value: status?.harmonic_sync || "STABLE",
      icon: Activity,
      color: status?.harmonic_sync === "RESONANCE_MAX" ? "text-violet-400" : "text-slate-400",
      glow: status?.harmonic_sync === "RESONANCE_MAX" ? "glow-sky" : "",
      borderColor: "border-violet-500/15",
      bgAccent: "from-violet-500/10",
      subtitle: "Multi-Harmonic",
    },
    {
      label: "Bio-Coherence",
      value: `${bioPercent.toFixed(1)}%`,
      icon: Heart,
      color: bioPercent > 50 ? "text-rose-400" : "text-rose-600",
      glow: bioPercent > 80 ? "glow-rose" : "",
      borderColor: "border-rose-500/15",
      bgAccent: "from-rose-500/10",
      pulse: true,
      subtitle: "Human Sync",
      bar: bioPercent,
    },
    {
      label: "XDP Firewall",
      value: status?.xdp_firewall ? "ACTIVE" : "OFFLINE",
      icon: Globe,
      color: "text-indigo-400",
      glow: "",
      borderColor: "border-indigo-500/15",
      bgAccent: "from-indigo-500/10",
      subtitle: "< 0.1ms Latency",
    },
    {
      label: "LSM Cognitive",
      value: "ENABLED",
      icon: Cpu,
      color: "text-amber-400",
      glow: "glow-amber",
      borderColor: "border-amber-500/15",
      bgAccent: "from-amber-500/10",
      subtitle: "Semantic Filter",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={clsx(
            "glass-card p-4 flex flex-col items-center text-center space-y-3 relative overflow-hidden group cursor-default",
            stat.borderColor
          )}
        >
          {/* Background gradient accent */}
          <div className={clsx(
            "absolute inset-0 bg-gradient-to-b to-transparent opacity-50",
            stat.bgAccent
          )} />

          {/* Icon */}
          <div className={clsx(
            "relative z-10 p-2.5 rounded-xl border",
            stat.borderColor,
            stat.color,
            stat.pulse && "status-pulse"
          )}>
            <stat.icon className={clsx("w-5 h-5", stat.pulse && "bio-heartbeat")} />
          </div>

          {/* Value */}
          <div className="relative z-10 space-y-0.5">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em]">
              {stat.label}
            </p>
            <p className={clsx("text-lg font-extrabold mono tracking-tight", stat.color, stat.glow)}>
              {stat.value}
            </p>
            <p className="text-[8px] text-slate-600 font-medium uppercase tracking-widest">
              {stat.subtitle}
            </p>
          </div>

          {/* Bio-Coherence progress bar */}
          {stat.bar !== undefined && (
            <div className="relative z-10 w-full coherence-bar bg-slate-950 h-1 rounded-full">
              <div
                className="coherence-bar-fill h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400"
                style={{ width: `${stat.bar}%` }}
              />
            </div>
          )}

          {/* Hover glow */}
          <div className={clsx(
            "absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
            stat.color === "text-emerald-400" && "bg-emerald-500",
            stat.color === "text-sky-400" && "bg-sky-500",
            stat.color === "text-violet-400" && "bg-violet-500",
            stat.color === "text-rose-400" && "bg-rose-500",
            stat.color === "text-indigo-400" && "bg-indigo-500",
            stat.color === "text-amber-400" && "bg-amber-500"
          )} />
        </div>
      ))}
    </div>
  );
}
