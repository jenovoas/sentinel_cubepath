import { useState, useEffect, useCallback, useRef } from "react";

export interface CortexEvent {
  timestamp_ns: number;
  pid: number;
  event_type: string;
  message: string;
  entropy_s60_raw: number;
  severity: number;
}

export interface SentinelStatus {
  integrity: {
    effective_mass: number;
    quantum_load: number;
    truthsync_seal: string;
    p322_ratio_integrity: number;
    nerve_a_status: string;
    nerve_b_status: string;
    cortex_confidence: number;
    logic_state: string;
    ring_status: string;
    xdp_firewall: string;
    lsm_cognitive: string;
    s60_resonance: number;
    bio_coherence: number;
    harmonic_sync: string;
    crystal_oscillator_active: boolean;
    cortex_latency_ns: number;   // Nanosegundos reales del kernel (campo canónico)
    cortex_latency_ms: number;   // Derivado: cortex_latency_ns / 1_000_000 (compatibilidad UI)
    truthsync_latency_ms: number;
  };
  mycnet_nodes: number;
  predictive_memory: number;
  global_tick: number;
  threat_count: number;
  crystal_frequency_hz: number;
}

export function useTelemetry() {
  const [status, setStatus] = useState<SentinelStatus | null>(null);
  const [events, setEvents] = useState<CortexEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const eventQueue = useRef<CortexEvent[]>([]);
  const lastTick = useRef<number>(0);
  const stallCount = useRef<number>(0);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/sentinel_status`);
      if (res.ok) {
        const data = await res.json();
        // Heartbeat check: Si el tick no avanza en 3 intentos, marcamos como estancado
        if (data.global_tick === lastTick.current && data.global_tick !== 0) {
          stallCount.current += 1;
        } else {
          stallCount.current = 0;
          lastTick.current = data.global_tick;
        }

        // Normalización de latencia: el backend emite cortex_latency_ns (u64, ns reales)
        // Derivamos cortex_latency_ms para compatibilidad con todos los componentes del frontend
        if (data.integrity && data.integrity.cortex_latency_ns !== undefined && !data.integrity.cortex_latency_ms) {
          data.integrity.cortex_latency_ms = data.integrity.cortex_latency_ns / 1_000_000;
        }

        setStatus(data);
        setError(stallCount.current > 3 ? "Kernel Ring-0 Estancado" : null);
      } else {
        setError(`Error API: ${res.status}`);
      }
    } catch (err) {
      setError("Kernel Offline / Sin Respuesta");
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connect = () => {
      if (ws) ws.close();
      
      // Detección inteligente del host: si estamos en un VPS, intentamos el puerto 8000
      const isHttps = window.location.protocol === "https:";
      const host = window.location.hostname;
      const wsProto = isHttps ? "wss" : "ws";
      
      // Si usamos Nginx como proxy inverso, el puerto 8000 interno no debe exponerse.
      // Usamos window.location.host que ya incluye el puerto correcto (ej: localhost:3000 o vps.com)
      // Nginx enruta /api automáticamente al backend en el puerto 8000 interno.
      const wsUrl = `${wsProto}://${window.location.host}/api/v1/telemetry`;
      
      console.log(`Connecting to TruthSync Telemetry: ${wsUrl}`);
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setConnected(true);
        setError(null);
        console.log("✓ TruthSync Telemetry Connected");
      };
      
      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          eventQueue.current = [event, ...eventQueue.current].slice(0, 200);
        } catch (err) {
          console.error("Malformated Event", err);
        }
      };
      
      ws.onclose = () => {
        setConnected(false);
        console.warn("TruthSync Telemetry Closed. Reconnecting...");
        reconnectTimer = setTimeout(connect, 5000); // Reintento más espaciado
      };
      
      ws.onerror = (err) => {
        console.error("WebSocket Error (Posible Firewall en Puerto 8000)", err);
        ws?.close();
      };
    };

    connect();
    
    // Polling de alta frecuencia para el estado del hardware/kernel
    const statusTimer = setInterval(() => {
      fetchStatus();
    }, 800);

    // Generador de telemetría resiliente: si el WS falla, nutrimos el feed desde el historial real del kernel
    const fallbackTimer = setInterval(async () => {
      if (!connected) {
        try {
          const res = await fetch(`/api/v1/events`);
          if (res.ok) {
            const realEvents = await res.json();
            // Evitamos duplicados comparando timestamps
            setEvents(prev => {
              const newEvents = realEvents.filter((re: any) => !prev.some(pe => pe.timestamp_ns === re.timestamp_ns));
              return [...newEvents, ...prev].slice(0, 200);
            });
          }
        } catch (err) {
          console.error("Error fetching real events fallback", err);
        }
      }
    }, 2000);
    
    // Batch update de eventos para no saturar el main thread de React (solo si WS está activo)
    const eventTimer = setInterval(() => {
      if (connected && eventQueue.current.length > 0) {
        setEvents([...eventQueue.current]);
      }
    }, 400);

    return () => {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(statusTimer);
      clearInterval(fallbackTimer);
      clearInterval(eventTimer);
    };
  }, [fetchStatus, connected]); // Añadimos connected a las dependencias para refrescar el loop

  return { 
    status, 
    events: events.slice(0, 100), // Aseguramos que el feed sea manejable
    connected, 
    error, 
    tick: status?.global_tick || 0,
    isStalled: stallCount.current > 3
  };
}
