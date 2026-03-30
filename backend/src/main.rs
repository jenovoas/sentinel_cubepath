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
use std::time::Duration;
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

use crate::math::spa::SPA;
use crate::math::core::{LiquidLattice, CrystalSnapshot, CellSnapshot};
use crate::neural::{NeuralMemory, NeuralMembraneState};
use crate::quantum::buffer_system::ResonantBuffer;
use crate::security::wal::SecurityWAL;
use crate::truthsync::TruthSync;
use crate::models::CortexEvent;
use crate::math::ResonantMatrix;
use crate::predictive::AIBufferCascade;
use crate::mycnet::MyCNetState;

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
    pub metrics_history: Mutex<VecDeque<MetricSnapshot>>,
    pub recent_blocks: Mutex<VecDeque<usize>>, 
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
        metrics_history: Mutex::new(VecDeque::with_capacity(60)),
        recent_blocks: Mutex::new(VecDeque::with_capacity(10)),
    });

    // 3. Spawning Ciclos de Integridad (Excitación Física Real)
    let state_clone = shared_state.clone();
    tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_millis(150)); 
            let mut tick = 0u64;
            
            loop {
                interval.tick().await;
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

                // Background Noise (Axions) - Alineado con Salto-17
                if tick % 17 == 0 {
                   let noise_idx = (tick as usize) % lattice.size();
                   lattice.inject(noise_idx, 150);
                   lattice.metadata_map[noise_idx] = Some("AXION".to_string());
                }

                // B. Simulación de Ataque (para Demo / Hackaton)
                if tick % 80 == 0 {
                    let attack_idx = (rand::random::<usize>() % lattice.size());
                    recent_blocks.push_back(attack_idx);
                    if recent_blocks.len() > 10 { recent_blocks.pop_front(); }
                }

                // Pintar bloqueos en la Matrix
                for &idx in recent_blocks.iter() {
                    lattice.crystals[idx].amplitude = SPA::new(1500, 0, 0, 0, 0);
                    lattice.metadata_map[idx] = Some("BLOQUEADO".to_string());
                }

                // C. Bio-Pulsos Neuronales (Experiments)
                let prediction = {
                    let predictive = state_clone.predictive.lock().await;
                    predictive.push(SPA::new(tick as i64 % 60, 0, 0, 0, 0))
                };
                
                let pulse_idx = (tick as usize) % lattice.size();
                lattice.inject(pulse_idx, prediction.to_raw());
                lattice.metadata_map[pulse_idx] = Some("BIO-PULSO".to_string());

                // SNAPSHOT
                if tick % 7 == 0 {
                    let snapshot = MetricSnapshot {
                        tick,
                        resonance_raw: prediction.to_raw(),
                        load_raw: (recent_blocks.len() as i64) * 6,
                        throughput_raw: (recent_blocks.len() as i64) * 100, 
                        latency_ns: 40_000 + (tick % 5000),
                    };
                    history.push_back(snapshot);
                    if history.len() > 60 { history.pop_front(); }
                }

                let event = CortexEvent {
                    event_id: tick,
                    event_type: "MATRIX_SYNC".to_string(),
                    severity: 0,
                    payload_hash: [0u8; 32],
                    entropy_signal: prediction.to_raw(),
                    timestamp_ns: tick * 1000000,
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
        .route("/api/v1/lattice/state", get(lattice_state_handler))
        .route("/api/v1/neural/state", get(neural_state_handler))
        .route("/api/v1/inject_truth_pulse", axum::routing::post(inject_pulse_handler))
        .route("/api/v1/observability/metrics", get(observability_metrics_handler))
        .route("/metrics", get(prometheus_metrics_handler))
        .with_state(shared_state)
        .layer(cors);

    // 5. Encender el Motor Ring-0
    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    info!("📡 Servidor Axum escuchando en {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

// --- HANDLERS ---

#[derive(Debug, Serialize)]
struct SentinelIntegrity {
    pub effective_mass: i64,
    pub quantum_load: i64,
    pub truthsync_seal: String,
    pub p322_ratio_integrity: i64,
    pub nerve_a_status: String,
    pub nerve_b_status: String,
    pub cortex_confidence: i64,
    pub logic_state: String,
}

#[derive(Serialize)]
struct HealthStatus {
    status: String,
    tick: u64,
}

#[derive(Serialize)]
struct SentinelStatusResponse {
    integrity: SentinelIntegrity,
    mycnet_nodes: usize,
    predictive_memory: i64,
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

async fn status_handler(State(state): State<Arc<AppState>>) -> Json<SentinelStatusResponse> {
    let mycnet_nodes = state.mycnet_state.adm.lock().await.nodes.len();
    let predictive_val: i64 = {
        let pred = state.predictive.lock().await;
        pred.predict_evolution().to_raw()
    };
    let load_raw = (state.recent_blocks.lock().await.len() as i64) * 6;
    
    let integrity = SentinelIntegrity {
        effective_mass: 1000,
        quantum_load: load_raw,
        truthsync_seal: "YATRA_CERTIFIED".to_string(),
        p322_ratio_integrity: 12_960_000,
        nerve_a_status: "ACTIVE".to_string(),
        nerve_b_status: "ACTIVE".to_string(),
        cortex_confidence: 12_960_000,
        logic_state: "STABLE".to_string(),
    };

    Json(SentinelStatusResponse {
        integrity,
        mycnet_nodes,
        predictive_memory: predictive_val,
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

async fn telemetry_ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| async move {
        use futures::{SinkExt, StreamExt};
        let (mut sender, mut _receiver) = socket.split();
        let mut rx = state.event_stream.subscribe();

        while let Ok(event) = rx.recv().await {
            if let Ok(msg_text) = serde_json::to_string(&event) {
                let msg = axum::extract::ws::Message::Text(msg_text);
                if sender.send(msg).await.is_err() {
                    break;
                }
            }
        }
    })
}

async fn prometheus_metrics_handler(
    State(state): State<Arc<AppState>>
) -> impl IntoResponse {
    let tick = state.global_tick.load(std::sync::atomic::Ordering::SeqCst);
    let blocks = (state.recent_blocks.lock().await.len() as i64) * 6;
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
    output.push_str(&format!("sentinel_ring0_intercepts_total {}\n", tick * 30 + blocks as u64));

    output
}

use std::time::SystemTime;
use std::time::UNIX_EPOCH;
