"use client";

import React, { useMemo } from "react";
import { Activity, Network, Zap, Lock, Database } from "lucide-react";

export function MyCNetNodeGraph({ phase, isOpen }: { phase: string, isOpen: boolean }) {
  // Generamos un Hexágono (Size 7 pero visualmente representativo con nodos clave)
  const nodes = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const angle = (i * 60 * Math.PI) / 180;
      return {
        id: i,
        x: 50 + 35 * Math.cos(angle),
        y: 50 + 35 * Math.sin(angle),
      };
    });
  }, []);

  const getPhaseColor = () => {
    switch (phase) {
      case "YOD": return "text-emerald-400 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]";
      case "VAV": return "text-sky-400 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]";
      default: return "text-slate-500 border-slate-700 opacity-50"; // HE (Pause)
    }
  };

  const getPhaseBgColor = () => {
    switch (phase) {
      case "YOD": return "bg-emerald-500/20";
      case "VAV": return "bg-sky-500/20";
      default: return "bg-slate-800/50";
    }
  };

  return (
    <div className="glass-card flex flex-col h-full border-indigo-500/10 relative overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-indigo-400" />
          <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
            MyCNet Holographic Mesh
          </h2>
        </div>
        <div className="flex items-center gap-2">
           <Activity className={`w-3 h-3 ${isOpen ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
           <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mono">P2P Link</span>
        </div>
      </div>

      <div className="flex-1 min-h-[140px] relative flex flex-col items-center justify-center p-4 z-10">
        
        {/* State Indicator */}
        <div className="flex flex-col items-center w-full mb-4">
          <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">YHWH Rhythm</span>
          <div className={`mt-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border transition-all duration-500 ${getPhaseBgColor()} ${getPhaseColor()}`}>
            PHASE: {phase || "WAITING"}
          </div>
          <span className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${isOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isOpen ? 'Holo-Stream ACTIVE' : 'Buffer Purge (Breathing)'}
          </span>
        </div>

        {/* Visualization of the two nodes connected */}
        <div className="w-full max-w-md mx-auto relative flex items-center justify-between pb-4">
           
           {/* LOCAL NODE (FENIX) */}
           <div className="relative flex flex-col items-center group">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-1000 z-10 
                 ${isOpen ? 'bg-indigo-500/20 border border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'bg-slate-800 border-slate-700'}`}>
                 <Database className={`w-8 h-8 ${isOpen ? 'text-indigo-400' : 'text-slate-500'}`} />
              </div>
              <div className="mt-3 text-center">
                 <span className="block text-[10px] font-black text-white uppercase tracking-widest leading-none">Fenix</span>
                 <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 mono">LOCAL S60</span>
              </div>
           </div>

           {/* THE MYCNET LINK (HEXAGONAL TUBE) */}
           <div className="flex-1 h-24 relative mx-4 flex items-center justify-center">
              {/* Central Line */}
              <div className="absolute w-full h-px bg-slate-700 top-1/2 -translate-y-1/2" />
              
              {isOpen && (
                 <>
                    {/* Animated Data Packets (Fractal Seeds) */}
                    <div className="absolute w-full h-full overflow-hidden top-0 left-0">
                       <div className={`w-full h-px top-1/2 -translate-y-1/2 absolute 
                          ${phase === 'YOD' ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[pulse_1s_ease-in-out_infinite]' : 
                            phase === 'VAV' ? 'bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-[pulse_2s_ease-in-out_infinite]' : ''}`} 
                       />
                       
                       {/* Hexagonal Nodes in the middle symbolizing the Lattice */}
                       <svg viewBox="0 0 100 100" className="absolute w-full h-full opacity-30 animate-spin-slow pointer-events-none">
                          <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500" />
                          {nodes.map(n => (
                             <circle key={n.id} cx={n.x} cy={n.y} r="2" className={`fill-current ${phase === 'YOD' ? 'text-emerald-400' : 'text-sky-400'}`} />
                          ))}
                       </svg>
                    </div>
                 </>
              )}
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 py-1 flex items-center gap-2 border border-slate-800 rounded-full z-20">
                 <Lock className="w-3 h-3 text-slate-500" />
                 <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mono">Hash de Fase</span>
              </div>
           </div>

           {/* REMOTE NODE (CUBEPATH) */}
           <div className="relative flex flex-col items-center group">
              <div className={`w-16 h-16 rounded-hexagon flex items-center justify-center transition-all duration-1000 z-10 
                 ${isOpen ? 'bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_30px_rgba(52,211,153,0.3)]' : 'bg-slate-800 border-slate-700'}`}>
                 <Zap className={`w-8 h-8 ${isOpen ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              <div className="mt-3 text-center">
                 <span className="block text-[10px] font-black text-white uppercase tracking-widest leading-none">CubePath</span>
                 <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 mono">REMOTE S60</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
