"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, ArrowLeft, BookOpen, ChevronRight } from "lucide-react";

export default function DocsIndex() {
  const [docs, setDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/internal-docs-api`)
      .then((res) => res.json())
      .then((data) => {
        setDocs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching docs:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter">Knowledge Vault Active</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <BookOpen className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter sentinel-gradient-text uppercase">
              Technical <span className="text-white opacity-90">Vault</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Core specifications and architectural protocols of the Sentinel Ring-0</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 h-24 animate-pulse opacity-50" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(
            docs.reduce((acc, doc) => {
              const parts = doc.split("/");
              const isRoot = parts.length === 1;
              const folderName = isRoot ? "Root Documents" : parts[parts.length - 2].toUpperCase();
              if (!acc[folderName]) acc[folderName] = [];
              acc[folderName].push({
                 path: doc,
                 name: parts[parts.length - 1].replace(".md", "").replace(/_/g, " ")
              });
              return acc;
            }, {} as Record<string, {path: string, name: string}[]>)
          ).map(([folder, folderDocs]) => (
            <div key={folder} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500">{folder}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {folderDocs.map((docData) => (
                  <Link key={docData.path} href={`/docs/${docData.path}`}>
                    <div className="glass-card p-6 flex items-center justify-between group cursor-pointer border-emerald-500/5 hover:border-emerald-500/30">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                          <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                            {docData.name}
                          </h3>
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest break-all">
                            {docData.path}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="pt-12 text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em] text-center italic">
        Sentinel Distributed Intelligence Repository © 2026
      </footer>
    </div>
  );
}
