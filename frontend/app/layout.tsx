import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vps23309.cubepath.net"),
  title: "Sentinel Ring-0 | Firewall Cognitivo y Telemetría S60",
  description: "Observabilidad eBPF/LSM de núcleo. Aislamiento matemático puro (Yatra S60) sin coma flotante para agentes de inteligencia artificial y protección P2P Hexagonal. Hackatón CubePath 2026.",
  keywords: ["Hacker", "Cyber", "eBPF", "Plimpton 322", "WebAssembly", "Axum", "Rust", "Next.js", "Sextagesimal", "LSM", "XDP", "MyCNet"],
  authors: [{ name: "Jaime Novoa" }],
  openGraph: {
    title: "Sentinel Ring-0 | Cognitive Firewall S60",
    description: "Operaciones deterministas en Ring-0. Defendiendo arquitecturas Linux de AI Autónoma bajo aritmética Yatra S60.",
    url: "https://vps23309.cubepath.net",
    siteName: "Sentinel-Cubepath",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentinel Ring-0 | Firewall Cognitivo",
    description: "Aislamiento Matemático S60. Protección eBPF/LSM.",
  },
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Animated Cyber Grid Overlay */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        {/* Radial Depth Gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.15)_0%,transparent_50%)] pointer-events-none" />
        
        <main className="relative z-10 min-h-screen p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
