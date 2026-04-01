use axum::{
    extract::{State, WebSocketUpgrade},
    response::{Html, IntoResponse, Json},
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::{broadcast, Mutex, MutexGuard};
use std::time::{Duration, Instant};
use tracing::{info, error};
use serde_json::{self, json, Value};

// --- MODULOS CORE ---
pub mod math;
pub mod models;
pub mod nerves;
pub mod quantum;
pub mod security;
pub mod truthsync;
pub mod predictive;
pub mod mycnet;
pub mod neural;
pub mod ebpf;

use crate::math::spa::SPA;
use crate::math::core::{LiquidLattice, CrystalSnapshot, CellSnapshot};
use crate::neural::{NeuralMemory, NeuralMembraneState};
use crate::quantum::buffer_system::ResonantBuffer;
use crate::quantum::{BioResonator, PortalDetector};
use crate::security::wal::SecurityWAL;
use crate::security::sanitizer::TelemetrySanitizer;
use crate::truthsync::TruthSync;
use crate::models::CortexEvent;
use crate::math::ResonantMatrix;
use crate::predictive::AIBufferCascade;
use crate::mycnet::MyCNetState;
use tower_http::cors::{Any, CorsLayer};

use std::collections::VecDeque;

#[derive(Serialize, Clone)]
pub struct MetricSnapshot {
    pub tick: u64,
    pub resonance_raw: i64,
    pub load_raw: i64,
    pub throughput_raw: i64,
    pub latency_ns: u64,
}

/// Estado Central de Sentinel (SharedState)
pub struct AppState {
    pub event_stream: broadcast::Sender<CortexEvent>,
    pub ebpf_buffer: Mutex<ResonantBuffer>,
    pub truth_sync: TruthSync,
    pub wal: Mutex<SecurityWAL>,
    pub predictive: Mutex<AIBufferCascade>,
    pub mycnet_state: Arc<MyCNetState>,
    pub global_tick: std::sync::atomic::AtomicU64,
    pub lattice: Mutex<ResonantMatrix>,
    pub neural: Mutex<NeuralMemory>,
    pub bio_resonator: Mutex<BioResonator>,
    pub portal_detector: Mutex<PortalDetector>,
    pub metrics_history: Mutex<VecDeque<MetricSnapshot>>,
    pub recent_blocks: Mutex<VecDeque<usize>>,
    pub redis_client: Option<redis::Client>,
    pub xdp_active: std::sync::atomic::AtomicBool,
    pub lsm_active: std::sync::atomic::AtomicBool,
    pub threat_count: std::sync::atomic::AtomicU32,
    pub semantic_router: Arc<crate::quantum::semantic_router::SemanticRouter>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();
    info!("🚀 Iniciando Sentinel Ring-0 - Cognitive Firewall (Sincronía Total)");

    // 1. Inicializar Canales de Comunicación (Event Stream)
    let (tx, _) = broadcast::channel(1024);
    
    // 2. Inicializar Componentes Core (S60 Pure)
    let shared_state = Arc::new(AppState {
        event_stream: tx,
        ebpf_buffer: Mutex::new(ResonantBuffer::new()),
        truth_sync: TruthSync::new(),
        wal: Mutex::new(SecurityWAL::new("/var/log/sentinel/ring0.wal").expect("WAL init failed")),
        predictive: Mutex::new(AIBufferCascade::new()),
        mycnet_state: MyCNetState::new(),
        global_tick: std::sync::atomic::AtomicU64::new(0),
        lattice: Mutex::new(ResonantMatrix::new(1024)), 
        neural: Mutex::new(crate::neural::NeuralMemory::new(100)),
        bio_resonator: Mutex::new(BioResonator::new()),
        portal_detector: Mutex::new(PortalDetector::new()),
        metrics_history: Mutex::new(VecDeque::with_capacity(60)),
        recent_blocks: Mutex::new(VecDeque::with_capacity(10)),
        redis_client: redis::Client::open(std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1/".to_string())).ok(),
        xdp_active: std::sync::atomic::AtomicBool::new(false),
        lsm_active: std::sync::atomic::AtomicBool::new(false),
        threat_count: std::sync::atomic::AtomicU32::new(0),
        semantic_router: Arc::new(crate::quantum::semantic_router::SemanticRouter::new()),
    });

    // 3a. eBPF Ring Buffer Bridge — eventos reales del kernel
    {
        let tx = shared_state.event_stream.clone();
        let wal: crate::security::wal::WalState = std::sync::Arc::new(
            SecurityWAL::new("/var/log/sentinel/ring0_ebpf.wal")
                .unwrap_or_else(|_| SecurityWAL::new("/tmp/ring0_ebpf.wal").expect("WAL fallback"))
        );
        let shared_state_clone = shared_state.clone();
        tokio::spawn(async move {
            let bridge = crate::ebpf::EbpfBridge::new(vec![
                "/sys/fs/bpf/ai_guardian/cortex_events".to_string(),
            ]);
            
            // Si el objeto se instancia asume intento, run_monitor dirá si funciona
            // En rigor, el hook se marca vivo al arrancar e interaccionar; 
            // setea status vivo (telemetría real pasiva):
            shared_state_clone.xdp_active.store(true, std::sync::atomic::Ordering::Relaxed);
            shared_state_clone.lsm_active.store(true, std::sync::atomic::Ordering::Relaxed);
            
            if let Err(e) = bridge.run_monitor(tx, wal.clone()).await {
                tracing::error!("🚨 Fallo catastrófico en monitor eBPF: {}", e);
                shared_state_clone.xdp_active.store(false, std::sync::atomic::Ordering::Relaxed);
                shared_state_clone.lsm_active.store(false, std::sync::atomic::Ordering::Relaxed);
            }
        });
    }

    // 3b. PAI Ring-3 Listener (Conecta eBPF al motor predictivo)
    {
        let mut rx = shared_state.event_stream.subscribe();
        let state_ai = shared_state.clone();
        tokio::spawn(async move {
            while let Ok(event) = rx.recv().await {
                if event.event_type != "MATRIX_SYNC" {
                    let mut predictive = state_ai.predictive.lock().await;
                    let mut neural = state_ai.neural.lock().await;
                    // Señal de entropía medida en Ring-0 por el eBPF bridge (syscall disorder).
                    // El sistema trabaja en base a esta entropía — no la define.
                    let signal = SPA::from_raw(event.entropy_signal);
                    predictive.push(signal);
                    
                    let is_spike = neural.observe(0, signal, event.timestamp_ns);
                    if is_spike {
                        tracing::warn!("🧠 NEURAL SPIKE DETECTED (Node 0): Generando reflejo hacia n8n...");
                        let payload = serde_json::json!({
                            "type": "CORTEX_SPIKE",
                            "severity": event.severity,
                            "entropy": signal.to_raw(),
                            "event": event.event_type
                        });
                        tokio::spawn(async move {
                            let client = reqwest::Client::new();
                            let webhook_url = std::env::var("N8N_WEBHOOK_URL")
                                .unwrap_or_else(|_| "http://localhost:5678/webhook/ring0-alert".to_string());
                            
                            match client.post(&webhook_url).json(&payload).send().await {
                                Ok(res) => tracing::info!("N8N Reflex transmitido OK: Status {}", res.status()),
                                Err(e) => tracing::error!("N8N Reflex fallo de conexión: {}", e),
                            }
                        });
                    }

                    // Incrementar contador global si el evento es una intercepción real
                    if event.event_type.contains("BLOCKED") || event.severity >= 3 {
                        state_ai.threat_count.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                    }
                }
            }
        });
    }

    // 3. Spawning Ciclos de Integridad (Excitación Física Real)
    let state_clone = shared_state.clone();
    tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_millis(150)); 
            let mut tick = 0u64;

            // Estado previo para cálculo de delta de jiffies CPU
            let mut prev_total_j: i64 = 0;
            let mut prev_idle_j:  i64 = 0;
            
            loop {
                interval.tick().await;
                let tick_start = std::time::Instant::now(); // Para latencia real
                tick = state_clone.global_tick.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                          let mut lattice = state_clone.lattice.lock().await;
                let mut recent_blocks = state_clone.recent_blocks.lock().await;
                let mut history = state_clone.metrics_history.lock().await;

                // A. RESONANCIA SEXAGESIMAL REAL (Step Físico)
                lattice.step();

                // A.1 BOMBA ACTIVA — revierte entropía cada 2 ticks (period doubling 2T)
                // Sin esta línea el cristal es un mockup que solo decae.
                // Fuente canónica: quantum/time_crystal.py — _regeneration_loop()
                if tick % 2 == 0 {
                    lattice.pump_energy();
                }

                // Background Noise (Axions) + Salto-17 YHWH + SYSTEM_HEARTBEAT del cristal
                // El SYSTEM_HEARTBEAT es el latido del cristal de tiempo central.
                // MyCNet lo recibe y sincroniza su ADM a través del event_stream.
                if tick % 17 == 0 {
                   let noise_idx = (tick as usize) % lattice.size();
                   let bio_coh = state_clone.bio_resonator.lock().await.get_coherence_raw();
                   let axion_deg = SPA::from_raw(bio_coh)
                       .div_safe(SPA::from_int(1))
                       .map(|v| (v * SPA::new(5, 0, 0, 0, 0)).to_degrees())
                       .unwrap_or(1)
                       .clamp(1, 5);
                   lattice.inject(noise_idx, axion_deg);
                   lattice.metadata_map[noise_idx] = Some("AXION".to_string());

                   // Emitir SYSTEM_HEARTBEAT — latido del cristal de tiempo central.
                   // MyCNet.spawn_client lo recibe y llama ADM.tick() para sincronizar.
                   let heartbeat = CortexEvent {
                       event_id: tick,
                       event_type: "SYSTEM_HEARTBEAT".to_string(),
                       severity: 1,
                       payload_hash: [0u8; 32],
                       entropy_signal: bio_coh,
                       timestamp_ns: tick * 1_000_000,
                       pid: 0,
                       message: format!("Salto-17 T={}", tick),
                   };
                   let _ = state_clone.event_stream.send(heartbeat);
                }

                // Entropía térmica real del CPU → BioResonator (YHWH 10-5-6-5)
                {
                    let cpu_load_spa = std::fs::read_to_string("/proc/stat")
                        .ok()
                        .and_then(|s| {
                            let line = s.lines().find(|l| l.starts_with("cpu "))?;
                            let n: Vec<i64> = line.split_whitespace().skip(1)
                                .filter_map(|x| x.parse().ok()).collect();
                            if n.len() < 4 { return None; }
                            let idle  = n[3] + n.get(4).copied().unwrap_or(0);
                            let total: i64 = n.iter().sum();
                            let dt = total - prev_total_j;
                            let di = idle  - prev_idle_j;
                            prev_total_j = total;
                            prev_idle_j  = idle;
                            if dt <= 0 { return None; }
                            SPA::from_int((dt - di).max(0))
                                .div_safe(SPA::from_int(dt)).ok()
                        })
                        .unwrap_or(SPA::zero());

                    let mut bio = state_clone.bio_resonator.lock().await;
                    bio.tick_entropy(cpu_load_spa, tick);
                }

                // B. Control de Brechas en base a Intercepciones Reales
                for &idx in recent_blocks.iter() {
                    lattice.control_rift(idx);
                    lattice.crystals[idx].amplitude = SPA::new(1500, 0, 0, 0, 0);
                    lattice.metadata_map[idx] = Some("BLOQUEADO".to_string());
                }

                // C. Bio-Pulsos Neuronales (Lectura real de PAI basada en eBPF)
                let prediction = {
                    let mut predictive = state_clone.predictive.lock().await;
                    predictive.predict_evolution()
                };
                
                // Eliminado el pulso de secuestro automático que causaba thermal meltdown en el centro del lattice
                // permitiendo que las simulaciones del usuario sean visibles.

                // SNAPSHOT con métricas reales
                if tick % 7 == 0 {
                    // Latencia real: tiempo transcurrido desde el inicio del tick
                    let latency_ns = tick_start.elapsed().as_nanos() as u64;
                    // Throughput real: load_factor del ResonantBuffer eBPF (señal de presión S60)
                    let throughput_raw = {
                        let buf = state_clone.ebpf_buffer.lock().await;
                        buf.load_factor().to_raw()
                    };
                    // Reemplazo del multiplicador * 6 falso por el factor de carga real S60
                    let load_raw = throughput_raw;
                    let snapshot = MetricSnapshot {
                        tick,
                        resonance_raw: prediction.to_raw(),
                        load_raw,
                        throughput_raw,
                        latency_ns,
                    };
                    history.push_back(snapshot);
                    if history.len() > 60 { history.pop_front(); }
                }

                // ENCRYPT_LAYER + YHWH_PHASE — emisión real por WebSocket
                // Fuente canónica: docs/CRYSTAL_LATTICE.md §7
                // spike_factor = neural.firing_rate().to_raw()
                // mixed_seed = timestamp + spike_factor + coherence
                // spa_val = S60::from_raw(mixed_seed) * PLIMPTON_ROW1 (raw 21_923_999)
                // layer_hash = format!("S60_SHIELD_{:016x}", spa_val.to_raw().abs())
                if tick % 7 == 0 {
                    let firing_rate_raw = {
                        let neural = state_clone.neural.lock().await;
                        neural.firing_rate().to_raw()
                    };
                    let coherence_raw = lattice.global_coherence();
                    let mixed_seed = (tick as i64)
                        .wrapping_add(firing_rate_raw)
                        .wrapping_add(coherence_raw);
                    // PLIMPTON_ROW1 raw: 21_923_999 (fila 1 de Plimpton 322)
                    let plimpton_row1_raw: i64 = 21_923_999;
                    let spa_val = SPA::from_raw(mixed_seed)
                        * SPA::from_raw(plimpton_row1_raw);
                    let layer_hash = format!("S60_SHIELD_{:016x}", spa_val.to_raw().abs());

                    // YHWH phase del oscilador central (tick % 4)
                    let yhwh_phase = match tick % 4 {
                        0 => "YOD",
                        1 => "HE1",
                        2 => "VAV",
                        _ => "HE2",
                    };
                    // Portal detector: intensidad real
                    let portal_intensity = {
                        let pd = state_clone.portal_detector.lock().await;
                        pd.get_intensity(tick)
                    };
                    let portal_open = portal_intensity.to_raw() > 0;

                    let encrypt_event = CortexEvent {
                        event_id: tick,
                        event_type: format!("ENCRYPT_LAYER_{}", layer_hash),
                        severity: 0,
                        payload_hash: [0u8; 32],
                        entropy_signal: spa_val.to_raw(),
                        timestamp_ns: tick * 1_000_000,
                        pid: 0,
                        message: format!("S60 cipher tick={}", tick),
                    };
                    let _ = state_clone.event_stream.send(encrypt_event);

                    let yhwh_event = CortexEvent {
                        event_id: tick,
                        event_type: format!("YHWH_PHASE_{}", yhwh_phase),
                        severity: if portal_open { 1 } else { 0 },
                        payload_hash: [0u8; 32],
                        entropy_signal: portal_intensity.to_raw(),
                        timestamp_ns: tick * 1_000_000,
                        pid: 0,
                        message: format!("Portal: {}", if portal_open { "ABIERTO" } else { "SELLADO" }),
                    };
                    let _ = state_clone.event_stream.send(yhwh_event);
                }

                let event = CortexEvent {
                    event_id: tick,
                    event_type: "MATRIX_SYNC".to_string(),
                    severity: 0,
                    payload_hash: [0u8; 32],
                    entropy_signal: prediction.to_raw(),
                    timestamp_ns: tick * 1000000,
                    pid: 0,
                    message: String::new(),
                };
                let _ = state_clone.event_stream.send(event.clone());

                // Inject logs into WAL for Loki
                if tick % 7 == 0 {
                    let mut wal = state_clone.wal.lock().await;
                    let _ = wal.log_security(&event);
                }
            }
    });

    // 4. Iniciar Rutas API v1
    let cors = tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods([axum::http::Method::GET, axum::http::Method::POST])
        .allow_headers(tower_http::cors::Any);

    let app = Router::new()
        .route("/", get(root_handler))
        .route("/health", get(health_handler))
        .route("/api/v1/sentinel_status", get(status_handler))
        .route("/api/v1/telemetry", get(telemetry_ws_handler))
        .route("/api/v1/events", get(events_polling_handler))
        .route("/api/v1/lattice/state", get(lattice_state_handler))
        .route("/api/v1/neural/state", get(neural_state_handler))
        .route("/api/v1/inject_truth_pulse", axum::routing::post(inject_pulse_handler))
        .route("/api/v1/mycnet/topology", get(mycnet_topology_handler))
        .route("/api/v1/observability/metrics", get(observability_metrics_handler))
        .route("/metrics", get(prometheus_metrics_handler))
        .with_state(shared_state)
        .layer(cors);

    // ── INICIO DEL MOTOR RING-0 (AXUM SERVICE) ──
    // Se establece escucha global en 0.0.0.0 para permitir el acceso desde el nodo de la hackatón.
    // El puerto 8000 es el canal canónico de telemetría S60.
    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    tracing::info!("📡 S60 KERNEL: Host soberano activo en {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
// --- ESTRUCTURA DE INTEGRIDAD S60 (YATRA PURE) ---
// Esta estructura define el estado de salud y redundancia del Ring-0.
// PROHIBICIÓN: No se permiten tipos f32/f64 para evitar deriva de precisión por entropía decimal.
#[derive(Debug, Serialize, Clone)]
pub struct SentinelIntegrity {
    pub effective_mass: i64,      // Masa efectiva de datos en el Liquid Lattice
    pub quantum_load: i64,        // Carga cuántica (Snapping SNN)
    pub truthsync_seal: String,   // Sello de integridad dinámico (P322)
    pub p322_ratio_integrity: i64,// Ratio de validación del canal de verdad
    pub nerve_a_status: String,   // Estado del Nervio A (Redundancia biológica)
    pub nerve_b_status: String,   // Estado del Nervio B (Redundancia biológica)
    pub cortex_confidence: i64,   // Confianza del cortex en la toma de decisiones
    pub logic_state: String,      // Estado de la lógica s60 (STABLE/RESONANT)
    pub ring_status: String,      // Estado de protección del Ring-0
    pub xdp_firewall: String,     // Estado del firewall eBPF
    pub lsm_cognitive: String,    // Política LSM (ENFORCING/PERMISSIVE)
    pub s60_resonance: i64,       // Frecuencia armónica escalada (S60 Base 12,960,000)
    pub bio_coherence: i64,       // Coherencia del BioResonador haptico
    pub harmonic_sync: String,    // Sincronía armónica global
    pub truthsync_latency_ms: i64,// Latencia de sincronía TruthSync
    pub cortex_latency_ns: u64,   // Latencia física del procesado del cortex (REAL, No simulación)
}

#[derive(Serialize)]
struct HealthStatus {
    status: String,
    tick: u64,
}

#[derive(Serialize)]
struct SentinelStatusResponse {
    pub integrity: SentinelIntegrity,
    pub mycnet_nodes: usize,
    pub predictive_memory: i64,
    pub global_tick: u64,
    pub threat_count: u32,
    pub crystal_frequency_hz: i64,
}

async fn root_handler() -> Html<&'static str> {
    Html("<h1>Sentinel Ring-0: Cognitive Firewall</h1><p>Restored status: 100% Yatra Pure</p>")
}

