// src/mycnet.rs
//! 🍄 ME-60OS: MYCNET RESONANT LATTICE (RUST)  mushroom
//! ---------------------------------------------------------------------------
//! Implementación de la red micelial hexagonal bio-inspirada.

use crate::math::SPA;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{info, warn};
use std::collections::HashMap;
use crate::models::Severity;

/// Coordenadas Axiales (Hexagonal Grid)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct AxialCoord {
    pub q: i32,
    pub r: i32,
}

impl AxialCoord {
    pub fn new(q: i32, r: i32) -> Self {
        Self { q, r }
    }

    /// Obtiene los 6 vecinos hexagonales directos
    pub fn neighbors(&self) -> [AxialCoord; 6] {
        [
            AxialCoord::new(self.q + 1, self.r),
            AxialCoord::new(self.q + 1, self.r - 1),
            AxialCoord::new(self.q, self.r - 1),
            AxialCoord::new(self.q - 1, self.r),
            AxialCoord::new(self.q - 1, self.r + 1),
            AxialCoord::new(self.q, self.r + 1),
        ]
    }
}

/// Nodo Micelial (Unidad de Procesamiento)
pub struct MycNode {
    pub coord: AxialCoord,
    pub amplitude: SPA, // Salud energética del nodo
    pub phase_s60: SPA, // Sincronización en base-60
}

/// Axial Diffusion Model (Red de Resonancia)
pub struct ADM {
    pub nodes: HashMap<AxialCoord, MycNode>,
    pub step_key: i32,
}

impl ADM {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            step_key: 17, // Salto Axiomático
        }
    }

    pub fn add_node(&mut self, q: i32, r: i32) {
        let coord = AxialCoord::new(q, r);
        let phase_raw = (self.nodes.len() as i32 * self.step_key) % 60;
        self.nodes.insert(
            coord,
            MycNode {
                coord,
                amplitude: SPA::one(),
                phase_s60: SPA::new(phase_raw as i64, 0, 0, 0, 0),
            },
        );
    }

    /// Ciclo de vida de la red (Propagación bio-inspirada)
    pub fn tick(&mut self) {
        let mut spikes = Vec::new();

        // 1. Detección de sobretensión armónica
        for (coord, node) in &mut self.nodes {
            if node.amplitude > SPA::new(1, 15, 0, 0, 0) { // Umbral de disparo
                // Dispersión hexagonal (S60 Pure)
                let energy_per_neighbor = node.amplitude / 12;
                for neighbor in coord.neighbors() {
                    spikes.push((neighbor, energy_per_neighbor));
                }
                node.amplitude = SPA::new(0, 30, 0, 0, 0); // Estado de recarga
            }
        }

        // 2. Absorción de energía en vecinos
        for (coord, energy) in spikes {
            if let Some(target) = self.nodes.get_mut(&coord) {
                target.amplitude = target.amplitude + energy;
            }
        }
    }
}

/// Controlador Geométrico Hexagonal (Pilar 2)
pub struct HexagonalController {
    pub size: i32,
    pub nodes_coords: Vec<AxialCoord>,
    pub phases_base60: Vec<SPA>,
    pub plasma_shield_active: bool,
    pub step_key: i32,
}

impl HexagonalController {
    pub fn new(size: i32) -> Self {
        let mut nodes_coords = Vec::new();
        for q in -size + 1..size {
            let r1 = std::cmp::max(-size + 1, -q - size + 1);
            let r2 = std::cmp::min(size - 1, -q + size - 1);
            for r in r1..=r2 {
                nodes_coords.push(AxialCoord::new(q, r));
            }
        }

        let n_nodes = nodes_coords.len();
        let step_key = 17;
        let mut phases_base60 = vec![SPA::zero(); n_nodes];
        for (n, phase) in phases_base60.iter_mut().enumerate() {
            let val = ((n as i32) * step_key) % 60;
            *phase = SPA::new(val as i64, 0, 0, 0, 0);
        }

        Self {
            size,
            nodes_coords,
            phases_base60,
            plasma_shield_active: true,
            step_key,
        }
    }

    pub fn get_neighbors(&self, coord: AxialCoord) -> Vec<AxialCoord> {
        coord.neighbors().into_iter()
            .filter(|nc| self.nodes_coords.contains(nc))
            .collect()
    }

