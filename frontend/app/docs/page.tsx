"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, ArrowLeft, BookOpen, ChevronRight, Search, Folder, Award } from "lucide-react";

export default function DocsIndex() {
  const [docs, setDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[] | null>(null);

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

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/internal-docs-api/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data))
        .catch((err) => console.error("Search error:", err));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayedDocs = searchResults !== null ? searchResults : docs;

  // Grouping logic: Folders first, then Root Files
  const categorized = displayedDocs.reduce((acc, doc) => {
    const parts = doc.split("/");
    const isRoot = parts.length === 1;
    const folderName = isRoot ? "Root Documents" : parts[0].toUpperCase();
    
    if (!acc[folderName]) acc[folderName] = [];
    acc[folderName].push({
      path: doc,
      name: parts[parts.length - 1].replace(".md", "").replace(/_/g, " "),
      isMansfield: doc === "ACADEMIC_VALIDATION.md"
    });
    return acc;
  }, {} as Record<string, {path: string, name: string, isMansfield: boolean}[]>);

  // Sort folders to have "ROOT DOCUMENTS" last or specifically ordered
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
          <div className="relative w-full md:w-72 group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="SEARCH BY CONTENT..."
              className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black tracking-widest uppercase text-emerald-100 placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 h-24 animate-pulse opacity-50 border-white/5" />
          ))}
        </div>
      ) : displayedDocs.length === 0 ? (
        <div className="py-20 text-center space-y-4">
           <Search className="w-12 h-12 text-slate-800 mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">No matching documents found in the vault.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedFolders.map((folder) => (
            <div key={folder} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                {folder === "ROOT DOCUMENTS" ? (
                  <FileText className="w-4 h-4 text-slate-500" />
                ) : (
                  <Folder className="w-4 h-4 text-sky-500" />
                )}
                <h2 className={`text-xs font-black uppercase tracking-[0.25em] ${folder === "ROOT DOCUMENTS" ? "text-slate-500" : "text-sky-400"}`}>
                  {folder}
                  <span className="ml-3 text-[8px] font-bold text-slate-700 opacity-50">
                    ({categorized[folder].length} Items)
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorized[folder].map((docData) => (
                  <Link key={docData.path} href={`/docs/${docData.path}`}>
                    <div className={`glass-card p-6 flex items-center justify-between group cursor-pointer transition-all duration-300 relative overflow-hidden ${
                      docData.isMansfield 
                        ? "border-amber-500/40 bg-amber-500/[0.03] hover:bg-amber-500/[0.07] hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.05)]" 
                        : "border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.02]"
                    }`}>
                      {docData.isMansfield && (
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full group-hover:bg-amber-500/20 transition-colors" />
                      )}
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-2 rounded-lg transition-colors ${
                          docData.isMansfield 
                            ? "bg-amber-500/20 text-amber-400" 
                            : "bg-slate-900 text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400"
                        }`}>
                          {docData.isMansfield ? (
                            <Award className="w-5 h-5 shadow-sm" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-bold transition-colors ${
                              docData.isMansfield ? "text-amber-200 group-hover:text-amber-100" : "text-slate-200 group-hover:text-white"
                            }`}>
                              {docData.name}
                            </h3>
                            {docData.isMansfield && (
                              <span className="text-[7px] font-black uppercase bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 tracking-tighter">
                                VALIDATED
                              </span>
                            )}
                          </div>
                          <p className={`text-[9px] font-bold uppercase tracking-widest break-all opacity-40 group-hover:opacity-100 transition-opacity ${
                            docData.isMansfield ? "text-amber-500" : "text-slate-600"
                          }`}>
                            {docData.path}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-all relative z-10 ${
                        docData.isMansfield ? "text-amber-700 group-hover:text-amber-400" : "text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1"
                      }`} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="pt-20 text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em] text-center italic border-t border-white/5">
        Sentinel Distributed Intelligence Repository © 2026 — Verified S60 Knowledge Base
      </footer>
    </div>
  );
}

