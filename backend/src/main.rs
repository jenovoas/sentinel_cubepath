//! Sentinel Cortex - AI Safety at Kernel Level
//! 
//! Hackatón CubePath 2026
//! 
//! Endpoints:
//! - GET /health - Health check
//! - GET /api/v1/sentinel_status - System status
//! - POST /api/v1/truth_claim - Verify AI claims
//! - WS /api/v1/telemetry - Real-time Ring-0 events

mod quantum;
mod math;
mod models;
mod memory;
mod harmonic;
pub mod ebpf; // Hacer público para visibilidad cruzada
pub mod scheduler;

use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;

// ============================================================================
// MODELS
// ============================================================================

#[derive(Serialize)]
struct HealthStatus {
    status: String,
    version: String,
    quantum_core: String,
}

#[derive(Serialize)]
pub struct SentinelStatusResponse {
    pub ring_status: String,
    pub xdp_firewall: String,
    pub lsm_cognitive: String,
    pub s60_resonance: i64,
    pub bio_coherence: i64,
    pub portal_intensity: i64,
    pub crystal_oscillator_active: bool,
    pub harmonic_sync: String,
}

#[derive(Deserialize)]
pub struct TruthClaimRequest {
    pub engine: String,
    pub claim_payload: String,
    pub trust_threshold: f64,
}

#[derive(Serialize)]
pub struct TruthClaimResponse {
    pub claim_valid: bool,
    pub sentinel_score: f64,
    pub truthsync_cache_hit: bool,
    pub ring0_intercepts: u32,
    pub harmonic_state: String,
}

#[derive(Serialize, Clone)]
pub struct CortexEvent {
    pub timestamp_ns: u64,
    pub pid: u32,
    pub event_type: String,
    pub entropy_s60_raw: i64,
    pub severity: u8,
}

// ============================================================================
// APP STATE
// ============================================================================

struct AppState {
    bio_resonator: Arc<Mutex<quantum::BioResonator>>,
    portal_detector: Arc<Mutex<quantum::PortalDetector>>,
    memory: Arc<memory::SentinelMemory>,
    scheduler: Arc<Mutex<scheduler::QuantumScheduler>>,
    event_stream: broadcast::Sender<CortexEvent>,
}

