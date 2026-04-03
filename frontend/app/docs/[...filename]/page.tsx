import React from "react";
export const dynamic = 'force-dynamic';
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Lock, Github, Hash, Terminal, Quote } from "lucide-react";
import fs from "fs";
import path from "path";
import { FloatingDocNav } from "./FloatingDocNav";

function getMarkdownFiles(dir: string, base: string, fileList: string[] = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getMarkdownFiles(filePath, base, fileList);
      } else if (file.endsWith(".md")) {
        fileList.push(filePath.replace(base + "/", "").replace(/\\/g, "/"));
      }
    }
  } catch {}
  return fileList;
}



// ─── RESOLVE RELATIVE MD LINKS ───────────────────────────────────────────────

function resolveDocHref(href: string | undefined, currentPath: string): string {
  if (!href) return "#";
  // External or absolute — leave alone
  if (href.startsWith("http") || href.startsWith("/") || href.startsWith("#")) return href;
  // Relative .md link → resolve to /docs/<resolved>
  const currentDir = currentPath.includes("/")
    ? currentPath.split("/").slice(0, -1).join("/")
    : "";
  const parts = (currentDir ? currentDir + "/" + href : href).split("/");
  const resolved: string[] = [];
  for (const p of parts) {
    if (p === "..") resolved.pop();
    else if (p !== ".") resolved.push(p);
  }
  return "/docs/" + resolved.join("/");
}

// ─── CUSTOM MARKDOWN COMPONENTS ──────────────────────────────────────────────