    /// Estabilización de propagación de rifts (Rotación Base-60)
    pub fn control_rift_propagation(&mut self, center: AxialCoord) -> (i64, SPA, usize) {
        if !self.plasma_shield_active { return (-1, SPA::zero(), 0); }

        let neighbors = self.get_neighbors(center);
        let affected_count = neighbors.len();

        // Buscamos el índice de la fase central
        if let Some(idx) = self.nodes_coords.iter().position(|&c| c == center) {
            let center_deg = self.phases_base60[idx].to_degrees();
            for neighbor in neighbors {
                if let Some(n_idx) = self.nodes_coords.iter().position(|&c| c == neighbor) {
                    let new_val = (center_deg + (n_idx as i64 + 1) * 10) % 60;
                    self.phases_base60[n_idx] = SPA::new(new_val, 0, 0, 0, 0);
                }
            }
            (1, SPA::new(60, 0, 0, 0, 0), affected_count)
        } else {
            (0, SPA::zero(), 0)
        }
    }
}

/// Estado compartido del MyCNet (Integración Axum)
pub struct MyCNetState {
    pub adm: Mutex<ADM>,
}

impl MyCNetState {
    pub fn new() -> Arc<Self> {
        let mut adm = ADM::new();
        // Inicializar lattice base con anillo de 91 nodos (Ring-5 hexagonal)
        for q in -5i32..=5 {
            for r in -5i32..=5 {
                if (q + r).abs() <= 5 {
                    adm.add_node(q, r);
                }
            }
        }
        Arc::new(Self { adm: Mutex::new(adm) })
    }
}

/// Paquete de sincronización ADM-OGM
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct AdmogmPacket {
    pub amplitude_chunk: i64,    // Canal A (Energía/Datos en S60 raw)
    pub phase_hash: [u8; 32],    // Canal B (Firma/Fase invisible)
    pub lattice_node_idx: usize, // Coord hexagonal (Estado Difuso)
    pub origin_ts: Option<u64>,  // Registro de tiempo para RTT
}

/// Cliente P2P para sincronización de red externa
pub fn spawn_client(state: Arc<crate::AppState>, partner_url: String) {
    tokio::spawn(async move {
        loop {
            match tokio_tungstenite::connect_async(&partner_url).await {
                Ok((socket, _)) => {
                    let (mut write, mut read) = futures::StreamExt::split(socket);
                    info!("🔗 MyCNet established with {}", partner_url);
                    let mut rx = state.event_stream.subscribe();

                    loop {
                        tokio::select! {
                            msg = futures::StreamExt::next(&mut read) => {
                                if let Some(Ok(tokio_tungstenite::tungstenite::Message::Text(json))) = msg {
                                    if let Ok(packet) = serde_json::from_str::<AdmogmPacket>(&json) {
                                        sync_packet(&state, packet).await;
                                    }
                                } else { break; }
                            }
                            Ok(event) = rx.recv() => {
                                if event.event_type == "SYSTEM_HEARTBEAT" && event.severity == 1 { // Heartbeat
                                    if let Some(msg) = build_pulse(&state) {
                                        let _ = futures::SinkExt::send(&mut write, tokio_tungstenite::tungstenite::Message::Text(msg)).await;
                                    }
                                }
                            }
                        }
                    }
                }
                Err(e) => { warn!("❌ MyCNet reconnection error: {}", e); }
            }
            tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;
        }
    });
}

async fn sync_packet(state: &Arc<crate::AppState>, packet: AdmogmPacket) {
    let remote_tick = packet.amplitude_chunk as u64;
    let local_tick = state.global_tick.load(std::sync::atomic::Ordering::SeqCst);

    if remote_tick > local_tick {
        state.global_tick.store(remote_tick, std::sync::atomic::Ordering::SeqCst);
    }

    // Inyectar energía en el nodo ADM correspondiente
    let mut adm = state.mycnet_state.adm.lock().await;
    let q = i32::try_from(packet.lattice_node_idx % 11).unwrap_or(0) - 5;
    let r = i32::try_from(packet.lattice_node_idx / 11).unwrap_or(0) - 5;
    let target_coord = AxialCoord::new(q, r);
    if let Some(node) = adm.nodes.get_mut(&target_coord) {
        node.amplitude = node.amplitude + SPA::from_raw(packet.amplitude_chunk.abs() % SPA::SCALE_0);
    }
}

fn build_pulse(state: &Arc<crate::AppState>) -> Option<String> {
    use sha2::{Digest, Sha256};
    let time_chunk = state.global_tick.load(std::sync::atomic::Ordering::SeqCst) as i64;
    let mut hasher = Sha256::new();
    hasher.update(time_chunk.to_le_bytes());
    let phase_hash: [u8; 32] = hasher.finalize().into();

    let packet = AdmogmPacket {
        amplitude_chunk: time_chunk,
        phase_hash,
        lattice_node_idx: usize::try_from(time_chunk.abs() % 91).unwrap_or(0),
        origin_ts: None,
    };
    serde_json::to_string(&packet).ok()
}
