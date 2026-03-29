"use client";

import React from "react";
import {
  LayoutDashboard,
  ShieldAlert,
  Hexagon,
  Network,
  Terminal,
  Settings,
  Lock,
  BarChart3,
  Activity,
  Workflow,
  ExternalLink,
  Info,
  Microscope,
} from "lucide-react";

import { clsx } from "clsx";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const EXTERNAL_SERVICES = [
  {
    id: "grafana",
    label: "Grafana",
    icon: BarChart3,
    href: "https://vps23309.cubepath.net/grafana/",
    color: "text-orange-400",
    dot: "bg-orange-500",
  },
  {
    id: "prometheus",
    label: "Prometheus",
    icon: Activity,
    href: "https://vps23309.cubepath.net/prometheus/",
    color: "text-red-400",
    dot: "bg-red-500",
  },
  {
    id: "n8n",
    label: "n8n Reflex",
    icon: Workflow,
    href: "https://vps23309.cubepath.net/n8n/",
    color: "text-violet-400",
    dot: "bg-violet-500",
  },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "about", label: "Proyecto", icon: Info },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "aiops_shield", label: "AIOps Shield", icon: ShieldAlert },
    { id: "matrix", label: "S60 Laboratory", icon: Microscope },
    { id: "mycnet", label: "MyCNet", icon: Network },

    { id: "vault", label: "Vault", icon: Terminal },
  ];

  return (
    <div className="w-20 md:w-56 bg-slate-950/40 border-r border-white/5 flex flex-col h-full shrink-0 transition-all duration-500">
      <div className="flex-1 py-8 space-y-1 overflow-y-auto">
        {/* Internal views */}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 transition-all group relative",
              activeTab === item.id
                ? "text-emerald-400 bg-emerald-500/5"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-emerald-500 rounded-r-full" />
            )}

            <item.icon
              className={clsx(
                "w-5 h-5 shrink-0",
                activeTab === item.id
                  ? "text-emerald-400"
                  : "text-slate-500 group-hover:text-slate-300"
              )}
            />

            <span
              className={clsx(
                "hidden md:block text-[10px] uppercase tracking-widest transition-all",
                activeTab === item.id
                  ? "opacity-100 font-black text-emerald-400"
                  : "opacity-40 font-bold group-hover:opacity-100"
              )}
            >
              {item.label}
            </span>

            {activeTab === item.id && (
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-slate-950 animate-pulse" />
            )}
          </button>
        ))}

        {/* Observability / Automation separator */}
        <div className="mx-4 my-3 border-t border-white/5" />
        <div className="hidden md:block px-4 pb-1">
          <span className="text-[7px] font-black uppercase tracking-[0.25em] text-slate-700">Observabilidad</span>
        </div>

        {/* External service links */}
        {EXTERNAL_SERVICES.map((svc) => (
          <a
            key={svc.id}
            href={svc.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 transition-all group relative text-slate-500 hover:bg-white/5"
          >
            <div className="relative">
              <svc.icon className={clsx("w-5 h-5 shrink-0 group-hover:opacity-100 opacity-60", svc.color)} />
              <div className={clsx("absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse border border-slate-950", svc.dot)} />
            </div>
            <span className="hidden md:block text-[10px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-100 transition-all">
              {svc.label}
            </span>
            <ExternalLink className="hidden md:block w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-30 transition-opacity shrink-0" />
          </a>
        ))}
      </div>

      <div className="p-4 border-t border-white/5 space-y-4">
        <div className="flex flex-col items-center lg:items-start gap-1">
          <div className="flex items-center gap-2 text-slate-600">
            <Lock className="w-3 h-3" />
            <span className="hidden lg:block text-[8px] font-bold uppercase tracking-tighter">Ring-0 Secure</span>
          </div>
          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-full" />
          </div>
        </div>

        <button
          onClick={() => onTabChange("settings")}
          className={clsx(
            "w-full flex items-center justify-center lg:justify-start gap-3 p-2 transition-colors",
            activeTab === "settings" ? "text-emerald-400" : "text-slate-500 hover:text-white"
          )}
        >
          <Settings className="w-4 h-4" />
          <span className="hidden lg:block text-[9px] font-bold uppercase tracking-widest">Configuración</span>
        </button>
      </div>
    </div>
  );
}