function makeMdComponents(
  currentPath: string
): React.ComponentProps<typeof ReactMarkdown>["components"] {
  return {
  // HEADINGS
  h1: ({ children }) => (
    <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mt-10 mb-6 leading-tight">
      <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
        {children}
      </span>
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="flex items-center gap-3 text-xl font-black uppercase tracking-tight text-white mt-10 mb-4 pb-3 border-b border-emerald-500/15">
      <span className="w-1 h-5 bg-emerald-500 rounded-full shrink-0" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-sky-300 mt-8 mb-3">
      <Hash className="w-3 h-3 text-sky-500/60 shrink-0" />
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-violet-400 mt-6 mb-2">
      {children}
    </h4>
  ),

  // PARAGRAPH
  p: ({ children }) => (
    <p className="text-slate-300 text-sm leading-relaxed mb-4">{children}</p>
  ),

  // STRONG / EM
  strong: ({ children }) => (
    <strong className="text-emerald-300 font-bold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-slate-300 italic">{children}</em>
  ),

  // BLOCKQUOTE
  blockquote: ({ children }) => (
    <blockquote className="relative my-6 pl-5 py-1 border-l-2 border-violet-500/50 bg-violet-500/5 rounded-r-xl pr-4">
      <Quote className="absolute top-3 left-3 w-3 h-3 text-violet-500/30" />
      <div className="text-slate-300 text-[13px] italic leading-relaxed pl-4">
        {children}
      </div>
    </blockquote>
  ),

  // INLINE CODE
  code: ({ children, className }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) return <code className={className}>{children}</code>;
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[12px]">
        {children}
      </code>
    );
  },

  // CODE BLOCK
  pre: ({ children }) => (
    <div className="relative my-6 group">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border border-white/5 rounded-t-xl border-b-0">
        <Terminal className="w-3 h-3 text-emerald-500/50" />
        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Terminal</span>
        <div className="ml-auto flex gap-1">
          <div className="w-2 h-2 rounded-full bg-rose-500/40" />
          <div className="w-2 h-2 rounded-full bg-amber-500/40" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
        </div>
      </div>
      <pre className="bg-slate-950/70 border border-white/5 border-t-0 rounded-b-xl p-5 overflow-x-auto text-[12px] font-mono text-slate-300 leading-relaxed scrollbar-thin">
        {children}
      </pre>
    </div>
  ),

  // LISTS
  ul: ({ children }) => (
    <ul className="my-4 space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 space-y-2 list-none counter-reset-[item]">{children}</ol>
  ),
  li: ({ children, ordered, index }: any) => (
    <li className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
      <span className="mt-[5px] shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
      <span>{children}</span>
    </li>
  ),

  // HORIZONTAL RULE
  hr: () => (
    <div className="my-8 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
  ),

  // LINKS
  a: ({ href, children }) => {
    const resolved = resolveDocHref(href, currentPath);
    const isExternal = resolved.startsWith("http");
    return (
      <a
        href={resolved}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-sky-400 underline underline-offset-2 decoration-sky-400/30 hover:text-sky-300 hover:decoration-sky-300/60 transition-colors"
      >
        {children}
      </a>
    );
  },

  // TABLES
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-900/80 border-b border-white/5">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-[13px] text-slate-300">{children}</td>
  ),
  };
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default async function DocViewer({
  params,
}: {
  params: { filename: string[] };
}) {
  const docsDir = '/root/sentinel-cubepath/docs';
  const currentPath = params.filename.join("/");
  const filePath = path.join(docsDir, ...params.filename);

  const allFiles = getMarkdownFiles(docsDir, docsDir).sort();
  const currentIndex = allFiles.indexOf(currentPath);
  const prevDoc = currentIndex > 0 ? allFiles[currentIndex - 1] : null;
  const nextDoc = currentIndex < allFiles.length - 1 ? allFiles[currentIndex + 1] : null;

  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    content =
      "# Error: Documento no encontrado\n\nEl documento solicitado no pudo ser recuperado del Vault de Sentinel.";
  }

  const docTitle = params.filename[params.filename.length - 1]
    .replace(".md", "")
    .replace(/_/g, " ");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/docs"
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Back to Vault
        </Link>
        <div className="flex items-center gap-4 text-slate-500">
          <a
            href="https://github.com/jenovoas/sentinel"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
          <div className="w-px h-4 bg-white/5" />
          <div className="flex items-center gap-1.5 text-emerald-500/60 font-bold text-[9px] uppercase tracking-tighter">
            <Lock className="w-3 h-3" /> Encrypted Channel
          </div>
        </div>
      </div>

      {/* ── DOCUMENT HEADER ── */}
      <div className="glass-card px-8 py-6 border-emerald-500/10 bg-slate-950/60">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-1 font-mono">
          {params.filename.join(" / ").replace(".md", "")}
        </p>
        <h1 className="text-2xl font-black uppercase tracking-tight">
          <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
            {docTitle}
          </span>
        </h1>
      </div>

      {/* ── DOCUMENT BODY ── */}
      <div className="glass-card px-8 md:px-12 py-10 border-emerald-500/10 bg-slate-950/40 relative overflow-hidden min-h-[60vh]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/3 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={makeMdComponents(currentPath)}>
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* ── FLOATING NAV ── */}
      <FloatingDocNav allFiles={allFiles} currentPath={currentPath} />

      {/* ── BOTTOM NAV ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 pb-20">
        <div className="w-full md:w-auto">
          {prevDoc ? (
            <Link
              href={`/docs/${prevDoc}`}
              className="flex flex-col gap-1 items-start group"
            >
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                <ArrowLeft className="w-2.5 h-2.5" /> Anterior
              </span>
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-emerald-400 transition-colors uppercase">
                {prevDoc.split("/").pop()?.replace(".md", "").replace(/_/g, " ")}
              </span>
            </Link>
          ) : (
            <div className="opacity-20 text-[8px] font-black uppercase text-slate-500 tracking-widest">
              Inicio del Vault
            </div>
          )}
        </div>

        <Link
          href="/"
          className="sentinel-btn sentinel-btn-secondary text-[10px] uppercase tracking-widest px-8 order-last md:order-none"
        >
          Dashboard
        </Link>

        <div className="w-full md:w-auto text-right">
          {nextDoc ? (
            <Link
              href={`/docs/${nextDoc}`}
              className="flex flex-col gap-1 items-end group"
            >
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                Siguiente <ArrowLeft className="w-2.5 h-2.5 rotate-180" />
              </span>
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-emerald-400 transition-colors uppercase">
                {nextDoc.split("/").pop()?.replace(".md", "").replace(/_/g, " ")}
              </span>
            </Link>
          ) : (
            <div className="opacity-20 text-[8px] font-black uppercase text-slate-500 tracking-widest">
              Fin del Vault
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
