"use client";

import React, { useState } from "react";
import { Workflow, Play, Square, ExternalLink, ShieldAlert, Cpu, Database, Network, Clock, Terminal } from "lucide-react";
import { clsx } from "clsx";

const AUTOMATIONS = [
  {
    id: "ddos",
    name: "DDoS Mitigation Reflex",
    description: "Bloqueo dinámico L4/L7 al detectar picos anómalos de tráfico",
    icon: Network,
    color: "rose",
    trigger: "Webhook / Metric",
    lastRun: "Hace 12 min",
    status: "active",
    logs: ["Detectando hiperflujo UDP...", "Actualizando tabla XDP...", "Tráfico descartado exitosamente."]
  },
  {
    id: "intrusion",
    name: "Intrusion Lockdown",
    description: "Cierre de todos los puertos no esenciales (Modo Cuarentena)",
    icon: ShieldAlert,
    color: "amber",
    trigger: "Rust Brain",
    lastRun: "Hace 5 horas",
    status: "active",
    logs: ["Iniciando modo pánico...", "Drop ALL excepto S60...", "Conexiones abortadas."]
  },
  {
    id: "container",
    name: "Container Crash Recovery",
    description: "Reinicio automático de cápsulas caídas bajo ataque OOM",
    icon: Cpu,
    color: "sky",
    trigger: "Docker Events",
    lastRun: "Hace 1 día",
    status: "active",
    logs: ["Contenedor API terminó con exit 137", "Reiniciando servicio...", "Servicio estabilizado."]
  },
  {
    id: "backup",
    name: "Ring-0 Backup Recovery",
    description: "Sincronización forense inmutable de logs interceptados",
    icon: Database,
    color: "emerald",
    trigger: "Cron (Daily)",
    lastRun: "Hace 23 horas",
    status: "active",
    logs: ["Comprimiendo WAL...", "Cifrando con P322...", "Backup subido a Cold Storage."]
  },
  {
    id: "backend",
    name: "Cortex API Health Check",
    description: "Sondeo de latencia y reinicio preventivo de la API principal",
    icon: Activity,
    color: "teal",
    trigger: "Interval (1m)",
    lastRun: "Hace 30 seg",
    status: "active",
    logs: ["Ping a /health... 32ms", "Verificando base de datos...", "Status: 100% Operativo."]
  },
  {
    id: "redis",
    name: "Redis Overflow Defense",
    description: "Compactación de Ring-Buffer en memoria bajo alta presión",
    icon: Database,
    color: "red",
    trigger: "Metric > 85%",
    lastRun: "Hace 2 días",
    status: "active",
    logs: ["Alerta: Memoria > 85%", "Ejecutando FLUSHALL temporal...", "Memoria liberada: 420MB."]
  },
  {
    id: "slo",
    name: "SLO/SLA Breach Alert",
    description: "Notificación de degradación algorítmica y latencia S60",
    icon: AlertTriangle,
    color: "orange",
    trigger: "Prometheus Alert",
    lastRun: "Nunca (No Breached)",
    status: "active",
    logs: ["Evaluando latencia P322...", "0.039ms < 0.1ms", "SLA Cumplido."]
  },
  {
    id: "ai",
    name: "AI Cognitive Generator",
    description: "Síntesis dinámica de contramedidas via LLM Matrix",
    icon: Terminal,
    color: "indigo",
    trigger: "Manual / Threat",
    lastRun: "Hace 4 horas",
    status: "active",
    logs: ["Analizando vector de ataque...", "Desplegando prompt anti-secuestro...", "Payload generado y encolado."]
  }
];

export function N8nView() {
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [visibleLogs, setVisibleLogs] = useState<Record<string, boolean>>({});

  const handleRun = (id: string) => {
    setRunning(prev => ({ ...prev, [id]: true }));
    toggleLogs(id, true);
    // Simulamos la ejecución del webhook para la hackatón
    setTimeout(() => {
      setRunning(prev => ({ ...prev, [id]: false }));
    }, 3000);
  };

  const toggleLogs = (id: string, forceShow?: boolean) => {
    setVisibleLogs(prev => ({ ...prev, [id]: forceShow !== undefined ? forceShow : !prev[id] }));
  };

  return (
    <div className="space-y-6 h-full p-4 overflow-y-auto">
      {/* HEADER */}
      <div className="glass-card p-6 border-violet-500/20 bg-slate-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Workflow className="w-32 h-32 text-violet-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/20 rounded-xl border border-violet-500/40">
              <Workflow className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                Arcos de Reflejo (n8n API)
                <span className="px-2 py-0.5 border text-[7px] tracking-widest rounded font-black bg-violet-500/10 text-violet-400 border-violet-500/20">
                  SÓLO LECTURA
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Visualización segura de automatizaciones
              </p>
            </div>
          </div>
          <button 
            onClick={() => window.open("https://vps23309.cubepath.net/n8n/", "_blank", "noopener,noreferrer")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 hover:border-violet-500/50 hover:bg-violet-500/10 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
          >
            Abrir N8N Studio <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* LISTA DE FLUJOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {AUTOMATIONS.map(auto => {
          const isRunning = running[auto.id];
          const showLogs = visibleLogs[auto.id];
          
          return (
            <div key={auto.id} className={clsx(
              "glass-card border flex flex-col transition-all duration-300",
              isRunning ? `border-${auto.color}-500/50 shadow-[0_0_15px_-3px] shadow-${auto.color}-500/20` : "border-white/5 hover:border-white/10"
            )}>
              <div className="p-5 flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={clsx("p-2 rounded-lg border", isRunning ? `bg-${auto.color}-500/20 border-${auto.color}-500/50 animate-pulse` : "bg-slate-900 border-slate-800")}>
                       <auto.icon className={clsx("w-5 h-5", isRunning ? `text-${auto.color}-400` : "text-slate-500")} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">{auto.name}</h3>
                      <p className="text-[9px] text-slate-500 font-bold mt-1 line-clamp-1">{auto.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">ACTIVO</span>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {auto.lastRun}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest bg-slate-900 px-2 py-1 rounded">
                      TRIGGER: {auto.trigger}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleLogs(auto.id)}
                      className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded transition-colors"
                      title="Ver Registros"
                    >
                      <Terminal className="w-4 h-4" />
                    </button>
                    {isRunning ? (
                      <button 
                        onClick={() => setRunning(prev => ({ ...prev, [auto.id]: false }))}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[9px] font-black uppercase tracking-widest rounded hover:bg-rose-500/30 transition-colors"
                      >
                        <Square className="w-3 h-3 fill-rose-500" /> Parar
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRun(auto.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded hover:bg-emerald-500/30 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-emerald-500" /> Ejecutar
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Terminal Logs */}
              {showLogs && (
                <div className="border-t border-white/5 bg-slate-950 p-4 font-mono text-[9px] space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  <div className="text-slate-600 mb-2 border-b border-white/5 pb-2">ÚLTIMA SECUENCIA DE EJECUCIÓN:</div>
                  {auto.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                       <span className={clsx("shrink-0", i === auto.logs.length -1 ? "text-emerald-400" : "text-slate-500")}>{">"}</span>
                       <span className={clsx(i === auto.logs.length -1 ? "text-emerald-300" : "text-slate-400")}>{log}</span>
                    </div>
                  ))}
                  {isRunning && (
                    <div className="flex items-start gap-2 animate-pulse mt-2">
                       <span className="text-violet-400">{">"}</span>
                       <span className="text-violet-300">Ejecutando secuencia en vivo vía API proxy...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
