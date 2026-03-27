"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, ArrowLeft, BookOpen, ChevronRight, ChevronDown, Search, Folder, Award, Shield, Terminal, Hexagon, X } from "lucide-react";
import { clsx } from "clsx";

const PINNED_DOCS = [
  {
    path: "README.md",
    title: "Visión General",
    desc: "Qué es Sentinel Ring-0, el problema que resuelve, arquitectura completa y cómo probarlo en producción.",
    icon: Shield,
    color: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  },
  {
    path: "DOCUMENTACION_TECNICA.md",
    title: "Documentación Técnica",
    desc: "Todos los módulos (S60, eBPF, Crystal Lattice, Neural LIF, TruthSync), API reference y métricas reales.",
    icon: Terminal,
    color: { text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
  },
  {
    path: "CRYSTAL_LATTICE.md",
    title: "Crystal Lattice Matrix",
    desc: "Oscilador piezoeléctrico S60, Plimpton 322, transferencia de energía entre cristales y visualización heatmap.",
    icon: Hexagon,
    color: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  },
];

export default function DocsIndex() {
  const [docs, setDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(["ROOT DOCUMENTS"]));

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

  // Search logic fix: added absolute path clarity and state handling
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      // Usamos el endpoint de busqueda corregido
      fetch(`/internal-docs-api/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data);
          setIsSearching(false);
          // Si hay resultados de búsqueda, expandimos todas las carpetas que los contienen
          if (data.length > 0) {
            const foldersToOpen = new Set<string>();
            data.forEach((path: string) => {
              const parts = path.split("/");
              foldersToOpen.add(parts.length === 1 ? "ROOT DOCUMENTS" : parts[0].toUpperCase());
            });
            setOpenFolders(prev => new Set([...Array.from(prev), ...Array.from(foldersToOpen)]));
          }
        })
        .catch((err) => {
          console.error("Search error:", err);
          setIsSearching(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFolder = (folder: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  };

  const displayedDocs = searchResults !== null ? searchResults : docs;

  // Grouping logic
  const categorized = displayedDocs.reduce((acc, doc) => {
    const parts = doc.split("/");
    const isRoot = parts.length === 1;
    const folderName = isRoot ? "ROOT DOCUMENTS" : parts[0].toUpperCase();
    
    if (!acc[folderName]) acc[folderName] = [];
    acc[folderName].push({
      path: doc,
      name: parts[parts.length - 1].replace(".md", "").replace(/_/g, " "),
      isMansfield: doc === "ACADEMIC_VALIDATION.md"
    });
    return acc;
  }, {} as Record<string, {path: string, name: string, isMansfield: boolean}[]>);

  const sortedFolders = Object.keys(categorized).sort((a, b) => {
    if (a === "ROOT DOCUMENTS") return 1;
    if (b === "ROOT DOCUMENTS") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up pb-20 px-4 pt-8">
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

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <BookOpen className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tighter sentinel-gradient-text uppercase">
                Technical <span className="text-white opacity-90">Vault</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">S60 Distributed Intelligence Repository</p>
            </div>
          </div>
          
          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
              )}
            </div>
            <input 
              type="text"
              placeholder="SEARCH BY CONTENT..."
              className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-[10px] font-black tracking-widest uppercase text-emerald-100 placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-3 flex items-center text-slate-600 hover:text-rose-500 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── DOCS DESTACADOS ── */}
      {!searchQuery && (
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Puntos de entrada críticos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PINNED_DOCS.map((doc) => (
              <Link key={doc.path} href={`/docs/${doc.path}`}>
                <div className={`glass-card p-5 border ${doc.color.border} ${doc.color.bg} space-y-3 hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${doc.color.bg} rounded-xl border ${doc.color.border}`}>
                      <doc.icon className={`w-4 h-4 ${doc.color.text}`} />
                    </div>
                    <span className={`text-[8px] font-black mono uppercase tracking-widest ${doc.color.text}`}>{doc.path}</span>
                  </div>
                  <h3 className="text-sm font-black text-white">{doc.title}</h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{doc.desc}</p>
                  <div className={`flex items-center gap-1 text-[9px] font-black ${doc.color.text}`}>
                    Acceder <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-white/5 pt-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4">
              Explorador de Archivos (S60 Tree)
            </h2>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4 h-12 animate-pulse opacity-50 border-white/5" />
          ))}
        </div>
      ) : displayedDocs.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-slate-900/20 rounded-3xl border border-white/5">
           <Search className="w-12 h-12 text-slate-800 mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">No matching documents found in the vault.</p>
           <button onClick={() => setSearchQuery("")} className="text-[8px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20 px-4 py-2 rounded-full hover:bg-emerald-500/10">Clear Filter</button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedFolders.map((folder) => {
            const isOpen = openFolders.has(folder);
            return (
              <div key={folder} className="glass-card overflow-hidden border-white/5 bg-white/[0.01]">
                <button 
                  onClick={() => toggleFolder(folder)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {folder === "ROOT DOCUMENTS" ? (
                      <FileText className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Folder className={clsx("w-4 h-4 transition-colors", isOpen ? "text-sky-400" : "text-sky-600")} />
                    )}
                    <h2 className={clsx("text-xs font-black uppercase tracking-[0.25em] transition-colors", 
                      folder === "ROOT DOCUMENTS" ? "text-slate-400" : (isOpen ? "text-sky-300" : "text-slate-500"))}>
                      {folder}
                      <span className="ml-3 text-[8px] font-bold text-slate-700 opacity-50">
                        ({categorized[folder].length} Items)
                      </span>
                    </h2>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {categorized[folder].map((docData) => (
                      <Link key={docData.path} href={`/docs/${docData.path}`}>
                        <div className={`group p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 border ${
                          docData.isMansfield 
                            ? "border-amber-500/40 bg-amber-500/[0.03] hover:bg-amber-500/[0.07] hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.05)]" 
                            : "border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.02]"
                        }`}>
                          <div className="flex items-center gap-3 relative z-10">
                            <div className={`p-1.5 rounded-lg transition-colors ${
                              docData.isMansfield 
                                ? "bg-amber-500/20 text-amber-400" 
                                : "bg-slate-900 text-slate-500 group-hover:bg-emerald-500/20 group-hover:text-emerald-400"
                            }`}>
                              {docData.isMansfield ? <Award className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <div>
                               <h3 className={`text-[11px] font-bold transition-colors ${
                                 docData.isMansfield ? "text-amber-200" : "text-slate-300 group-hover:text-white"
                               }`}>
                                 {docData.name}
                               </h3>
                               <p className="text-[7px] text-slate-600 font-bold uppercase tracking-widest break-all">
                                 {docData.path}
                               </p>
                            </div>
                          </div>
                          <ChevronRight className="w-3 h-3 text-slate-800 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <footer className="pt-20 text-[9px] text-slate-800 font-bold uppercase tracking-[0.3em] text-center italic border-t border-white/5">
        Sentinel Distributed Intelligence Repository © 2026 — Verified S60 Knowledge Base
      </footer>
    </div>
  );
}
