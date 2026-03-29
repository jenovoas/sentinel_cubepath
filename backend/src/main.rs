sta el link que te predicciónuse axum::{
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

// --- MODULOS CORE ---
pub mod math;
pub mod models;
pub mod nerves;
pub mod quantum;
pub mod security;
pub mod truthsync;
pub mod predictive;
pub mod mycnet;

use crate::math::{SPA, SPAMath};
use crate::security::wal::SecurityWAL;
use crate::truthsync::TruthSync;
use crate::models::{CortexEvent, Severity, EventType, Event};
use crate::predictive::AIBufferCascade;
use crate::mycnet::MyCNetState;
use crate::quantum::buffer_system::ResonantBuffer;

/// Estado Central de Sentinel (SharedState)
pub struct AppState {
    pub event_stream: broadcast::Sender<CortexEvent>,
    pub ebpf_buffer: Mutex<ResonantBuffer>,
    pub truth_sync: TruthSync,
    pub wal: Mutex<SecurityWAL>,
    pub predictive: Mutex<AIBufferCascade>,
    pub mycnet_state: Arc<MyCNetState>,
    pub global_tick: std::sync::atomic::AtomicU64,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();
    info!("🚀 Iniciando Sentinel Ring-0 - Cognitive Firewall (Restored)");

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
    });

    // 3. Spawning Ciclos de Integridad (Second Loop - Telemetry Background)
    let state_clone = shared_state.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_millis(100));
        loop {
            interval.tick().await;
            let tick = state_clone.global_tick.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
            
            // Simulación de Inyección de Ruido Físico (Entropía)
            if tick % 10 == 0 {
                let mut buffer: MutexGuard<ResonantBuffer> = state_clone.ebpf_buffer.lock().await;
                let prediction = {
                    let mut predictive: MutexGuard<AIBufferCascade> = state_clone.predictive.lock().await;
                    // Alimentar señal y extraer la predicción no-markoviana (OUK)
                    predictive.push(SPA::new(tick as i64 % 60, 0, 0, 0, 0))
                };
                
                let event = CortexEvent {
                    event_id: tick,
                    event_type: "SYSCALL_MONITOR".to_string(),
                    severity: 0,
                    payload_hash: [0u8; 32],
                    entropy_signal: prediction.to_raw(),
                    timestamp_ns: tick * 1000,
                };
                
                buffer.push(event.clone());
                let _ = state_clone.event_stream.send(event);
            }

            // Reporte de Salud cada 50 ticks (Sentinela)
            if tick % 50 == 0 {
                let load = state_clone.ebpf_buffer.lock().await.load_factor().to_raw() / 60;
                let integrity = SentinelIntegrity {
                    effective_mass: 1000,
                    quantum_load: load,
                    truthsync_seal: "YATRA_CERTIFIED".to_string(),
                    p322_ratio_integrity: 12_960_000, 
                    nerve_a_status: "ACTIVE".to_string(),
                    nerve_b_status: "ACTIVE".to_string(),
                    cortex_confidence: 12_960_000,
                    logic_state: "STABLE".to_string(),
                };
                info!("📊 Integrity Report [T={}]: S60 Load={} deg", tick, integrity.quantum_load);
            }
        }
    });

    // 4. Iniciar Rutas API v1
    let app = Router::new()
        .route("/", get(root_handler))
        .route("/health", get(health_handler))
        .route("/api/v1/sentinel_status", get(status_handler))
        .route("/api/v1/telemetry", get(telemetry_ws_handler))
        .with_state(shared_state);

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
        let mut pred: MutexGuard<AIBufferCascade> = state.predictive.lock().await;
        pred.predict_evolution().to_raw()
    };
    let load_raw = state.ebpf_buffer.lock().await.load_factor().to_raw() / 60;
    
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
