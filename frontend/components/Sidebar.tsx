"use client";

import React from "react";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Grid3X3, 
  Network, 
  Terminal, 
  Settings,
  Lock
} from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "aiops_shield", label: "AIOps Shield", icon: ShieldAlert, highlight: true },
    { id: "matrix", label: "Matrix", icon: Grid3X3 },
    { id: "mycnet", label: "MyCNet", icon: Network },
    { id: "vault", label: "Vault", icon: Terminal },
  ];

  return (
    <div className="w-20 md:w-56 bg-slate-950/40 border-r border-white/5 flex flex-col h-full shrink-0 transition-all duration-500">
      <div className="flex-1 py-8 space-y-2">
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
            
            <item.icon className={clsx(
              "w-5 h-5 shrink-0",
              activeTab === item.id ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300",
              item.highlight && "animate-pulse"
            )} />
            
            <span className={clsx(
              "hidden md:block text-[10px] uppercase tracking-widest transition-all",
              activeTab === item.id 
                ? "opacity-100 font-black text-emerald-400" 
                : "opacity-40 font-bold group-hover:opacity-100"
            )}>
              {item.label}
            </span>

            {item.highlight && (
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-slate-950 animate-pulse" />
            )}
          </button>
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
          <span className="hidden lg:block text-[9px] font-bold uppercase tracking-widest">Settings</span>
        </button>
      </div>
    </div>
  );
}