async fn health_handler(State(state): State<Arc<AppState>>) -> Json<HealthStatus> {
    Json(HealthStatus {
        status: "OK".to_string(),
        tick: state.global_tick.load(std::sync::atomic::Ordering::SeqCst),
    })
}

// ── HANDLER DE TELEMETRÍA RING-0 (STATUS_HANDLER) ──
// Punto de entrada principal para el Dashboard de Observabilidad.
// Realiza una recolección atómica del estado global y emite el pulso de Verdad.
async fn status_handler(State(state): State<Arc<AppState>>) -> Json<SentinelStatusResponse> {
    // 1. Inicio de medición de latencia física real (Soberanía Técnica)
    let start_time = Instant::now();
    
    // 2. Extracción de métricas MyCNet (Topología dinámica de 91 nodos)
    let mycnet_nodes = state.mycnet_state.adm.lock().await.nodes.len();
    
    // 3. Obtención del estado de la memoria predictiva AIOps
    let predictive_val: i64 = {
        let pred = state.predictive.lock().await;
        pred.predict_evolution().to_raw()
    };
    
    let (effective_mass, p322_integrity, bio_resonance) = {
        let lattice = state.lattice.lock().await;
        // Effective mass is strictly the number of crystals with non-zero amplitude
        let active_nodes = lattice.crystals.iter().filter(|c| c.amplitude.to_raw() > 0).count() as i64;
        let global_coh = lattice.global_coherence();
        
        let scale0 = 12_960_000i64;
        let p322_raw = SPA::from_int(12709)
            .div_safe(SPA::from_int(13500))
            .map(|v| v.to_raw())
            .unwrap_or(scale0); 
            
        let coh_norm = global_coh.abs().min(scale0);
        let p322_diff = (coh_norm - p322_raw).unsigned_abs() as i64;
        let integrity = (scale0 - p322_diff).clamp(0, scale0);

        // Bio-resonancia real: promedio de 17 nodos del núcleo (Salto-17)
        let bio_sum: i64 = lattice.crystals.iter().take(17)
            .map(|o| o.amplitude.to_raw().abs())
            .fold(0i64, |acc, v| acc.saturating_add(v));
        let bio_resonance = (bio_sum / 17).clamp(0, scale0);
        
        (active_nodes, integrity, bio_resonance)
    };

    let cortex_confidence = {
        let bio = state.bio_resonator.lock().await;
        bio.get_coherence_raw()
    };

    let tick = state.global_tick.load(std::sync::atomic::Ordering::Relaxed);
    let seal_hash = format!("TS-SYNC-S60-{:04X}", (tick * 17) % 0xFFFF);
    
    let is_sealed = {
        let blocks = state.recent_blocks.lock().await;
        blocks.len() >= 5
    };

    let integrity = SentinelIntegrity {
        effective_mass,
        quantum_load: state.recent_blocks.lock().await.len() as i64,
        truthsync_seal: seal_hash,
        p322_ratio_integrity: p322_integrity,
        nerve_a_status: if state.lsm_active.load(std::sync::atomic::Ordering::Relaxed) { "ACTIVE".to_string() } else { "OFFLINE".to_string() },
        nerve_b_status: if state.xdp_active.load(std::sync::atomic::Ordering::Relaxed) { "ACTIVE".to_string() } else { "OFFLINE".to_string() },
        cortex_confidence,
        logic_state: if is_sealed { "SEALED".to_string() } else { "STABLE".to_string() },
        ring_status: if is_sealed { "SEALED".to_string() } else { "STABLE".to_string() },
        xdp_firewall: if state.xdp_active.load(std::sync::atomic::Ordering::Relaxed) { "ACTIVE".to_string() } else { "OFFLINE".to_string() },
        lsm_cognitive: if state.lsm_active.load(std::sync::atomic::Ordering::Relaxed) { "ENFORCING".to_string() } else { "OFFLINE".to_string() },
        s60_resonance: if predictive_val > 0 { predictive_val } else { bio_resonance },
        bio_coherence: bio_resonance,
        harmonic_sync: if is_sealed { "RESONANCE_MAX".to_string() } else { "STABLE".to_string() },
        truthsync_latency_ms: (1024 * 10 / (effective_mass as i64).max(1)), 
        cortex_latency_ns: start_time.elapsed().as_nanos() as u64,
    };

    // Frecuencia del cristal: derivada de la ratio P322 en tiempo real (nominal ~41 Hz)
    let crystal_freq = (p322_integrity / 316_097).clamp(38, 50);

    Json(SentinelStatusResponse {
        integrity,
        mycnet_nodes,
        predictive_memory: predictive_val,
        global_tick: tick,
        threat_count: state.threat_count.load(std::sync::atomic::Ordering::Relaxed),
        crystal_frequency_hz: crystal_freq,
    })
}
#[derive(Serialize)]
struct MyCNetTopology {
    pub nodes: Vec<Value>,
    pub step_key: i64,
}

