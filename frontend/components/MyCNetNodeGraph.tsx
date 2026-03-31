"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTelemetry } from "../hooks/useTelemetry";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, Activity, Box, Server, HardDrive, Cpu, Sparkles } from "lucide-react";

export function MyCNetNodeGraph({ phase, isOpen }: { phase: string, isOpen: boolean }) {
  const { tick } = useTelemetry();
  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // CONEXIÓN DIRECTA AL KERNEL RING-0 (Axum S60)
  const apiBase = `/api`;

  useEffect(() => {
    const fetchTopology = async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/mycnet/topology`);
        if (res.ok) {
          const data = await res.json();
          const roleIconMap: Record<string, any> = {
            "Gateway": Server,
            "Compute S60": Cpu,
          };
          const processed = (data.nodes || []).map((node: any) => ({
            ...node,
            angle: Math.atan2(node.r, node.q) * 180 / Math.PI,
            name: node.id,
            ip: node.ip ?? "—",
            icon: roleIconMap[node.role] ?? HardDrive,
          }));
          setNodes(processed);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching topology", error);
      }
    };
    fetchTopology();
    const iv = setInterval(fetchTopology, 2000);
    return () => clearInterval(iv);
  }, [apiBase]);

  // Derivación de métricas TQ basadas en la amplitud real de los nodos
  const tqMetrics = useMemo(() => {
    const metrics: Record<string, number> = {};
    nodes.forEach((node, i) => {
      // Simulamos enlace con el siguiente nodo en la lista para visualización de red
      const next = nodes[(i + 1) % nodes.length];
      const key = `${node.id}-${next.id}`;
      // TQ real = (amp_a + amp_b) / factor_s60
      metrics[key] = Math.floor(((node.amplitude + next.amplitude) / 25920000) * 255);
    });
    return metrics;
  }, [nodes]);

  // Función para convertir TQ (0-255) a formato S60 [d; m, s]
  const renderS60 = (tq: number) => {
    const dec = tq / 255.0;
    const d = Math.floor(dec);
    const m = Math.floor((dec - d) * 60);
    const s = Math.floor((((dec - d) * 60) - m) * 60);
    return `S60[${d.toString().padStart(3, '0')}; ${m.toString().padStart(2, '0')}, ${s.toString().padStart(2, '0')}]`;
  };

  // Coordenadas SVG
  const centerX = 250;
  const centerY = 200;
  const radius = 130;

  const getPhaseColorHex = () => {
    if (phase === "YOD") return "#34d399"; // Emerald (Sincronización CRUSH)
    if (phase === "VAV") return "#38bdf8"; // Sky (Rebalanceo EC 4+2)
    return "#94a3b8"; // Slate (Idle)
  };

  const getPhaseDesc = () => {
    if (phase === "YOD") return "CEPH CRUSH SYNC";
    if (phase === "VAV") return "EC 4+2 REBALANCE";
    return "BAT0 IDLE";
  };

  const phaseColor = getPhaseColorHex();
  const pulseClass = isOpen ? (phase === "YOD" ? "animate-[pulse_1s_infinite]" : "animate-[pulse_2s_infinite]") : "opacity-30";

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <div className="glass-card flex flex-col border-white/5 relative overflow-hidden bg-slate-950/80 min-h-[500px]">
      <style>{`
        @keyframes flowPacket {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        .data-pipe {
          stroke-dasharray: 4 16;
          animation: flowPacket 1s linear infinite;
        }
        .data-pipe-reverse {
          stroke-dasharray: 4 16;
          animation: flowPacket 1s linear infinite reverse;
        }
      `}</style>
      
      {/* ── HEADER B.A.T.M.A.N. ADV ── */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <Wifi className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              MyCNet Batman-adv Mesh
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">L2 Topology</span>
              <span className="text-[7px] bg-slate-800 text-slate-400 px-1 rounded mono">bat0</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <div className="flex items-center gap-2">
             <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">YHWH Modulator</span>
             <Activity className={`w-3 h-3 ${isOpen ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
           </div>
           <span className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isOpen ? 'text-emerald-400' : 'text-rose-500'} mono flex items-center gap-1`}>
             {getPhaseDesc()} [{(tick % 60).toString().padStart(2, '0')}]
           </span>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-4">
        
        {/* === CONTENEDOR UNIFICADO (SVG + HTML) PARA ZERO-BLUR Y ALINEACIÓN === */}
        {/* El viewBox es 500x400. Usamos aspect ratio 5:4 con ancho fijo === */}
        <div className="relative mx-auto" style={{ width: "100%", maxWidth: "600px", height: "480px" }}>
          
          {/* === MESH SVG === */}
          <div className="absolute inset-0 pointer-events-none">
             <svg viewBox="0 0 500 400" className="w-full h-full">

              {/* DIBUJO DE RUTAS (EDGES) */}
              {nodes.map((node, i) => {
                 const next = nodes[(i + 1) % nodes.length];
                 const edgeKey = `${node.id}-${next.id}`;
                 const tq = tqMetrics[edgeKey] || 0;
                 const activeRoute = tq > 230 && isOpen;

                 const x1 = centerX + radius * Math.cos(node.angle * Math.PI / 180);
                 const y1 = centerY + radius * Math.sin(node.angle * Math.PI / 180);
                 const x2 = centerX + radius * Math.cos(next.angle * Math.PI / 180);
                 const y2 = centerY + radius * Math.sin(next.angle * Math.PI / 180);

                 // Rutas cruzadas
                 const crossKeys = ["n1-n4", "n2-n6"];
                 
                 return (
                   <g key={`edge-${i}`}>
                     {/* Anillo perimetral */}
                     <line 
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={activeRoute ? phaseColor : "#334155"}
                        strokeWidth={activeRoute ? 3 : 1}
                        className={activeRoute && phase === 'YOD' ? "animate-[pulse_1s_infinite]" : "transition-all duration-700"}
                        filter={activeRoute ? "url(#glow)" : ""}
                     />
                     {/* ANIMACIÓN DE LUZ (TUBERÍA DE DATOS CON FRAMER MOTION) */}
                     {activeRoute && (
                       <motion.line 
                          x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeDasharray="4 16"
                          initial={{ strokeDashoffset: 40 }}
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="opacity-70 drop-shadow-[0_0_8px_#ffffff]"
                       />
                     )}
                     {/* Texto TQ Perimeter */}
                     {tq > 0 && (
                        <text 
                          x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} 
                          fill={activeRoute ? phaseColor : "#64748b"} 
                          fontSize="8" 
                          fontFamily="monospace" 
                          textAnchor="middle"
                          className="font-bold tracking-widest"
                        >
                          {tick > 0 ? `TQ ${tq}/255` : "NO SIGNAL"}
                        </text>
                     )}

                     {/* Rutas cruzadas si existen */}
                     {crossKeys.map(ck => {
                        const [src, dst] = ck.split("-");
                        if (node.id === src) {
                          const targetNode = nodes.find(n => n.id === dst)!;
                          const cx2 = centerX + radius * Math.cos(targetNode.angle * Math.PI / 180);
                          const cy2 = centerY + radius * Math.sin(targetNode.angle * Math.PI / 180);
                          const ctq = tqMetrics[ck] || 0;
                          const cact = ctq > 200 && isOpen;
                          return (
                            <g key={ck}>
                              <line 
                                x1={x1} y1={y1} x2={cx2} y2={cy2}
                                stroke={cact ? "#6366f1" : "rgba(51,65,85,0.4)"}
                                strokeWidth={cact ? 1.5 : 1}
                                className="transition-all duration-700"
                              />
                              {cact && (
                                <motion.line 
                                  x1={x1} y1={y1} x2={cx2} y2={cy2}
                                  stroke="#a5b4fc"
                                  strokeWidth="1.5"
                                  strokeDasharray="4 16"
                                  initial={{ strokeDashoffset: 0 }}
                                  animate={{ strokeDashoffset: 40 }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                  className="opacity-80"
                                />
                              )}
                               <text 
                                x={(x1 + cx2) / 2} y={(y1 + cy2) / 2 - 5} 
                                fill={cact ? "#818cf8" : "rgba(100,116,139,0.5)"} 
                                fontSize="7" 
                                fontFamily="monospace" 
                                textAnchor="middle"
                              >
                                {renderS60(ctq)}
                              </text>
                            </g>
                          );
                        }
                        return null;
                     })}

                   </g>
                 );
              })}
           </svg>
        </div>

        {/* === REACT HTML NODOS (OVERLAY) === */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
           {nodes.map((node) => {
              const x = centerX + radius * Math.cos(node.angle * Math.PI / 180);
              const y = centerY + radius * Math.sin(node.angle * Math.PI / 180);
              
              // Posicionar el div centrado en x, y usando transform/translate (sobre 500x400 viewbox virtual -> escalar según redimensionamiento es complejo, lo hacemos con porcentajes)
              const px = (x / 500) * 100;
              const py = (y / 400) * 100;
              
              const isGateway = node.role === "Gateway";
              const isCompute = node.role === "Compute S60";

              return (
                 <button 
                   key={node.id} 
                   onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                   className="absolute flex flex-col items-center justify-center focus:outline-none group z-30 pointer-events-auto cursor-pointer active:scale-95 transition-transform duration-100"
                   style={{ 
                      left: `${px.toFixed(2)}%`, 
                      top: `${py.toFixed(2)}%`,
                      transform: "translate(-50%, -50%)",
                   }}
                 >
                    {/* El Hexágono Físico (Raspberry Pi Node) */}
                    <div className={clsx(
                      "w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md border shadow-lg transition-all duration-500 hover:scale-110",
                      selectedNode === node.id ? "ring-2 ring-white scale-110 z-40" : "",
                      isGateway ? "bg-indigo-500/20 border-indigo-500/50 shadow-indigo-500/20 hover:bg-indigo-500/40" :
                      isCompute ? "bg-emerald-500/20 border-emerald-500/50 shadow-emerald-500/20 hover:bg-emerald-500/40" :
                      "bg-slate-900/80 border-slate-700 shadow-black/50 hover:bg-slate-800"
                    )}>
                      <node.icon className={clsx(
                        "w-5 h-5",
                        isGateway ? "text-indigo-400 group-hover:text-indigo-300" :
                        isCompute ? "text-emerald-400 group-hover:text-emerald-300" :
                        "text-slate-400 group-hover:text-slate-200"
                      )} />
                    </div>

                    {/* Etiquetas (IP y Rol) */}
                    <div className={clsx(
                      "mt-2 text-center px-2 py-1 rounded border transition-colors",
                      selectedNode === node.id ? "bg-slate-800 border-white/20 shadow-xl" : "bg-slate-950/80 border-white/5 backdrop-blur-sm"
                    )}>
                       <span className={clsx(
                         "block text-[10px] font-black uppercase tracking-widest leading-tight",
                         isGateway ? "text-indigo-300" : isCompute ? "text-emerald-300" : "text-white"
                       )}>{node.id} ({node.name})</span>
                       <span className="block text-[8px] font-bold text-sky-400 mono mt-0.5">{node.ip}</span>
                       <span className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{node.role}</span>
                    </div>
                 </button>
              );
           })}

           {/* NODO VIRTUAL CENTRAL (AQM CAKE / fq_codel CONGESTION) */}
           <div 
             className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center pointer-events-auto"
             style={{ transform: "translate3d(-50%, -50%, 0)", willChange: "transform" }}
           >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-1000 ${isOpen ? 'bg-slate-900/90 border-sky-500/50 shadow-[0_0_30px_rgba(56,189,248,0.2)]' : 'bg-slate-950/90 border-slate-800'}`}>
                <Box className={`w-6 h-6 ${isOpen ? 'text-sky-400 animate-spin-slow' : 'text-slate-600'}`} />
              </div>
              <div className="mt-2 text-center bg-slate-950/90 px-3 py-1.5 rounded border border-white/10 backdrop-blur-md">
                 <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-white">Cluster Core</span>
                 <span className="block text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">fq_codel AQM</span>
              </div>
           </div>

           {/* FLOORING MODAL (Ventana Flotante Técnica con Framer Motion) */}
           <AnimatePresence>
             {selectedNodeData && (
                <motion.div 
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute right-6 top-6 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-xl p-5 z-50 pointer-events-auto"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-black uppercase tracking-widest text-sm">{selectedNodeData.id} Info</h3>
                        <div className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase tracking-widest border border-emerald-500/30">Online</div>
                      </div>
                      <p className="text-sky-400 text-[10px] mono mt-1 font-bold">{selectedNodeData.ip}</p>
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition-colors">
                      <Activity className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1">
                      <span className="text-slate-400 font-bold uppercase tracking-widest">Rol S60</span>
                      <span className="text-emerald-400 uppercase font-black">{selectedNodeData.role}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1">
                      <span className="text-slate-400 font-bold uppercase tracking-widest">Amplitud S60</span>
                      <span className="text-emerald-400 font-bold mono">{selectedNodeData.amplitude?.toLocaleString() ?? "—"}</span>
                    </div>

                    <div className="pt-2">
                       <span className="block text-slate-400 text-[10px] border-b border-white/5 pb-1">MAC bat0</span>
                       <span className="text-slate-300 mono text-[9px]">{selectedNodeData.mac ?? "No disponible"}</span>
                    </div>
                    {selectedNodeData.io_mbps != null && (
                      <div className="pt-1">
                        <span className="block text-slate-400 text-[10px] border-b border-white/5 pb-1">I/O Flujo</span>
                        <span className="text-indigo-400 mono text-[9px]">{selectedNodeData.io_mbps.toFixed(1)} Mbps</span>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <span className="block text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Vecinos (TQ &gt; 230)</span>
                      <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                        {nodes.map(n => {
                          if (n.id === selectedNodeData.id) return null;
                          const key1 = `${selectedNodeData.id}-${n.id}`;
                          const key2 = `${n.id}-${selectedNodeData.id}`;
                          const tq = tqMetrics[key1] || tqMetrics[key2];
                          if (!tq || tq < 200) return null;
                          
                          return (
                            <div key={n.id} className="flex justify-between items-center bg-slate-950/50 px-2 py-1.5 rounded">
                               <span className="text-[9px] text-white mono">{n.id}</span>
                               <div className="flex gap-2 items-center">
                                 <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-emerald-400" style={{ width: `${(tq/255)*100}%` }} />
                                 </div>
                                 <span className="text-[9px] mono text-emerald-400">{tq}</span>
                               </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
    </div>
  );
}

