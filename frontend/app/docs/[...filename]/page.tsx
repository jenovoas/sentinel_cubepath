import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Share2, Printer, Lock, Terminal, Github } from "lucide-react";
import fs from "fs";
import path from "path";

function getMarkdownFiles(dir: string, base: string, fileList: string[] = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getMarkdownFiles(filePath, base, fileList);
      } else if (file.endsWith('.md')) {
        fileList.push(filePath.replace(base + '/', '').replace(/\\/g, '/'));
      }
    }
  } catch (err) {}
  return fileList;
}

export async function generateStaticParams() {
  const docsDir = path.join(process.cwd(), "../docs");
  if (!fs.existsSync(docsDir)) return [];
  
  const files = getMarkdownFiles(docsDir, docsDir);
  return files.map((file) => ({
    filename: file.split('/'),
  }));
}

export default async function DocViewer({ params }: { params: { filename: string[] } }) {
  const docsDir = path.join(process.cwd(), "../docs");
  const currentPath = params.filename.join("/");
  const filePath = path.join(docsDir, ...params.filename);
  
  // Get all files for navigation
  const allFiles = getMarkdownFiles(docsDir, docsDir).sort();
  const currentIndex = allFiles.indexOf(currentPath);
  
  const prevDoc = currentIndex > 0 ? allFiles[currentIndex - 1] : null;
  const nextDoc = currentIndex < allFiles.length - 1 ? allFiles[currentIndex + 1] : null;

  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    content = "# Error: Document not found\nThe requested documentation could not be retrieved from the Sentinel Vault.";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up px-4 py-8">
      <div className="flex items-center justify-between">
        <Link 
          href="/docs" 
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Back to Vault
        </Link>
        <div className="flex items-center justify-end gap-6">
          <a
            href="https://github.com/jenovoas/sentinel_cubepath"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-4 text-slate-500">
            <div className="w-px h-4 bg-white/5" />
            <div className="flex items-center gap-2 text-emerald-500/60 font-bold text-[9px] uppercase tracking-tighter">
              <Lock className="w-3 h-3" /> Encrypted Channel
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 md:p-12 border-emerald-500/10 min-h-[70vh] bg-slate-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <article className="prose prose-invert prose-emerald max-w-none 
          prose-headings:font-extrabold prose-headings:tracking-tighter prose-headings:uppercase
          prose-h1:text-4xl prose-h1:sentinel-gradient-text
          prose-h2:text-2xl prose-h2:text-slate-200 prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-2
          prose-p:text-slate-400 prose-p:leading-relaxed
          prose-strong:text-emerald-400 prose-strong:font-bold
          prose-code:text-emerald-300 prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-slate-950/80 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl
          prose-li:text-slate-400
          prose-table:border prose-table:border-white/5 prose-th:bg-white/5 prose-th:p-2 prose-td:p-2 prose-td:border-t prose-td:border-white/5
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>

        {/* INNER NAVIGATION */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full md:w-auto">
            {prevDoc ? (
              <Link href={`/docs/${prevDoc}`} className="flex flex-col gap-1 items-start group">
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                  <ArrowLeft className="w-2.5 h-2.5" /> Anterior
                </span>
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-emerald-400 transition-colors uppercase">
                  {prevDoc.split('/').pop()?.replace('.md', '').replace(/_/g, ' ')}
                </span>
              </Link>
            ) : (
              <div className="opacity-20 text-[8px] font-black uppercase text-slate-500 tracking-widest">Inicio del Vault</div>
            )}
          </div>

          <Link href="/" className="sentinel-btn sentinel-btn-secondary text-[10px] uppercase tracking-widest px-8 order-last md:order-none">
            Dashboard
          </Link>

          <div className="w-full md:w-auto text-right">
            {nextDoc ? (
              <Link href={`/docs/${nextDoc}`} className="flex flex-col gap-1 items-end group">
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                  Siguiente <ArrowLeft className="w-2.5 h-2.5 rotate-180" />
                </span>
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-emerald-400 transition-colors uppercase">
                  {nextDoc.split('/').pop()?.replace('.md', '').replace(/_/g, ' ')}
                </span>
              </Link>
            ) : (
              <div className="opacity-20 text-[8px] font-black uppercase text-slate-500 tracking-widest">Fin del Vault</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