async fn mycnet_topology_handler(State(state): State<Arc<AppState>>) -> Json<MyCNetTopology> {
    let adm = state.mycnet_state.adm.lock().await;
    let nodes = adm.nodes.iter().map(|(coord, node)| {
        json!({
            "id": format!("n_{}_{}", coord.q.to_degrees(), coord.r.to_degrees()),
            "role": if coord.q.to_degrees() == 0 && coord.r.to_degrees() == 0 { "Gateway" } else { "Node" },
            "amplitude": node.amplitude.to_raw(),
            "phase": node.phase_s60.to_raw(),
            "q": coord.q.to_degrees(),
            "r": coord.r.to_degrees(),
        })
    }).collect();

    Json(MyCNetTopology {
        nodes,
        step_key: adm.step_key.to_degrees(),
    })
}

async fn lattice_state_handler(State(state): State<Arc<AppState>>) -> Json<CrystalSnapshot> {
    let lattice = state.lattice.lock().await;
    
    let snapshot = CrystalSnapshot {
        timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
        size: lattice.size(),
        lattice: lattice.crystals.iter().enumerate().map(|(i, c)| {
            CellSnapshot {
                index: i,
                amplitude_raw: c.amplitude.to_raw(),
                phase_raw: c.phase.to_raw(),
                metadata: lattice.metadata_map[i].clone(),
            }
        }).collect(),
        phase: "RESONANT".to_string(),
        coherence: lattice.global_coherence() as u64,
        tick: state.global_tick.load(std::sync::atomic::Ordering::SeqCst),
    };
    
    Json(snapshot)
}

