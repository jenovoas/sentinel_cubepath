use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::Response,
};
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{info, warn};

// ==========================================
// PILAR 2: HEXAGONAL GEOMETRY BASE-60 (ADM-BATMAN)
// ==========================================

/// MyCNet (Red de Micelio) ADM Mesh Hub
/// Matriz de 91 Nodos (Rings 5) simulando enrutamiento hexagonal ADM/Batman-adv.
pub struct HexagonalLattice {
    pub size: usize,
    pub nodes: Vec<AdmogmPacket>,
    pub plasma_shield_active: bool,
}

impl HexagonalLattice {
    pub fn new() -> Self {
        let total_nodes = 91;
        Self {
            size: 5,
            nodes: vec![AdmogmPacket::default(); total_nodes],
            plasma_shield_active: true,
        }
    }

    pub fn inject_holograph(&mut self, data: &[u8]) {
        if data.is_empty() {
            return;
        }

        let mut hasher = Sha256::new();
        hasher.update(data);
        let phase_hash: [u8; 32] = hasher.finalize().into();

        for (i, chunk) in data.chunks(8).enumerate() {
            let node_idx = i % self.nodes.len();
            let mut amplitude_chunk = [0u8; 8];
            for (j, &b) in chunk.iter().enumerate() {
                amplitude_chunk[j] = b;
            }
            
            self.nodes[node_idx] = AdmogmPacket {
                amplitude_chunk: i64::from_le_bytes(amplitude_chunk),
                phase_hash,
                lattice_node_idx: node_idx,
                origin_ts: None,
            };
        }
        info!("💉 ADM-OGM Injection (Holographic): {} Bytes over Mesh.", data.len());
    }
}

// ==========================================
// COMPRESIÓN FRACTAL (ADM-OGM PACKET)
// ==========================================
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AdmogmPacket {
    pub amplitude_chunk: i64,    // Canal A (Energía/Datos)
    pub phase_hash: [u8; 32],    // Canal B (Firma/Fase invisible)
    pub lattice_node_idx: usize, // Coord hexagonal (Estado Difuso)
    pub origin_ts: Option<u64>,  // Registro de tiempo para RTT (Latencia TQ)
}

impl Default for AdmogmPacket {
    fn default() -> Self {
        Self {
            amplitude_chunk: 0,
            phase_hash: [0; 32],
            lattice_node_idx: 0,
            origin_ts: None,
        }
    }
}

// ==========================================
// YHWH PHASE MODULATION (NETWORK RHYTHM)
// ==========================================
#[derive(Debug, Clone, PartialEq)]
pub enum YhwhPhase {
    Yod, // Fase 10 (Expansión/Alta prioridad)
    He1, // Fase 5 (Pausa/Vacío)
    Vav, // Fase 6 (Flujo Constante)
    He2, // Fase 5 (Pausa/ZPE)
}

impl YhwhPhase {
    pub fn from_tick(tick: u64) -> Self {
        let cycle = tick % 26;
        if cycle < 10 {
            YhwhPhase::Yod
        } else if cycle < 15 {
            YhwhPhase::He1
        } else if cycle < 21 {
            YhwhPhase::Vav
        } else {
            YhwhPhase::He2
        }
    }

    pub fn is_network_open(&self) -> bool {
        matches!(self, YhwhPhase::Yod | YhwhPhase::Vav)
    }
}

pub struct MyCNetState {
    pub lattice: Mutex<HexagonalLattice>,
}

impl MyCNetState {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            lattice: Mutex::new(HexagonalLattice::new()),
        })
    }
}

// ==========================================
// WEBSOCKET HANDLERS (INCOMING HIFA)
// ==========================================

pub async fn mycnet_sync_handler(
    ws: WebSocketUpgrade,
    state: axum::extract::State<std::sync::Arc<crate::AppState>>,
) -> Response {
    info!("🍄 MyCNet Adm-Hifa Incoming connection initiated...");
    let state_clone = state.0.clone();
    ws.on_upgrade(move |socket| handle_socket(socket, state_clone))
}

