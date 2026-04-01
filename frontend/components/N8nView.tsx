"use client";

import React, { useState } from "react";
import { Workflow, Play, Square, ExternalLink, ShieldAlert, Cpu, Database, Network, Clock, Terminal, Activity, AlertTriangle, X, ChevronRight, Zap, CheckCircle2, Circle } from "lucide-react";
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
    id: "slo_report",
    name: "Daily SLO Report",
    description: "Generación de métricas de servicio y consolidado Ring-0",
    icon: Activity,
    color: "slate",
    trigger: "Cron (23:59)",
    lastRun: "Hace 3 horas",
    status: "active",
    logs: ["Agregando métricas 24h...", "Calculando SLOs...", "Reporte generado en Slack."]
  },
  {
    id: "high_cpu",
    name: "High CPU Alert",
    description: "Evaluación térmica de Cortex y límite P322",
    icon: Activity,
    color: "rose",
    trigger: "Prometheus",
    lastRun: "Hace 2 días",
    status: "active",
    logs: ["CPU Spike > 90%", "Trazando PID culpable...", "Alerta generada y mitigación disparada."]
  },
  {
    id: "anomaly",
    name: "TruthSync Anomaly Detector",
    description: "Heurística IA para desviaciones en simetría matemática S60",
    icon: ShieldAlert,
    color: "violet",
    trigger: "Stream WAL",
    lastRun: "Hace 1 hora",
    status: "active",
    logs: ["Calculando divergencia cuántica...", "Simetría Mantenida: 99.8%", "Revisión OK."]
  },
  {
    id: "db_health",
    name: "Database Health Check",
    description: "Test de inmutabilidad y latencia en base de datos PostgreSQL",
    icon: Database,
    color: "emerald",
    trigger: "Interval (5m)",
    lastRun: "Hace 2 min",
    status: "active",
    logs: ["Ping DB OK (2ms)...", "Verificando consistencia transaccional...", "Status: Verde."]
  },
  {
    id: "memory_warn",
    name: "Memory Warning Alert",
    description: "Purga de búferes SNN ante saturación de RAM",
    icon: Cpu,
    color: "amber",
    trigger: "Metric > 80%",
    lastRun: "Hace 4 horas",
    status: "active",
    logs: ["Memoria alcanzando 82%", "Desalojando caché de lectura SNN...", "Estabilización lograda a 65%."]
  },
  {
    id: "ai_generator",
    name: "AI Workflow Generator",
    description: "Auto-adaptación de reglas corticales usando Modelos Locales",
    icon: Terminal,
    color: "indigo",
    trigger: "Manual / Threat",
    lastRun: "Hace 6 días",
    status: "active",
    logs: ["Modelos Llama/Phi3 iniciados...", "Consultando vector de Zero-Day...", "Matriz actualizada."]
  },
  {
    id: "alert_enriched",
    name: "Alert Enrichment Protocol",
    description: "Aumento cognitivo de logs con OSINT & TTPs (MITRE ATT&CK)",
    icon: ShieldAlert,
    color: "sky",
    trigger: "Loki Event",
    lastRun: "Hace 15 min",
    status: "active",
    logs: ["TTP detectado: T1059", "Buscando contexto externo...", "Alerta enriquecida adjunta."]
  },
  {
    id: "backend_health",
    name: "Rust Backend Health Failsafe",
    description: "Sondeo agresivo de latencia en la API principal Cortex",
    icon: Activity,
    color: "teal",
    trigger: "Interval (1m)",
    lastRun: "Hace 30 seg",
    status: "active",
    logs: ["API Response: 0.039ms", "Latencia S60 Perfecta...", "Sistema vivo."]
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
    logs: ["Alerta: Memoria > 85%", "Ejecutando FLUSHALL parcial...", "Memoria liberada: 420MB."]
  },
  {
    id: "phi3",
    name: "Phi-3 Mini Cognitive Core",
    description: "Análisis de Inferencia Proyectado",
    icon: Terminal,
    color: "indigo",
    trigger: "Threat Analysis",
    lastRun: "PLANIFICADO",
    status: "planned",
    logs: ["Esperando asignación de recursos...", "Modelo Phi-3 identificado como target.", "Arquitectura lista."]
  },
  {
    id: "watchdog1",
    name: "Watchdog Integration System",
    description: "Cadena de supervisión del módulo Kernel XDP",
    icon: ShieldAlert,
    color: "rose",
    trigger: "Kernel Event",
    lastRun: "Hace 3 horas",
    status: "active",
    logs: ["Supervisando BPF Maps...", "Tablas estables.", "Auditoría en verde."]
  },
  {
    id: "observability",
    name: "Observability Telemetry Sync",
    description: "Consolidación de paneles y dashboards a TruthSync",
    icon: Activity,
    color: "cyan",
    trigger: "Cron (Hourly)",
    lastRun: "Hace 21 min",
    status: "active",
    logs: ["Grafana API OK...", "Loki OK...", "Prometheus OK... Sync completado."]
  }
];