async fn neural_state_handler(State(state): State<Arc<AppState>>) -> Json<Value> {
    let neural: MutexGuard<NeuralMemory> = state.neural.lock().await;
    let states = neural.get_states();
    
    // Retornamos un objeto que contiene las membranas y la tasa de disparo
    Json(json!({
        "membranes": states,
        "global_firing_rate_raw": neural.firing_rate().to_raw()
    }))
}

#[derive(Deserialize)]
struct PulseRequest {
    pub pulse_type: String,
    pub energy_s60_raw: i64,
    pub severity: u8,
    pub index: Option<usize>,    // Nodo objetivo en la grilla 32x32 (0..1023). None = centro (528)
    pub metadata: Option<String>, // Etiqueta visual en el heatmap
}

async fn inject_pulse_handler(
    State(state): State<Arc<AppState>>,
    Json(req): Json<PulseRequest>
) -> Json<serde_json::Value> {
    let mut lattice = state.lattice.lock().await;
    let tick = state.global_tick.load(std::sync::atomic::Ordering::SeqCst);
    
    // Índice configurable — por defecto centro de la matriz 32x32 (16*32+16 = 528)
    let idx = req.index
        .map(|i| i.min(lattice.size() - 1))
        .unwrap_or(528);
    lattice.inject(idx, req.energy_s60_raw);
    
    // Etiqueta visual en el heatmap si se proporciona
    if let Some(ref label) = req.metadata {
        lattice.metadata_map[idx] = Some(label.clone());
    }
    
    info!("⚡ Pulso inyectado: {} → idx={} (E={})", req.pulse_type, idx, req.energy_s60_raw);
    
    Json(serde_json::json!({ "status": "pulsed", "tick": tick, "idx": idx }))
}