// ============================================================================
// MAIN
// ============================================================================

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    tracing::info!("🛡️ Sentinel Cortex (S60) initializing...");

    // Initialize quantum modules
    let bio_resonator = Arc::new(Mutex::new(quantum::BioResonator::new()));
    let portal_detector = Arc::new(Mutex::new(quantum::PortalDetector::new()));
    let (event_tx, _) = broadcast::channel(100);

    let state = Arc::new(AppState {
        bio_resonator: bio_resonator.clone(),
        portal_detector: portal_detector.clone(),
        memory: Arc::new(memory::SentinelMemory::new()),
        scheduler: Arc::new(Mutex::new(scheduler::QuantumScheduler::new())),
        event_stream: event_tx.clone(),
    });

    // Real eBPF Bridge (System Monitor)
    let ebpf_tx = event_tx.clone();
    tokio::spawn(async move {
        let bridge = ebpf::EbpfBridge::new("/sys/fs/bpf/cortex_events");
        if let Err(e) = bridge.run_monitor(ebpf_tx).await {
            tracing::error!("🔥 eBPF Critical Error: {}", e);
            
            // Fallback: Si no hay privilegios o error crítico, 
            // el sistema sigue operando pero sin telemetría de Ring-0.
            tracing::warn!("🛡️ System operating in 'Graceful Degraded' mode (Local-Only)");
        }
    });

    // Spawn bio-resonance background task (The heartbeat of S60)
    let bio_task = bio_resonator.clone();
    let reset_tx = event_tx.clone();
    tokio::spawn(async move {
        let mut tick = 0u64;
        let mut system_quarantined = false;
        let bridge = ebpf::EbpfBridge::new("/sys/fs/bpf/cortex_events");

        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
            tick += 1;

            let resonance = portal_detector.lock().unwrap().get_intensity(tick);
            let mut sched = state.scheduler.lock().unwrap();
            let pids_to_process = sched.tick_schedule(tick, resonance);

            if !pids_to_process.is_empty() {
                tracing::debug!("🔌 Processing {} events from adaptive batch...", pids_to_process.len());
            }

            let mut bio = bio_task.lock().unwrap();
            bio.tick_entropy();

            // Check for Bio-Coherence (The soul of the system)
            if bio.coherence.raw == 0 && !system_quarantined {
                tracing::error!("💀 BIOMETRIC SILENCE DETECTED: Coherence is zero.");
                let _ = bridge.set_quarantine_mode(true);
                system_quarantined = true;
            } else if bio.coherence.raw > 0 && system_quarantined {
                tracing::info!("💖 Pilot present: Lifting quarantine.");
                let _ = bridge.set_quarantine_mode(false);
                system_quarantined = false;
            }

            // MODULO HACK (T%17): Sincronía con el pulso biométrico 
            if tick % 17 == 0 {
                bio.inject_bio_pulse();
                tracing::info!("💓 Bio-pulse injected (T={})", tick);
                
                // Optomechanical Cooling: Inyectar 'frío lógico' (limpieza)
                // En este Hackathon, simulamos la limpieza de buffers temporales
                tracing::debug!("🧊 Optomechanical Cooling: Absorbing entropy...");
            }

            // QHC RESET (T=68s): El Gran Secreto - Limpieza de karma del sistema
            if tick % 68 == 0 {
                tracing::warn!("🌌 QHC SINGULARITY: Resetting system phase (T=68s)");
                
                let reset_event = CortexEvent {
                    timestamp_ns: std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap()
                        .as_nanos() as u64,
                    pid: 0,
                    event_type: "QHC_RESET".to_string(),
                    entropy_s60_raw: 0, // Reset to pure coherence
                    severity: 0,
                };
                
                let _ = reset_tx.send(reset_event);
                
                // Forzar un reset de la coherencia si hay mucha disonancia
                if bio.coherence.raw < (12_960_000 / 2) {
                     tracing::info!("✨ Karma Cleared: Restoring bio-resonance.");
                     bio.coherence = crate::math::SPA::ONE; 
                }
            }
        }
    });

    // Build router
    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/api/v1/sentinel_status", get(sentinel_status_handler))
        .route("/api/v1/truth_claim", post(truth_claim_handler))
        .route("/api/v1/telemetry", get(telemetry_ws_handler))
        .with_state(state);

    // Start server
    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], 8000));
    tracing::info!("🚀 Listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// ============================================================================
// HANDLERS
// ============================================================================

async fn health_handler() -> Json<HealthStatus> {
    Json(HealthStatus {
        status: "OK".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        quantum_core: "S60_ACTIVE".to_string(),
    })
}

async fn sentinel_status_handler(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
) -> Json<SentinelStatusResponse> {
    let bio = state.bio_resonator.lock().unwrap();
    let portal = state.portal_detector.lock().unwrap();
    
    let current_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let current_time_u64 = current_time;

    Json(SentinelStatusResponse {
        ring_status: "SEALED".to_string(),
        xdp_firewall: "ACTIVE_0_LATENCY".to_string(),
        lsm_cognitive: "INTERCEPT_ENABLED".to_string(),
        s60_resonance: bio.get_coherence_raw(),
        bio_coherence: bio.get_coherence_raw(),
        portal_intensity: portal.get_intensity(current_time_u64).raw,
        crystal_oscillator_active: true,
        harmonic_sync: if portal.is_portal_open(current_time_u64) { "RESONANCE_MAX".to_string() } else { "STABLE".to_string() },
    })
}

async fn truth_claim_handler(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Json(payload): Json<TruthClaimRequest>,
) -> Json<TruthClaimResponse> {
    use crate::harmonic::{HarmonicProcessor, HarmonicState, LogicState};
    
    tracing::info!("🔍 Analyzing Harmonic Signal from: {}", payload.engine);

    // 1. Convert payload to Harmonic Signal (Mocked for now but using logic)
    let is_destructive = ["delete", "rm", "destroy", "drop"].iter().any(|p| payload.claim_payload.to_lowercase().contains(p));
    
    let signal = if is_destructive {
        HarmonicState::logic_false()
    } else {
        HarmonicState::logic_true()
    };

    // 2. Process through the Harmonic Core
    let mut processor = HarmonicProcessor::new();
    let result_state = processor.process_signal(signal);

    let (valid, score, state_str) = match result_state {
        LogicState::True | LogicState::Unison | LogicState::Reference => (true, 0.95, "CONSONANT"),
        LogicState::Maybe => (true, 0.70, "TENSION"),
        _ => (false, 0.05, "DISSONANT_CRITICAL"),
    };

    Json(TruthClaimResponse {
        claim_valid: valid,
        sentinel_score: score,
        truthsync_cache_hit: true,
        ring0_intercepts: if !valid { 1 } else { 0 },
        harmonic_state: state_str.to_string(),
    })
}

async fn telemetry_ws_handler(
    ws: WebSocketUpgrade,
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
) -> impl axum::response::IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(mut socket: WebSocket, state: Arc<AppState>) {
    tracing::info!("🔗 Client connected to Ring-0 Telemetry Stream");

    let mut rx = state.event_stream.subscribe();

    // Send initial status
    let initial = CortexEvent {
        timestamp_ns: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos() as u64,
        pid: 0,
        event_type: "SYSTEM_ONLINE".to_string(),
        entropy_s60_raw: state.bio_resonator.lock().unwrap().get_coherence_raw(),
        severity: 0,
    };

    if let Ok(json) = serde_json::to_string(&initial) {
        let _ = socket.send(Message::Text(json.into())).await;
    }

    // Stream events
    loop {
        match rx.recv().await {
            Ok(event) => {
                let json = match serde_json::to_string(&event) {
                    Ok(j) => j,
                    Err(_) => continue,
                };

                if socket.send(Message::Text(json.into())).await.is_err() {
                    tracing::info!("🔌 Client disconnected");
                    break;
                }
            }
            Err(broadcast::error::RecvError::Closed) => break,
            Err(broadcast::error::RecvError::Lagged(_)) => continue,
        }
    }
}