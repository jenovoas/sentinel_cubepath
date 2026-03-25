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
      <body className="bg-cyber-black selection:bg-sentinel-500/30 selection:text-sentinel-200">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#134e4a_0%,#0a0c10_50%)] pointer-events-none" />
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
