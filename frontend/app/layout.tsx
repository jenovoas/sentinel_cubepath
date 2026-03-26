import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentinel Ring-0 | Cognitive Firewall",
  description: "Advanced AI Safety at Kernel Level for Autonomous Agents",
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
