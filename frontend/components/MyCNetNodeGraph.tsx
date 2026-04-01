"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTelemetry } from "../hooks/useTelemetry";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, Activity } from "lucide-react";

const VW = 600;
const VH = 480;
const CX = VW / 2;
const CY = VH / 2;
const HEX_SIZE = 52; // radio de cada celda hexagonal

// Coordenadas axiales → píxeles (pointy-top)
function axialToPixel(q: number, r: number) {
  const x = CX + HEX_SIZE * Math.sqrt(3) * (q + r / 2);
  const y = CY + HEX_SIZE * 1.5 * r;
  return { x, y };
}

// Vértices del hexágono para fondo de celda
function hexPath(cx: number, cy: number, size: number) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i + 30); // pointy-top
    return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
  });
  return `M ${pts.join(" L ")} Z`;
}

// Distancia hexagonal
function hexDist(q: number, r: number) {
  return (Math.abs(q) + Math.abs(r) + Math.abs(-q - r)) / 2;
}

export function MyCNetNodeGraph({ phase, isOpen }: { phase: string; isOpen: boolean }) {
  const { tick } = useTelemetry();
  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  useEffect(() => {
    const fetchTopology = async () => {
      try {
        const res = await fetch(`/api/v1/mycnet/topology`);
        if (!res.ok) return;
        const data = await res.json();

        // Sólo radio ≤ 2 (19 nodos máx) con q,r como enteros
        const raw = (data.nodes || []).filter((n: any) => hexDist(n.q, n.r) <= 2);
        setNodes(raw);
      } catch (_) {}
    };
    fetchTopology();
    const iv = setInterval(fetchTopology, 2000);
    return () => clearInterval(iv);
  }, []);

  // Aristas: conectar todos los pares a distancia hexagonal 1
  const edges = useMemo(() => {
    const list: any[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (hexDist(nodes[i].q - nodes[j].q, nodes[i].r - nodes[j].r) === 1) {
          list.push({ a: nodes[i], b: nodes[j] });
        }
      }
    }
    return list;
  }, [nodes]);

  const phaseColor =
    phase === "YOD" ? "#34d399" :
    phase === "VAV" ? "#38bdf8" :
    "#94a3b8";

  const phaseDesc =
    phase === "YOD" ? "CEPH CRUSH SYNC" :
    phase === "VAV" ? "EC 4+2 REBALANCE" :
    "BAT0 IDLE";

  return (
    <div className="glass-card flex flex-col border-white/5 bg-slate-950/80 overflow-hidden w-full h-full min-h-[500px]">

      {/* ── HEADER ── */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <Wifi className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">MyCNet Batman-adv Mesh</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">L2 Topology</span>
              <span className="text-[7px] bg-slate-800 text-slate-400 px-1 rounded mono">bat0</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">YHWH Modulator</span>
          <span className={clsx(
            "text-[10px] font-black uppercase tracking-widest mt-0.5 mono flex items-center gap-1",
            isOpen ? "text-emerald-400" : "text-rose-500"
          )}>
            <Activity className={`w-3 h-3 ${isOpen ? "animate-pulse" : ""}`} />
            {phaseDesc} [{((tick || 0) % 60).toString().padStart(2, "0")}]
          </span>
        </div>
      </div>

      {/* ── SVG HEX MESH ── */}
      <div className="flex-1 relative min-h-0">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow-node">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-edge">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Gradiente para aristas activas */}
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={phaseColor} stopOpacity="0.2" />
              <stop offset="50%" stopColor={phaseColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={phaseColor} stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Fondo hexagonal de celdas (decorativo) */}
          {nodes.map((n) => {
            const { x, y } = axialToPixel(n.q, n.r);
            const isGateway = n.q === 0 && n.r === 0;
            return (
              <path
                key={`cell-${n.id}`}
                d={hexPath(x, y, HEX_SIZE * 0.92)}
                fill={isGateway ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)"}
                stroke={isGateway ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)"}
                strokeWidth="1"
              />
            );
          })}

          {/* Aristas */}
          {edges.map((e, i) => {
            const { x: x1, y: y1 } = axialToPixel(e.a.q, e.a.r);
            const { x: x2, y: y2 } = axialToPixel(e.b.q, e.b.r);
            return (
              <g key={i}>
                {/* Línea base */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isOpen ? phaseColor : "#1e293b"}
                  strokeWidth={isOpen ? 1.5 : 1}
                  opacity={0.4}
                  filter={isOpen ? "url(#glow-edge)" : ""}
                />
                {/* Paquete animado */}
                {isOpen && (
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={phaseColor}
                    strokeWidth="1"
                    strokeDasharray="4 14"
                    opacity={0.7}
                    style={{
                      animation: `flowPacket ${1.5 + (i % 4) * 0.4}s linear infinite`,
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* Nodos */}
          {nodes.map((n) => {
            const { x, y } = axialToPixel(n.q, n.r);
            const isGateway = n.q === 0 && n.r === 0;
            const isSelected = selectedNode?.id === n.id;
            const dist = hexDist(n.q, n.r);
            const nodeColor =
              isGateway ? "#818cf8" :
              dist === 1 ? "#34d399" :
              "#64748b";
            const nodeR = isGateway ? 22 : 16;

            return (
              <g
                key={n.id}
                onClick={() => setSelectedNode(isSelected ? null : n)}
                style={{ cursor: "pointer" }}
                filter={isSelected || isGateway ? "url(#glow-node)" : ""}
              >
                {/* Anillo exterior (seleccionado o gateway) */}
                {(isSelected || isGateway) && (
                  <circle
                    cx={x} cy={y} r={nodeR + 6}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="1"
                    opacity={0.4}
                    strokeDasharray={isGateway ? "none" : "3 3"}
                  />
                )}
                {/* Círculo principal */}
                <circle
                  cx={x} cy={y} r={nodeR}
                  fill={`${nodeColor}22`}
                  stroke={nodeColor}
                  strokeWidth={isSelected ? 2 : 1.5}
                  opacity={isSelected ? 1 : 0.85}
                />
                {/* Punto central */}
                <circle cx={x} cy={y} r={nodeR * 0.3} fill={nodeColor} opacity={0.9} />
                {/* Label */}
                <text
                  x={x} y={y + nodeR + 12}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill={nodeColor}
                  opacity={0.9}
                >
                  {isGateway ? "SCL-01" : `N_${n.q},${n.r}`}
                </text>
                {/* IP debajo del label */}
                <text
                  x={x} y={y + nodeR + 22}
                  textAnchor="middle"
                  fontSize="7"
                  fontFamily="monospace"
                  fill="#475569"
                >
                  10.60.{Math.abs(n.q)}.{Math.abs(n.r)}
                </text>
              </g>
            );
          })}

          {/* Animación keyframes */}
          <style>{`
            @keyframes flowPacket {
              from { stroke-dashoffset: 40; }
              to   { stroke-dashoffset:  0; }
            }
          `}</style>
        </svg>

        {/* Panel de detalle del nodo seleccionado */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-4 bottom-4 w-56 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 z-50 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-black uppercase text-[10px] tracking-widest">
                  {selectedNode.q === 0 && selectedNode.r === 0 ? "GATEWAY" : `NODO (${selectedNode.q},${selectedNode.r})`}
                </h3>
                <button onClick={() => setSelectedNode(null)} className="text-slate-500 text-xs hover:text-white">✕</button>
              </div>
              <div className="space-y-1.5 text-[9px] font-mono">
                {[
                  ["ID", selectedNode.id],
                  ["Axial (q,r)", `${selectedNode.q}, ${selectedNode.r}`],
                  ["IP Batman", `10.60.${Math.abs(selectedNode.q)}.${Math.abs(selectedNode.r)}`],
                  ["Amplitud S60", selectedNode.amplitude?.toLocaleString() ?? "—"],
                  ["Fase S60", selectedNode.phase ?? "—"],
                  ["Rol", selectedNode.q === 0 && selectedNode.r === 0 ? "Primary Gateway" : hexDist(selectedNode.q, selectedNode.r) === 1 ? "Ring-1 Node" : "Ring-2 Sat"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 border-b border-white/5 pb-1">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-sky-400 text-right truncate max-w-[120px]">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
