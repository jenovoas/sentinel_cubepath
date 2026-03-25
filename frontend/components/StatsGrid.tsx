"use client";

import React from "react";
import { Shield, Zap, Activity, Heart, Globe, Cpu } from "lucide-react";

interface StatsGridProps {
  status: any;
}

export function StatsGrid({ status }: StatsGridProps) {
  const stats = [
    {
      label: "System Integrity",
      value: status?.ring_status === "SEALED" ? "SEALED" : "UNSTABLE",
      icon: Shield,
      color: status?.ring_status === "SEALED" ? "text-emerald-400" : "text-amber-400",
      bg: status?.ring_status === "SEALED" ? "bg-emerald-500/10" : "bg-amber-500/10",
      pulse: status?.ring_status === "SEALED",
    },
    {
      label: "S60 Resonance",
      value: (status?.s60_resonance || 0).toLocaleString(),
      icon: Zap,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      label: "Portal Intensity",
      value: status?.harmonic_sync || "STABLE",
      icon: Activity,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Bio-Coherence",
      value: `${((status?.bio_coherence || 0) / 129600).toFixed(1)}%`,
      icon: Heart,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      pulse: true,
    },
    {
        label: "XDP Firewall",
        value: status?.xdp_firewall ? "ACTIVE" : "INACTIVE",
        icon: Globe,
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
    },
    {
        label: "LSM Cognitive",
        value: "ENABLED",
        icon: Cpu,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="glass-card p-4 hover:scale-[1.02] transition-transform flex flex-col items-center text-center space-y-2 relative overflow-hidden group">
          <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} ${stat.pulse ? 'status-pulse' : ''}`}>
             <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
            <p className={`text-lg font-bold ${stat.color} mono tracking-tighter`}>{stat.value}</p>
          </div>
          
          {/* Subtle background glow on hover */}
          <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-20 ${stat.bg} transition-opacity`} />
        </div>
      ))}
    </div>
  );
}