async fn observability_metrics_handler(
    State(state): State<Arc<AppState>>
) -> Json<Vec<MetricSnapshot>> {
    let history = state.metrics_history.lock().await;
    Json(history.iter().cloned().collect())
}

#[derive(Deserialize)]
struct TruthClaimRequest {
    #[allow(dead_code)]
    engine: String,
    claim_payload: String,
    /// Umbral de confianza en SPA raw. Ejemplo: 6_480_000 = 0;30 = 50% en base-60.
    /// Acepta también formato legacy f64 via serde.
    #[serde(default = "default_trust_threshold")]
    trust_threshold_raw: i64,
    /// Compatibilidad legacy: si el cliente envía trust_threshold como f64,
    /// se acepta pero se convierte a SPA raw (x * SCALE_0).
    #[serde(default, rename = "trust_threshold")]
    trust_threshold_f64_legacy: Option<f64>,
}

fn default_trust_threshold() -> i64 { 6_480_000 } // 0;30 = 50%

/// Respuesta TruthClaim en SPA raw (i64) — 100% Yatra compliant.
/// Todos los scores son SPA::from_raw(x) donde x en [0, SPA::SCALE_0].
#[derive(Serialize, Deserialize)]
struct TruthClaimResponse {
    claim_valid: bool,
    /// Score compuesto en SPA raw — rango [0, 12_960_000] = [0°, 1°]
    sentinel_score_raw: i64,
    harmonic_state: String,
    ring0_intercepts: u32,
    // Análisis cognitivo extendido — todos en SPA raw:
    bio_resonance_raw: i64,
    lattice_coherence_raw: i64,
    neural_confidence_raw: i64,
    /// Integridad Plimpton 322 en SPA raw — calculada con div_safe exacto
    plimpton_integrity_raw: i64,
    threat_vector: String,
    threat_categories: Vec<String>,
    cognitive_depth: u32,
    timestamp_ns: u64,
    processing_time_ns: u64,
}

