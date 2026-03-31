"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen, ChevronDown, ChevronRight, Search, X,
  Folder, FileText, ArrowLeft, ArrowRight, Menu,
} from "lucide-react";
import { clsx } from "clsx";

interface Props {
  allFiles: string[];
  currentPath: string;
}

function groupFiles(files: string[]) {
  const grouped: Record<string, string[]> = {};
  for (const f of files) {
    const parts = f.split("/");
    const folder = parts.length === 1 ? "__root__" : parts.slice(0, -1).join("/");
    if (!grouped[folder]) grouped[folder] = [];
    grouped[folder].push(f);
  }
  return grouped;
}

export function FloatingDocNav({ allFiles, currentPath }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const currentIndex = allFiles.indexOf(currentPath);
  const prevFile = currentIndex > 0 ? allFiles[currentIndex - 1] : null;
  const nextFile = currentIndex < allFiles.length - 1 ? allFiles[currentIndex + 1] : null;

  // Auto-open the folder of the current file
  useEffect(() => {
    const parts = currentPath.split("/");
    if (parts.length > 1) {
      const folder = parts.slice(0, -1).join("/");
      setOpenFolders(new Set([folder]));
    } else {
      setOpenFolders(new Set(["__root__"]));
    }
  }, [currentPath]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Keyboard: Escape closes, arrow keys navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft" && e.altKey && prevFile) router.push(`/docs/${prevFile}`);
      if (e.key === "ArrowRight" && e.altKey && nextFile) router.push(`/docs/${nextFile}`);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [prevFile, nextFile, router]);

  const filteredFiles = query.trim()
    ? allFiles.filter((f) => f.toLowerCase().includes(query.toLowerCase()))
    : allFiles;

  const grouped = groupFiles(filteredFiles);
  const sortedFolders = Object.keys(grouped).sort((a, b) => {
    if (a === "__root__") return -1;
    if (b === "__root__") return 1;
    return a.localeCompare(b);
  });

  const toggleFolder = (f: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const fileName = (p: string) =>
    p.split("/").pop()!.replace(".md", "").replace(/_/g, " ");

  return (
    <>
      {/* ── FLOATING PILL — always visible ── */}
      <div
        ref={panelRef}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-1"
      >
        {/* Prev */}
        {prevFile ? (
          <Link
            href={`/docs/${prevFile}`}
            title={fileName(prevFile)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-l-full bg-slate-900/95 border border-white/8 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all backdrop-blur-md text-[10px] font-bold uppercase tracking-widest max-w-[160px] truncate"
          >
            <ArrowLeft className="w-3 h-3 shrink-0" />
            <span className="truncate hidden sm:inline">{fileName(prevFile)}</span>
          </Link>
        ) : (
          <div className="w-10 h-9 rounded-l-full bg-slate-900/60 border border-white/5 backdrop-blur-md" />
        )}

        {/* Center toggle — file tree */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 bg-slate-900/95 border backdrop-blur-md transition-all text-[10px] font-black uppercase tracking-widest",
            open
              ? "border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              : "border-white/8 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
          )}
        >
          {open ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{open ? "Cerrar" : "Documentos"}</span>
          <span className="text-slate-600 text-[8px] font-mono">
            {currentIndex + 1}/{allFiles.length}
          </span>
        </button>

        {/* Next */}
        {nextFile ? (
          <Link
            href={`/docs/${nextFile}`}
            title={fileName(nextFile)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-r-full bg-slate-900/95 border border-white/8 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all backdrop-blur-md text-[10px] font-bold uppercase tracking-widest max-w-[160px] truncate"
          >
            <span className="truncate hidden sm:inline">{fileName(nextFile)}</span>
            <ArrowRight className="w-3 h-3 shrink-0" />
          </Link>
        ) : (
          <div className="w-10 h-9 rounded-r-full bg-slate-900/60 border border-white/5 backdrop-blur-md" />
        )}

        {/* ── FILE TREE PANEL — floats above the pill ── */}
        {open && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[340px] max-h-[60vh] flex flex-col rounded-2xl border border-emerald-500/15 bg-slate-950/98 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.05)] overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 shrink-0">
              <BookOpen className="w-4 h-4 text-emerald-500/70" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400">
                Knowledge Vault
              </span>
              <span className="ml-auto text-[8px] text-slate-600 font-mono">{allFiles.length} docs</span>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-white/5 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                <input
                  type="text"
                  placeholder="Buscar documento..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-900/60 border border-white/5 rounded-lg pl-7 pr-3 py-2 text-[11px] text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/30 transition-all"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* File tree — scrollable */}
            <div className="overflow-y-auto flex-1 py-2 custom-scrollbar">
              {sortedFolders.map((folder) => {
                const files = grouped[folder];
                const isRoot = folder === "__root__";
                const isOpen = openFolders.has(folder) || !!query.trim();
                const folderLabel = isRoot
                  ? "Documentos"
                  : folder.split("/").pop()!.replace(/_/g, " ");

                return (
                  <div key={folder}>
                    {/* Folder row */}
                    <button
                      onClick={() => toggleFolder(folder)}
                      className="w-full flex items-center gap-2 px-4 py-1.5 hover:bg-white/[0.02] transition-colors group"
                    >
                      {isOpen
                        ? <ChevronDown className="w-3 h-3 text-slate-600" />
                        : <ChevronRight className="w-3 h-3 text-slate-600" />
                      }
                      {isRoot
                        ? <FileText className="w-3 h-3 text-slate-600" />
                        : <Folder className="w-3 h-3 text-sky-600" />
                      }
                      <span className={clsx(
                        "text-[9px] font-black uppercase tracking-widest truncate",
                        isRoot ? "text-slate-500" : "text-sky-500/70"
                      )}>
                        {folderLabel}
                      </span>
                      <span className="ml-auto text-[8px] text-slate-700 font-mono">{files.length}</span>
                    </button>

                    {/* Files */}
                    {isOpen && (
                      <div className="ml-4 border-l border-white/5">
                        {files.map((file) => {
                          const isCurrent = file === currentPath;
                          return (
                            <Link
                              key={file}
                              href={`/docs/${file}`}
                              onClick={() => setOpen(false)}
                              className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 text-[11px] transition-all truncate",
                                isCurrent
                                  ? "bg-emerald-500/10 text-emerald-300 font-bold border-l-2 border-emerald-500 -ml-px"
                                  : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                              )}
                            >
                              <span className={clsx(
                                "w-1 h-1 rounded-full shrink-0",
                                isCurrent ? "bg-emerald-500" : "bg-slate-700"
                              )} />
                              <span className="truncate">{fileName(file)}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Keyboard hint */}
            <div className="px-4 py-2 border-t border-white/5 shrink-0 flex items-center gap-3">
              <span className="text-[8px] text-slate-700 uppercase font-bold">Alt+← / Alt+→</span>
              <span className="text-[8px] text-slate-700">navegar sin abrir panel</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