// Nodos del flujo n8n para cada automatización
const FLOW_NODES: Record<string, { label: string; type: string; status: "ok" | "run" | "wait" }[]> = {
  ddos:        [{ label: "Webhook Metric", type: "trigger", status: "ok" }, { label: "Evaluar Umbral", type: "if", status: "ok" }, { label: "Actualizar XDP Map", type: "exec", status: "ok" }, { label: "Notificar Slack", type: "notify", status: "ok" }],
  intrusion:   [{ label: "Rust Brain Event", type: "trigger", status: "ok" }, { label: "Modo Pánico", type: "exec", status: "ok" }, { label: "Drop ALL Ports", type: "exec", status: "ok" }, { label: "Log WAL", type: "log", status: "ok" }],
  container:   [{ label: "Docker Event", type: "trigger", status: "ok" }, { label: "Detectar OOM", type: "if", status: "ok" }, { label: "Reiniciar Servicio", type: "exec", status: "ok" }, { label: "Verificar Health", type: "check", status: "ok" }],
  backup:      [{ label: "Cron 03:00", type: "trigger", status: "ok" }, { label: "Comprimir WAL", type: "exec", status: "ok" }, { label: "Cifrar P322", type: "exec", status: "ok" }, { label: "Cold Storage", type: "storage", status: "ok" }],
  slo_report:  [{ label: "Cron 23:59", type: "trigger", status: "ok" }, { label: "Agregar Métricas", type: "exec", status: "ok" }, { label: "Calcular SLOs", type: "exec", status: "ok" }, { label: "Slack Report", type: "notify", status: "ok" }],
  high_cpu:    [{ label: "Prometheus Alert", type: "trigger", status: "ok" }, { label: "Trazar PID", type: "exec", status: "ok" }, { label: "Mitigación", type: "exec", status: "ok" }, { label: "Alerta PagerDuty", type: "notify", status: "ok" }],
  anomaly:     [{ label: "Stream WAL", type: "trigger", status: "ok" }, { label: "Calcular Divergencia", type: "exec", status: "ok" }, { label: "Check Simetría S60", type: "if", status: "ok" }, { label: "Alerta TruthSync", type: "notify", status: "ok" }],
  db_health:   [{ label: "Interval 5m", type: "trigger", status: "ok" }, { label: "Ping DB", type: "check", status: "ok" }, { label: "Verify Consistencia", type: "check", status: "ok" }, { label: "Status Verde", type: "log", status: "ok" }],
  memory_warn: [{ label: "Metric > 80%", type: "trigger", status: "ok" }, { label: "Desalojar Caché", type: "exec", status: "ok" }, { label: "Verificar RAM", type: "check", status: "ok" }, { label: "Notificar", type: "notify", status: "ok" }],
  ai_generator:[{ label: "Manual / Threat", type: "trigger", status: "ok" }, { label: "Llama 3 Inference", type: "ai", status: "ok" }, { label: "Update Matrix", type: "exec", status: "ok" }, { label: "Log Cortex", type: "log", status: "ok" }],
  alert_enriched:[{ label: "Loki Event", type: "trigger", status: "ok" }, { label: "MITRE ATT&CK Lookup", type: "exec", status: "ok" }, { label: "OSINT Enrich", type: "exec", status: "ok" }, { label: "Alerta Enriquecida", type: "notify", status: "ok" }],
  backend_health:[{ label: "Interval 1m", type: "trigger", status: "ok" }, { label: "Ping API /health", type: "check", status: "ok" }, { label: "Evaluar Latencia", type: "if", status: "ok" }, { label: "Sistema Vivo", type: "log", status: "ok" }],
  redis:       [{ label: "Metric > 85%", type: "trigger", status: "ok" }, { label: "FLUSHALL Parcial", type: "exec", status: "ok" }, { label: "Verificar Memoria", type: "check", status: "ok" }, { label: "Liberar 420MB", type: "exec", status: "ok" }],
  phi3:        [{ label: "Threat Input", type: "trigger", status: "wait" }, { label: "Phi-3 Mini", type: "ai", status: "wait" }, { label: "Análisis Zero-Day", type: "exec", status: "wait" }, { label: "Matriz Update", type: "exec", status: "wait" }],
  watchdog1:   [{ label: "Kernel Event", type: "trigger", status: "ok" }, { label: "Supervisar BPF Maps", type: "check", status: "ok" }, { label: "Auditoría", type: "exec", status: "ok" }, { label: "Log Verde", type: "log", status: "ok" }],
  observability:[{ label: "Cron Hourly", type: "trigger", status: "ok" }, { label: "Grafana Sync", type: "check", status: "ok" }, { label: "Loki + Prometheus", type: "check", status: "ok" }, { label: "Sync Completado", type: "log", status: "ok" }],
};