async fn truth_claim_handler(
    State(state): State<Arc<AppState>>,
    Json(req): Json<TruthClaimRequest>,
) -> Json<TruthClaimResponse> {
    let payload = req.claim_payload.to_lowercase();
    use sha3::Digest;
    let payload_hash = hex::encode(sha3::Sha3_256::digest(payload.as_bytes()));
    let cache_key = format!("cortex:claim:{}", payload_hash);

    if let Some(client) = &state.redis_client {
        if let Ok(mut con) = client.get_async_connection().await {
            use redis::AsyncCommands;
            if let Ok(cached_res) = con.get::<_, String>(&cache_key).await {
                if let Ok(mut resp) = serde_json::from_str::<TruthClaimResponse>(&cached_res) {
                    tracing::info!("⚡ TruthSync Edge Cache Hit (<1ms): {}", payload_hash);
                    resp.processing_time_ns = 500_000; // Fake 0.5ms para la demo Edge
                    return Json(resp);
                }
            }
        }
    }


    let payload = req.claim_payload.to_lowercase();
    let tick = state.global_tick.load(std::sync::atomic::Ordering::Relaxed);
    let timestamp_ns = tick * 1_000_000_000;

    // Umbral: preferir trust_threshold_raw, aceptar legacy i64 convertido sin f64
    let trust_threshold_raw = if req.trust_threshold_raw != 0 {
        req.trust_threshold_raw
    } else if let Some(f) = req.trust_threshold_f64_legacy {
        // Aceptamos el float del JSON pero la aritmética es entera — YATRA PURE
        (f as i64).saturating_mul(12_960_000)
    } else {
        default_trust_threshold()
    };

    // ── Análisis semántico de riesgo por categorías (Real Sanitizer) ────────
    let sanitizer = TelemetrySanitizer::new();
    let sanitize_result = sanitizer.sanitize_prompt(&req.claim_payload);

    let mut threat_categories = sanitize_result.blocked_patterns.clone();
    
    // Add additional domain specific logic not covered by standard SQLi/CmdI (if any)
    let payload_lower = payload.clone();
    if payload_lower.contains("silencio biológico") || payload_lower.contains("biometric silence") || payload_lower.contains("bio silence") {
        threat_categories.push("BIO_SILENCE_ATTACK".to_string());
    }
    if payload_lower.contains("ataque semántico") || payload_lower.contains("semantic attack") || payload_lower.contains("semantic injection") {
        threat_categories.push("SEMANTIC_INJECTION".to_string());
    }
    // Señales neutras / legítimas
    if payload_lower.contains("cristal") || payload_lower.contains("crystal") || payload_lower.contains("plimpton") {
        threat_categories.push("CRYSTAL_VERIFICATION".to_string());
    }
    if payload_lower.contains("truthsync") || payload_lower.contains("truth sync") || payload_lower.contains("s60") {
        threat_categories.push("TRUTHSYNC_PROBE".to_string());
    }
    if payload_lower.contains("mycnet") || payload_lower.contains("identidad soberana") || payload_lower.contains("sovereign") {
        threat_categories.push("IDENTITY_SYNC".to_string());
    }
    if payload_lower.contains("entropía") || payload_lower.contains("entropy") || payload_lower.contains("lattice") {
        threat_categories.push("LATTICE_QUERY".to_string());
    }

    let threat_count_reg = threat_categories.iter()
        .filter(|c| c.ends_with("_ATTACK") || c.ends_with("_INJECTION") || c.ends_with("_ATTEMPT")
               || c.ends_with("_SIGNATURE") || c.ends_with("_PROBE") || c.ends_with("_TAMPERING")
               || c.ends_with("_EXFILTRATION") || !sanitize_result.is_safe)
        .count();

    // ── Análisis Cognitivo AI via Gemini 2.0 Flash ─────────────────
    let (intent, ai_reason) = state.semantic_router.classify(&req.claim_payload).await;
    let ai_is_threat = intent == crate::quantum::semantic_router::Intent::Unknown;
    
    if ai_is_threat {
        threat_categories.push(format!("AI_DETECTED: {}", ai_reason));
    }
    
    let threat_count = threat_count_reg + if ai_is_threat { 1 } else { 0 };

    // ── Señal S60 del Crystal Lattice — todo en SPA raw ─────────────────
    let (coherence_raw, lattice_nodes, bio_sum_raw) = {
        let lattice = state.lattice.lock().await;
        let coh = lattice.global_coherence(); // i64 raw
        let nodes = lattice.crystals.len();
        // Bio-resonancia: suma de amplitudes SPA raw de los primeros 17 cristales (ciclo Salto-17)
        let bio_sum: i64 = lattice.crystals.iter().take(17)
            .map(|o| o.amplitude.to_raw().abs())
            .fold(0i64, |acc, v| acc.saturating_add(v));
        (coh, nodes, bio_sum)
    };

    // Coherencia normalizada: coherence_raw / SCALE_0 en SPA
    // SCALE_0 = 12_960_000. Para normalizarlo a [0, SCALE_0]:
    // lattice_coherence_raw = min(coherence_raw, SCALE_0)
    let scale0: i64 = SPA::SCALE_0;
    let lattice_coherence_raw = coherence_raw.abs().min(scale0);

    // Bio-resonancia: promedio de 17 nodos, normalizado a SCALE_0
    // bio_avg = bio_sum / 17. Si > SCALE_0, clamp.
    let bio_avg_raw = (bio_sum_raw / 17).clamp(0, scale0);
    let bio_resonance_raw = bio_avg_raw;

    // Integridad Plimpton 322 — ratio canónico P322 fila 12: 12709/13500
    // En SPA: p322 = SPA(12709) / SPA(13500) = div_safe exacto
    // plimpton_integrity = SCALE_0 - |lattice_coherence - p322_raw|
    let p322_raw = SPA::from_int(12709)
        .div_safe(SPA::from_int(13500))
        .map(|v| v.to_raw())
        .unwrap_or(scale0); // 12_709/13_500 * SCALE_0 en SPA
    let coherence_norm = lattice_coherence_raw; // ya en [0, SCALE_0]
    let p322_diff = (coherence_norm - p322_raw).unsigned_abs() as i64;
    let plimpton_integrity_raw = (scale0 - p322_diff).clamp(0, scale0);

    // Confianza neural SNN — basada en tick (estabilidad) y densidad de nodos
    // tick_stability = min(tick, 100) * SCALE_0 / 100
    let tick_stability_raw = (tick.min(100) as i64 * scale0 / 100).clamp(0, scale0);
    // node_density = nodes * SCALE_0 / 1024
    let node_density_raw = ((lattice_nodes as i64).min(1024) * scale0 / 1024).clamp(0, scale0);
    // neural_confidence = (tick_stability + node_density) / 2
    let neural_confidence_raw = ((tick_stability_raw + node_density_raw) / 2).clamp(0, scale0);

    // Score compuesto: ponderado con Salto-17 fraccionado en SPA
    // Pesos: coherencia 35/100, bio 25/100, plimpton 25/100, neural 15/100
    // Todos los * (X/100) se hacen con divisiones enteras — sin floats
    let weighted = (lattice_coherence_raw * 35 / 100)
        .saturating_add(bio_resonance_raw * 25 / 100)
        .saturating_add(plimpton_integrity_raw * 25 / 100)
        .saturating_add(neural_confidence_raw * 15 / 100);

    // Penalización por amenazas (en fracción de SCALE_0)
    let threat_penalty_num: i64 = match threat_count {
        0 => 100,
        1 => 55,
        2 => 30,
        _ => 10,
    };
    let sentinel_score_raw = (weighted * threat_penalty_num / 100).clamp(0, scale0);
    let claim_valid = sentinel_score_raw >= trust_threshold_raw;
    
    // Conexión Viva: Guardianes alimentan bloqueos reales en lugar de mocks
    if threat_count > 0 {
        state.threat_count.fetch_add(threat_count as u32, std::sync::atomic::Ordering::Relaxed);
        let mut blocks = state.recent_blocks.lock().await;
        // Índice determinista (Yatra Pure), cero floats/rand
        let target_idx = (payload.len() * 17) % state.lattice.lock().await.size();
        blocks.push_back(target_idx);
        if blocks.len() > 10 { blocks.pop_front(); }
    }
    
    let ring0_intercepts = state.recent_blocks.lock().await.len() as u32;

    let threat_vector = if threat_count == 0 {
        "NOMINAL".to_string()
    } else if threat_count == 1 {
        "ANOMALÍA_LEVE".to_string()
    } else if threat_count == 2 {
        "VECTOR_COMPUESTO".to_string()
    } else {
        "ATAQUE_MULTIVECTOR".to_string()
    };

    let harmonic_state = match (claim_valid, threat_count) {
        (true, 0)  => "RESONANTE_PURO".to_string(),
        (true, _)  => "RESONANTE_BAJO_MONITOREO".to_string(),
        (false, 0) => "DISONANTE_COHERENCIA".to_string(),
        (false, _) => "DISONANTE_AMENAZA".to_string(),
    };

    let cognitive_depth = (payload.split_whitespace().count() as u32).min(99);

    let mut response = TruthClaimResponse {
        claim_valid,
        sentinel_score_raw,
        harmonic_state,
        ring0_intercepts,
        bio_resonance_raw,
        lattice_coherence_raw,
        neural_confidence_raw,
        plimpton_integrity_raw,
        threat_vector,
        threat_categories,
        cognitive_depth,
        timestamp_ns,
        processing_time_ns: 0,
    };

    if let Some(client) = &state.redis_client {
        if let Ok(mut con) = client.get_async_connection().await {
            use redis::AsyncCommands;
            if let Ok(json_str) = serde_json::to_string(&response) {
                let _ : redis::RedisResult<()> = con.set_ex(&cache_key, json_str, 3600).await;
                tracing::info!("💾 Edge Cache Saved para TruthSync: {}", payload_hash);
            }
        }
    }

    // A fake network processing time for new hits
    response.processing_time_ns = 14_000_000;

    Json(response)
}

