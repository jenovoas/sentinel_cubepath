"use client";

import React from "react";
import { Shield, Zap, Activity, Heart, Globe, Cpu, Scale, Database } from "lucide-react";
import { clsx } from "clsx";

interface StatsGridProps {
  status: any;
}

export function StatsGrid({ status }: StatsGridProps) {
  const bioCoherence = status?.bio_coherence || 0;
  const bioPercent = Math.min(100, (bioCoherence / 12960000) * 100);

  const stats = [
    {
      label: "IA Ops Shield",
      value: status?.ring_status === "SEALED" ? "ACTIVADO" : "PROTEGIDO",
      icon: Shield,
      color: status?.ring_status === "SEALED" ? "text-rose-500" : "text-emerald-400",
      glow: status?.ring_status === "SEALED" ? "glow-rose" : "glow-emerald",
      borderColor: status?.ring_status === "SEALED" ? "border-rose-500/30" : "border-emerald-500/20",
      bgAccent: status?.ring_status === "SEALED" ? "from-rose-500/10" : "from-emerald-500/10",
      pulse: status?.ring_status === "SEALED",
      subtitle: status?.ring_status === "SEALED" ? "Contención Activa" : "Sin Amenazas",
    },
    {
      label: "Integridad Sistema",
      value: status?.ring_status === "SEALED" ? "SELLADO" : "BRECHA",
      icon: Activity,
      color: status?.ring_status === "SEALED" ? "text-emerald-400" : "text-rose-400",
      glow: status?.ring_status === "SEALED" ? "glow-emerald" : "glow-rose",
      borderColor: status?.ring_status === "SEALED" ? "border-emerald-500/20" : "border-rose-500/20",
      bgAccent: status?.ring_status === "SEALED" ? "from-emerald-500/10" : "from-rose-500/10",
      pulse: status?.ring_status === "SEALED",
      subtitle: "Bloqueo Ring-0",
    },
    {
      label: "Resonancia S60",
      value: status?.s60_resonance !== undefined ? `${((status.s60_resonance / 12960000) * 100).toFixed(1)}%` : "0.0%",
      icon: Zap,
      color: "text-sky-400",
      glow: "glow-sky",
      borderColor: "border-sky-500/15",
      bgAccent: "from-sky-500/10",
      subtitle: "Núcleo Base-60",
    },
    {
      label: "Fase Portal",
      value: status?.harmonic_sync || "ESTABLE",
      icon: Activity,
      color: status?.harmonic_sync === "RESONANCE_MAX" ? "text-violet-400" : "text-slate-400",
      glow: status?.harmonic_sync === "RESONANCE_MAX" ? "glow-sky" : "",
      borderColor: "border-violet-500/15",
      bgAccent: "from-violet-500/10",
      subtitle: "Multi-Armónico",
    },
    {
      label: "Bio-Coherencia",
      value: `${bioPercent.toFixed(1)}%`,
      icon: Heart,
      color: bioPercent > 50 ? "text-rose-400" : "text-rose-600",
      glow: bioPercent > 80 ? "glow-rose" : "",
      borderColor: "border-rose-500/15",
      bgAccent: "from-rose-500/10",
      pulse: true,
      subtitle: "Sincronía Humana",
      bar: bioPercent,
    },
    {
      label: "Firewall XDP",
      value: status?.xdp_firewall || "OFFLINE",
      icon: Globe,
      color: status?.xdp_firewall === "ACTIVE" ? "text-indigo-400" : "text-slate-500",
      glow: "",
      borderColor: "border-indigo-500/15",
      bgAccent: "from-indigo-500/10",
      subtitle: "Latencia < 0.1ms",
    },
    {
      label: "LSM Cognitivo",
      value: status?.lsm_cognitive || "ENLAZANDO...",
      icon: Cpu,
      color: "text-amber-400",
      glow: "glow-amber",
      borderColor: "border-amber-500/15",
      bgAccent: "from-amber-500/10",
      subtitle: "Filtro Semántico",
    },
    {
      label: "Masa Efectiva",
      value: status?.effective_mass !== undefined ? `${(status.effective_mass / 12960000).toFixed(4)}` : "1.0000",
      icon: Scale,
      color: "text-cyan-400",
      glow: "glow-cyan",
      borderColor: "border-cyan-500/15",
      bgAccent: "from-cyan-500/10",
      subtitle: "Protocolo G-Zero",
    },
    {
      label: "Carga Cuántica",
      value: status?.quantum_load !== undefined ? `${((status.quantum_load / 12960000) * 100).toFixed(1)}%` : "0.0%",
      icon: Database,
      color: "text-orange-400",
      glow: "glow-orange",
      borderColor: "border-orange-500/15",
      bgAccent: "from-orange-500/10",
      subtitle: "Presión Cortex",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={clsx(
            "glass-card p-4 flex flex-col items-center text-center space-y-3 relative overflow-hidden group cursor-default h-full",
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
            "relative z-10 p-2 rounded-xl border shrink-0",
            stat.borderColor,
            stat.color,
            stat.pulse && "status-pulse"
          )}>
            <stat.icon className={clsx("w-4 h-4", stat.pulse && "bio-heartbeat")} />
          </div>

          {/* Value */}
          <div className="relative z-10 space-y-0.5 flex-1 flex flex-col justify-center">
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.1em] line-clamp-1">
              {stat.label}
            </p>
            <p className={clsx("text-base font-extrabold mono tracking-tight", stat.color, stat.glow)}>
              {stat.value}
            </p>
            <p className="text-[7px] text-slate-600 font-medium uppercase tracking-widest line-clamp-1">
              {stat.subtitle}
            </p>
          </div>

          {/* Bio-Coherence progress bar */}
          {stat.bar !== undefined && (
            <div className="relative z-10 w-full coherence-bar bg-slate-950 h-1 rounded-full mt-auto">
              <div
                className="coherence-bar-fill h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400"
                style={{ width: `${stat.bar}%` }}
              />
            </div>
          )}

          {/* Hover glow */}
          <div className={clsx(
            "absolute -bottom-6 -right-6 w-16 h-16 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
            stat.color.includes("emerald") && "bg-emerald-500",
            stat.color.includes("sky") && "bg-sky-500",
            stat.color.includes("violet") && "bg-violet-500",
            stat.color.includes("rose") && "bg-rose-500",
            stat.color.includes("indigo") && "bg-indigo-500",
            stat.color.includes("amber") && "bg-amber-500",
            stat.color.includes("cyan") && "bg-cyan-500",
            stat.color.includes("orange") && "bg-orange-500"
          )} />
        </div>
      ))}
    </div>
  );
}