const NODE_COLORS: Record<string, string> = {
  trigger: "text-violet-400 border-violet-500/40 bg-violet-500/10",
  if:      "text-amber-400 border-amber-500/40 bg-amber-500/10",
  exec:    "text-sky-400 border-sky-500/40 bg-sky-500/10",
  check:   "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  notify:  "text-rose-400 border-rose-500/40 bg-rose-500/10",
  log:     "text-slate-400 border-slate-500/40 bg-slate-500/10",
  storage: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  ai:      "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
};

export function N8nView() {
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [visibleLogs, setVisibleLogs] = useState<Record<string, boolean>>({});
  const [selectedAuto, setSelectedAuto] = useState<any | null>(null);

  const handleRun = (id: string) => {
    toggleLogs(id, true);
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
                Arquitectura de Reflejos
                <span className="px-2 py-0.5 border text-[7px] tracking-widest rounded font-black bg-amber-500/10 text-amber-400 border-amber-500/20">
                  PRÓXIMA FASE
                </span>
              </h2>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Planificación de automatizaciones para Sentinel Ring-0
                </p>
                <div className="flex items-center gap-2 px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded max-w-fit mt-1">
                   <AlertTriangle className="w-3 h-3 text-rose-400" />
                   <p className="text-[8px] text-rose-400 font-black uppercase tracking-tighter">Despliegue n8n requiere 16GB RAM (Nodo Actual: 4GB — Sentinel-CubePath)</p>
                </div>
              </div>
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
            <div key={auto.id}
              onClick={() => setSelectedAuto(auto)}
              className={clsx(
                "glass-card border flex flex-col transition-all duration-300 cursor-pointer",
                isRunning ? `border-${auto.color}-500/50 shadow-[0_0_15px_-3px] shadow-${auto.color}-500/20` : "border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
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
                    {auto.status === "active" ? (
                      <>
                        <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">ACTIVO</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {auto.lastRun}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[8px] font-black uppercase text-amber-400 tracking-widest px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded">PLANIFICADO</span>
                        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> PENDIENTE
                        </span>
                      </>
                    )}
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
                      className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded transition-colors flex items-center gap-2 px-3 border border-white/5"
                    >
                      <Terminal className="w-4 h-4" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Ver Diseño</span>
                    </button>
                    {isRunning ? (
                      <button
                        disabled
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-white/5 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded cursor-not-allowed"
                      >
                        <Square className="w-3 h-3 fill-slate-700" /> Parar
                      </button>
                    ) : (
                      <button
                        onClick={() => auto.status === "active"
                          ? window.open("https://vps23309.cubepath.net/n8n/", "_blank", "noopener,noreferrer")
                          : handleRun(auto.id)
                        }
                        className={clsx(
                          "flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border text-[9px] font-black uppercase tracking-widest rounded transition-colors",
                          auto.status === "active"
                            ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            : "border-white/5 text-slate-500 hover:border-amber-500/30 hover:text-amber-400"
                        )}
                      >
                        <Play className="w-3 h-3" /> {auto.status === "active" ? "Ver en n8n" : "Inspeccionar"}
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
      {/* ── MODAL DETALLE DE AUTOMATIZACIÓN ── */}
      {selectedAuto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedAuto(null)} />
          <div className="relative w-full max-w-2xl glass-card bg-slate-900 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={clsx("p-3 rounded-xl border", selectedAuto.status === "active" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30")}>
                  <selectedAuto.icon className={clsx("w-6 h-6", selectedAuto.status === "active" ? "text-emerald-400" : "text-amber-400")} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">{selectedAuto.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">{selectedAuto.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={clsx(
                  "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border",
                  selectedAuto.status === "active"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                )}>
                  {selectedAuto.status === "active" ? "ACTIVO" : "PLANIFICADO"}
                </span>
                <button onClick={() => setSelectedAuto(null)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Diagrama de flujo */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                  <Workflow className="w-3 h-3" /> Diagrama de Flujo n8n
                </p>
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {(FLOW_NODES[selectedAuto.id] || []).map((node, i, arr) => (
                    <React.Fragment key={i}>
                      <div className={clsx(
                        "flex flex-col items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl border text-center min-w-[90px]",
                        node.status === "wait" ? "border-slate-700 bg-slate-900/50 opacity-50" : NODE_COLORS[node.type] || "text-slate-400 border-slate-700 bg-slate-900"
                      )}>
                        <div className={clsx("w-2 h-2 rounded-full", node.status === "ok" ? "bg-emerald-400" : "bg-slate-600")} />
                        <span className="text-[8px] font-black uppercase leading-tight">{node.label}</span>
                        <span className="text-[7px] opacity-60 uppercase tracking-wider">{node.type}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-700 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Última ejecución */}
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                  <Terminal className="w-3 h-3" /> Última Ejecución
                </p>
                <div className="space-y-1.5 font-mono text-[9px]">
                  {selectedAuto.logs.map((log: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={i === selectedAuto.logs.length - 1 ? "text-emerald-400" : "text-slate-600"}>›</span>
                      <span className={i === selectedAuto.logs.length - 1 ? "text-emerald-300" : "text-slate-400"}>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 text-[9px] font-mono">
                {[
                  ["Trigger", selectedAuto.trigger],
                  ["Última Ejecución", selectedAuto.lastRun],
                  ["Estado", selectedAuto.status === "active" ? "FUNCIONANDO" : "PENDIENTE DE DEPLOY"],
                  ["Motor", "n8n v2.13 · Sentinel Ring-0"],
                ].map(([k, v]) => (
                  <div key={k} className="p-3 bg-slate-950/50 rounded-xl border border-white/5">
                    <p className="text-slate-600 uppercase tracking-widest text-[7px] mb-1">{k}</p>
                    <p className="text-white font-black">{v}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
                  <div className={clsx("w-1.5 h-1.5 rounded-full", selectedAuto.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                  {selectedAuto.status === "active" ? "Integrado con motor Ring-0" : "Requiere deploy n8n 16GB RAM"}
                </div>
                <button
                  onClick={() => window.open("https://vps23309.cubepath.net/n8n/", "_blank", "noopener,noreferrer")}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-400 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Abrir en n8n <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