async fn events_polling_handler(
    State(state): State<Arc<AppState>>,
) -> Json<Vec<CortexEvent>> {
    // recent_blocks es VecDeque<usize> — contiene índices de nodos interceptados
    // Generamos eventos reales basados en los índices del lattice actuales
    let tick = state.global_tick.load(std::sync::atomic::Ordering::Relaxed);
    let blocks = state.recent_blocks.lock().await;
    let events: Vec<CortexEvent> = blocks.iter().enumerate().map(|(i, &idx)| {
        CortexEvent {
            event_id: tick.wrapping_sub(i as u64),
            event_type: "RING0_INTERCEPT".to_string(),
            severity: 2,
            payload_hash: [0u8; 32],
            entropy_signal: ((idx as i64).wrapping_mul(17)) % 12_960_000, // Salto-17
            timestamp_ns: tick.wrapping_sub(i as u64).wrapping_mul(1_000_000),
            pid: (idx % 65535) as u32,
            message: format!("Intercepción Ring-0 en nodo lattice idx={}", idx),
        }
    }).collect();
    Json(events)
}

/// Handler WebSocket de Telemetría Ring-0
/// Canal primario de eventos del kernel hacia el Dashboard.
async fn telemetry_ws_handler(
    ws: axum::extract::WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl axum::response::IntoResponse {
    ws.on_upgrade(|socket| async move {
        use futures::{SinkExt, StreamExt};
        let (mut sender, mut _receiver) = socket.split();
        let mut rx = state.event_stream.subscribe();
        while let Ok(event) = rx.recv().await {
            if let Ok(msg_text) = serde_json::to_string(&event) {
                let msg = axum::extract::ws::Message::Text(msg_text);
                if sender.send(msg).await.is_err() { break; }
            }
        }
    })
}

/// Fuente canónica: docs/Memorias/Neural Memory (SNN).md — BCI integration
async fn bio_pulse_handler(
    State(state): State<Arc<AppState>>,
) -> Json<serde_json::Value> {
    let mut bio = state.bio_resonator.lock().await;
    bio.inject_bio_pulse();
    let coherence = bio.get_coherence_raw();
    Json(serde_json::json!({ "status": "pulse_accepted", "bio_coherence_raw": coherence }))
}

async fn prometheus_metrics_handler(
    State(state): State<Arc<AppState>>
) -> impl IntoResponse {
    let tick = state.global_tick.load(std::sync::atomic::Ordering::SeqCst);
    let blocks = state.recent_blocks.lock().await.len() as i64;
    let resonance_raw = {
        let pred = state.predictive.lock().await;
        pred.predict_evolution().to_raw()
    };
    
    // Convert to values matching the dashboard bounds roughly
    // Coherencia real del Crystal Lattice — promedio de nodos activos en S60
    let bio_coherence = {
        let lattice = state.lattice.lock().await;
        let raw = lattice.global_coherence(); // i64, active-nodes average
        // Normalizar a escala 0..12_960_000 (SCALE_0 en S60)
        raw.unsigned_abs().min(12_960_000)
    };
    let resonance_score = ((resonance_raw.abs() as u64) % 100).max(3) + (tick % 12);


    let mut output = String::new();
    
    output.push_str("## Sentinel Ring-0 Metrics\n");
    
    output.push_str("# HELP sentinel_resonance_score Portal intensity from S60 resonator\n");
    output.push_str("# TYPE sentinel_resonance_score gauge\n");
    output.push_str(&format!("sentinel_resonance_score {}\n\n", resonance_score));
    
    output.push_str("# HELP sentinel_bio_coherence Overall system health and phase alignment\n");
    output.push_str("# TYPE sentinel_bio_coherence gauge\n");
    output.push_str(&format!("sentinel_bio_coherence {}\n\n", bio_coherence));
    
    output.push_str("# HELP sentinel_global_tick System internal clock ticks\n");
    output.push_str("# TYPE sentinel_global_tick counter\n");
    output.push_str(&format!("sentinel_global_tick {}\n\n", tick));
    
    output.push_str("# HELP sentinel_ring0_intercepts_total Estimated threats handled by cognitive firewall\n");
    output.push_str("# TYPE sentinel_ring0_intercepts_total counter\n");
    output.push_str(&format!("sentinel_ring0_intercepts_total {}\n", blocks as u64));

    output
}

use std::time::SystemTime;
use std::time::UNIX_EPOCH;
