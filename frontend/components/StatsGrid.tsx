"use client";

import React from "react";
import { Shield, Radio, Activity, Globe } from "lucide-react";

interface Status {
  ring_status: string;
  xdp_firewall: string;
  lsm_cognitive: string;
  s60_resonance: number;
  crystal_oscillator_active: boolean;
  harmonic_sync: string;
}

export function StatsGrid({ status }: { status: Status | null }) {
  const cards = [
    {
      label: "Sentinel Seal",
      value: status?.ring_status || "OFFLINE",
      icon: Shield,
      color: status?.ring_status === "SEALED" ? "text-emerald-400" : "text-red-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Firewall XDP",
      value: status?.xdp_firewall || "INITIALIZING",
      icon: Radio,
      color: "text-sentinel-300",
      bg: "bg-sentinel-500/10",
    },
    {
      label: "Time Crystal",
      value: status?.crystal_oscillator_active ? status.harmonic_sync : "OFFLINE",
      icon: Activity,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
       label: "CubePath Node",
       value: "CONNECTED",
       icon: Globe,
       color: "text-blue-400",
       bg: "bg-blue-500/10",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-default">
          <div className={`p-3 rounded-lg ${card.bg}`}>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-sentinel-500">{card.label}</p>
            <p className={`text-sm font-black font-mono ${card.color}`}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
