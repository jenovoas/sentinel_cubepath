"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTelemetry } from "../hooks/useTelemetry";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, Activity, Box, Server, HardDrive, Cpu } from "lucide-react";

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
        const res = await fetch(`${apiBase}/v1/mycnet/topology`);
        if (res.ok) {
          const data = await res.json();
          // Filtrar Malla ADM a los 7 Nodos Físicos definidos en terraform/mycnet_nodes.tf (Radius = 1)
          const physicalNodes = (data.nodes || []).filter((n: any) => 
            (Math.abs(n.q) + Math.abs(n.q + n.r) + Math.abs(n.r)) <= 2
          );

          const processed = physicalNodes.map((node: any) => {
            const isGateway = node.q === 0 && node.r === 0;
            let name = node.id;
            let roleStr = "Storage";
            let suffix = 1; // Para el Central IP 10.60.0.1

            // Mapeo exacto radial de las 6 direcciones (Clockwise Hex)
            if (isGateway) { name = "vps23309"; roleStr = "Primary"; suffix = 1; }
            else if (node.q === 1 && node.r === 0) { name = "node-01"; roleStr = "Gateway"; suffix = 2; }
            else if (node.q === 0 && node.r === 1) { name = "node-02"; roleStr = "Storage"; suffix = 3; }
            else if (node.q === -1 && node.r === 1) { name = "node-03"; roleStr = "Storage"; suffix = 4; }
            else if (node.q === -1 && node.r === 0) { name = "node-04"; roleStr = "Compute"; suffix = 5; }
            else if (node.q === 0 && node.r === -1) { name = "node-05"; roleStr = "Storage"; suffix = 6; }
            else if (node.q === 1 && node.r === -1) { name = "node-06"; roleStr = "Storage"; suffix = 7; }

            return {
              ...node,
              name,
              role: roleStr,
              ip: `10.60.0.${suffix}`,
              icon: isGateway ? Server : (roleStr === "Compute" ? Cpu : HardDrive),
            };
          });

          // Mantener orden explícito para las líneas topológicas
          processed.sort((a: any, b: any) => (a.name > b.name) ? 1 : -1);
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

  const tqMetrics = useMemo(() => {
    const metrics: Record<string, number> = {};
    if (nodes.length !== 7) return metrics;

    // Solo conectamos los 6 nodos externos al gateway, y un anillo exterior
    const center = nodes.find(n => n.name === "vps23309");
    const ring = nodes.filter(n => n.name !== "vps23309");

    if (center && ring.length === 6) {
      ring.forEach((node, i) => {
        // Enlace al centro
        const toCenterKey = `${node.id}-${center.id}`;
        metrics[toCenterKey] = Math.floor(((node.amplitude + center.amplitude) / 25920000) * 255);
        
        // Enlace al vecino del anillo
        const next = ring[(i + 1) % 6];
        const toNextKey = `${node.id}-${next.id}`;
        metrics[toNextKey] = Math.floor(((node.amplitude + next.amplitude) / 25920000) * 255);
      });
    }
    return metrics;
  }, [nodes]);

  // Generar rutas cruzadas dinámicas (malla de segundo grado)
  const crossKeys = useMemo(() => {
    if (nodes.length < 3) return [];
    return nodes.map((n, i) => `${n.id}-${nodes[(i + 2) % nodes.length].id}`);
  }, [nodes]);

  // Función para convertir TQ (0-255) a formato S60 [d; m, s]
  const renderS60 = (tq: number) => {
    const dec = tq / 255.0;
    const d = Math.floor(dec);
    const m = Math.floor((dec - d) * 60);
    const s = Math.floor((((dec - d) * 60) - m) * 60);
    return `S60[${d.toString().padStart(3, '0')}; ${m.toString().padStart(2, '0')}, ${s.toString().padStart(2, '0')}]`;
  };

  const centerX = 250;
  const centerY = 200;
  // Proyección de geometría Hexagonal (Axial a Pixel) para 7 nodos reales
  const getCoords = (node: any) => {
    const hexSize = 65; // Aumentado drásticamente para evitar overlapping (Viewport 500x400)
    
    // Fórmula estándar axial a pixel (pointy-topped)
    // q = columna diagonal, r = fila
    const px_offset = hexSize * Math.sqrt(3) * (node.q + node.r / 2);
    const py_offset = hexSize * 1.5 * node.r;

    return {
      x: centerX + px_offset,
      y: centerY + py_offset,
      px: ((centerX + px_offset) / 500) * 100,
      py: ((centerY + py_offset) / 400) * 100
    };
  };

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
  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <div className="glass-card flex flex-col border-white/5 relative overflow-hidden bg-slate-950/80 min-h-[500px] h-full w-full">
      <style>{`
        @keyframes flowPacket {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
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
             {getPhaseDesc()} [{((tick || 0) % 60).toString().padStart(2, '0')}]
           </span>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-4 min-h-0">
        
        <div className="relative mx-auto w-full h-full max-w-[500px] max-h-[400px]">
          
          <div className="absolute inset-0 pointer-events-none">
             <svg viewBox="0 0 500 400" className="w-full h-full">
               <defs>
                 <filter id="glow">
                   <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                   <feMerge>
                     <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                   </feMerge>
                 </filter>
               </defs>

              {/* DIBUJO DE RUTAS (EDGES) */}
              {nodes.map((node, i) => {
                 const next = nodes[(i + 1) % nodes.length];
                 const edgeKey = `${node.id}-${next.id}`;
                 const tq = tqMetrics[edgeKey] || 0;
                 const activeRoute = tq > 230 && isOpen;

                 const { x: x1, y: y1 } = getCoords(node);
                 const { x: x2, y: y2 } = getCoords(next);

                 const nodeCrossKeys = crossKeys.filter(ck => ck.startsWith(`${node.id}-`));
                 
                 return (
                   <g key={`edge-${i}`}>
                     <line 
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={activeRoute ? phaseColor : "#334155"}
                        strokeWidth={activeRoute ? 3 : 1}
                        className={activeRoute && phase === 'YOD' ? "animate-pulse" : "transition-all duration-700"}
                        filter={activeRoute ? "url(#glow)" : ""}
                     />
                     {activeRoute && (
                       <motion.line 
                          x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeDasharray="4 16"
                          initial={{ strokeDashoffset: 40 }}
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="opacity-70"
                       />
                     )}
                     
                     {tq > 0 && (
                        <text 
                          x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} 
                          fill={activeRoute ? phaseColor : "#64748b"} 
                          fontSize="8" 
                          fontFamily="monospace" 
                          textAnchor="middle"
                          className="font-bold"
                        >
                          {tick > 0 ? `TQ ${tq}` : ""}
                        </text>
                     )}

                     {nodeCrossKeys.map(ck => {
                        const [src, dst] = ck.split("-");
                        const targetNode = nodes.find(n => n.id === dst);
                        if (!targetNode) return null;

                        const { x: cx2, y: cy2 } = getCoords(targetNode);
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
                     })}
                   </g>
                 );
              })}
            </svg>
          </div>

          {/* HTML NODOS */}
          <div className="absolute inset-0 pointer-events-none">
             {nodes.map((node) => {
                const { px, py } = getCoords(node);
                
                const isGateway = node.role === "Gateway";
                const isCompute = node.role === "Compute S60";

                return (
                   <button 
                     key={node.id} 
                     onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                     className="absolute flex flex-col items-center justify-center pointer-events-auto cursor-pointer group z-30"
                     style={{ left: `${px}%`, top: `${py}%`, transform: "translate(-50%, -50%)" }}
                   >
                      <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border shadow-lg transition-all",
                        selectedNode === node.id ? "ring-2 ring-white scale-110" : "hover:scale-105",
                        isGateway ? "bg-indigo-500/20 border-indigo-500/50" :
                        isCompute ? "bg-emerald-500/20 border-emerald-500/50" : "bg-slate-900 border-slate-700"
                      )}>
                        <node.icon className={clsx("w-5 h-5", isGateway ? "text-indigo-400" : isCompute ? "text-emerald-400" : "text-slate-400")} />
                      </div>
                      <div className="mt-2 text-[8px] font-black uppercase bg-slate-950/80 px-1.5 py-0.5 rounded border border-white/5 text-white">
                        {node.id}
                      </div>
                   </button>
                );
             })}

             {/* NODO CENTRAL */}
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className={clsx(
                  "w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-1000",
                  isOpen ? 'bg-slate-900/90 border-sky-500/50 shadow-[0_0_20px_rgba(56,189,248,0.2)]' : 'bg-slate-950/90 border-slate-800'
                )}>
                  <Box className={clsx("w-6 h-6", isOpen ? 'text-sky-400' : 'text-slate-600')} />
                </div>
             </div>
          </div>
        </div>

        {/* MODAL DETALLE */}
        <AnimatePresence>
          {selectedNodeData && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="absolute right-4 bottom-4 w-60 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 z-50 pointer-events-auto shadow-2xl"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-black uppercase text-[10px] tracking-widest">{selectedNodeData.id}</h3>
                <button onClick={() => setSelectedNode(null)} className="text-slate-500 h-4 w-4">×</button>
              </div>
              <div className="space-y-2 text-[9px] font-mono">
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">IP</span><span className="text-sky-400">{selectedNodeData.ip}</span></div>
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">ROL</span><span className="text-emerald-400">{selectedNodeData.role}</span></div>
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">S60 AMP</span><span className="text-white">{selectedNodeData.amplitude || 0}</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