async fn handle_socket(mut socket: WebSocket, state: Arc<crate::AppState>) {
    info!("🔗 MyCNet ADM-OGM Link Established (Incoming)");
    
    let mut rx = state.event_stream.subscribe();

    loop {
        tokio::select! {
            msg = socket.recv() => {
                if let Some(Ok(Message::Text(json_data))) = msg {
                    if let Ok(packet) = serde_json::from_str::<AdmogmPacket>(&json_data) {
                        apply_sync(&state, packet).await;
                    }
                } else {
                    break;
                }
            }
            Ok(event) = rx.recv() => {
                if event.event_type.starts_with("YHWH_PHASE_") && event.severity == 1 {
                    if let Some(msg) = generate_pulse(&state) {
                        if socket.send(Message::Text(msg)).await.is_err() { break; }
                    }
                }
            }
        }
    }
}

// ==========================================
// MYCNET CLIENT (OUTGOING HIFA)
// ==========================================

pub fn spawn_client(state: Arc<crate::AppState>, partner_url: String) {
    tokio::spawn(async move {
        loop {
            info!("🌱 Intentando brote ADM hacia: {}", partner_url);
            match tokio_tungstenite::connect_async(&partner_url).await {
                Ok((socket, _)) => {
                    let (mut write, mut read) = socket.split();
                    info!("🔗 MyCNet ADM-OGM Outgoing Hub established with {}", partner_url);
                    let mut rx = state.event_stream.subscribe();

                    loop {
                        tokio::select! {
                            msg = read.next() => {
                                if let Some(Ok(tokio_tungstenite::tungstenite::Message::Text(json))) = msg {
                                    if let Ok(packet) = serde_json::from_str::<AdmogmPacket>(&json) {
                                        apply_sync(&state, packet).await;
                                    }
                                } else { break; }
                            }
                            Ok(event) = rx.recv() => {
                                if event.event_type.starts_with("YHWH_PHASE_") && event.severity == 1 {
                                    if let Some(msg) = generate_pulse(&state) {
                                        if write.send(tokio_tungstenite::tungstenite::Message::Text(msg)).await.is_err() { break; }
                                    }
                                }
                            }
                        }
                    }
                }
                Err(e) => { warn!("❌ Error en brote MyCNet/ADM: {}. Retry in 10s...", e); }
            }
            tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
        }
    });
}

// ==========================================
// HELPER LOGIC
// ==========================================

async fn apply_sync(state: &Arc<crate::AppState>, packet: AdmogmPacket) {
    let remote_tick = packet.amplitude_chunk as u64;
    let local_tick = state.global_tick.load(std::sync::atomic::Ordering::SeqCst);
    
    if remote_tick > local_tick {
        state.global_tick.store(remote_tick, std::sync::atomic::Ordering::SeqCst);
        info!("⏳ ADM Clock Resynced: Advanced to T={}", remote_tick);
    }

    if let Some(ots) = packet.origin_ts {
        let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_nanos() as u64;
        if now > ots {
            let rtt_ms = (now - ots) as f64 / 1_000_000.0;
            info!("⚡ ADM TQ (Latency): {:.3} ms", rtt_ms);
        }
    }

    let mut lattice = state.mycnet_state.lattice.lock().await;
    let idx = packet.lattice_node_idx % lattice.nodes.len();
    lattice.nodes[idx] = packet;
}

fn generate_pulse(state: &Arc<crate::AppState>) -> Option<String> {
    let time_chunk = state.global_tick.load(std::sync::atomic::Ordering::SeqCst) as i64;
    let mut hasher = Sha256::new();
    hasher.update(time_chunk.to_le_bytes());
    hasher.update(b"S60_RESONANCE_ADM");
    let phase_hash: [u8; 32] = hasher.finalize().into();

    let packet = AdmogmPacket {
        amplitude_chunk: time_chunk,
        phase_hash,
        lattice_node_idx: (time_chunk % 91) as usize,
        origin_ts: Some(std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_nanos() as u64),
    };
    serde_json::to_string(&packet).ok()
}
