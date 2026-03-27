import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Share2, Printer, Lock, Terminal } from "lucide-react";
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
  const filePath = path.join(docsDir, ...params.filename);
  
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
        <div className="flex items-center gap-4 text-slate-500">
          <button className="hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
          <button className="hover:text-white transition-colors"><Printer className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-white/5" />
          <div className="flex items-center gap-2 text-emerald-500/60 font-bold text-[9px] uppercase tracking-tighter">
            <Lock className="w-3 h-3" /> Encrypted Channel
          </div>
        </div>
      </div>

      <div className="glass-card p-8 md:p-12 border-emerald-500/10 min-h-[70vh]">
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
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/" className="sentinel-btn sentinel-btn-secondary text-[10px] uppercase tracking-widest px-8">
          Acknowledge Protocol & Return
        </Link>
      </div>
    </div>
  );
}
