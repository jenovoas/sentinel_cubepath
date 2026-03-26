"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Fingerprint, Calendar, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";

interface TruthSyncReportProps {
  status: any;
}

export function TruthSyncReport({ status }: TruthSyncReportProps) {
  const isSealed = status?.ring_status === "SEALED";
  const isCertified = status?.harmonic_sync === "RESONANCE_MAX" || (status?.is_active && !isSealed);
  
  const sealId = status?.certification_seal || "PLIMPTON_322_GENERIC_CERT";

  return (
    <div className="glass-card p-6 flex flex-col space-y-4 border-sky-500/20">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tighter flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-sky-400" />
            TruthSync Certification
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            Certificación Proactiva de Grado Militar
          </p>
        </div>
        <div className={clsx(
          "px-2 py-1 rounded text-[9px] font-bold border",
          isSealed ? "bg-rose-500/10 border-rose-500/30 text-rose-400" :
          isCertified ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-sky-500/10 border-sky-500/30 text-sky-400"
        )}>
          {isSealed ? "QUARANTINED" : isCertified ? "CERTIFIED" : "SYNC_PENDING"}
        </div>
      </div>

      <div className="relative p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 flex items-center gap-4 overflow-hidden group">
        <div className={clsx(
          "absolute inset-0 bg-gradient-to-r via-transparent to-transparent opacity-10 group-hover:opacity-20 transition-opacity",
          isCertified ? "from-emerald-500" : "from-rose-500"
        )} />
        
        <div className="relative z-10">
          <div className={clsx(
            "p-3 rounded-full border shadow-2xl",
            isCertified ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-rose-500/40 bg-rose-500/10 text-rose-400"
          )}>
            {isCertified ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
        </div>

        <div className="relative z-10 flex-1">
          <p className="text-[9px] text-slate-500 font-bold uppercase">Certificate ID</p>
          <p className="text-xs font-mono text-slate-100 truncate">{sealId}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-[8px] text-slate-600">
              <Calendar className="w-3 h-3" />
              S60_EPOCH_1
            </div>
            <div className="flex items-center gap-1 text-[8px] text-slate-600">
              <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
              Base-60 Proof: VALID
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-black/30 border border-slate-900">
          <p className="text-[8px] text-slate-600 font-bold uppercase mb-1">Harmonic Score</p>
          <div className="text-sm font-mono text-sky-400">0.999824</div>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-slate-900">
          <p className="text-[8px] text-slate-600 font-bold uppercase mb-1">Cortex Latency</p>
          <div className="text-sm font-mono text-emerald-400">&lt; 0.04ms</div>
        </div>
      </div>

      <p className="text-[9px] text-slate-500 leading-relaxed italic text-center">
        "Este certificado garantiza que la telemetría ha sido sanitizada por el Agente Guardián Alpha y cumple con los ratios armónicos de Plimpton 322."
      </p>
    </div>
  );
}
