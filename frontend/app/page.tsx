import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter neon-text uppercase">
            Sentinel <span className="text-sentinel-600">Ring-0</span>
          </h1>
          <p className="text-sentinel-400/60 font-medium text-xs tracking-widest uppercase">
            Cognitive Firewall | Hackatón CubePath 2026
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-sentinel-500/50 uppercase font-bold">Node Identity</span>
            <span className="text-sm font-mono text-sentinel-200">sentinel-node-beta-01</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-sentinel-500/20 border border-sentinel-500/40 flex items-center justify-center animate-pulse-slow">
            <div className="w-2 h-2 rounded-full bg-sentinel-400 shadow-[0_0_10px_#2dd4bf]" />
          </div>
        </div>
      </header>

      <Dashboard />
    </div>
  );
}
