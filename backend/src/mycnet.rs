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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct AxialCoord {
    pub q: i32,
    pub r: i32,
}

impl AxialCoord {
    pub fn new(q: i32, r: i32) -> Self {
        Self { q, r }
    }

    /// Obtiene los 6 vecinos hexagonales
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

pub struct MycNode {
    pub coord: AxialCoord,
    pub amplitude: SPA, // Salud del nodo (Latencia/Carga)
    pub phase: SPA,     // Sincronización con el TimeCrystal
    pub signals: Vec<SPA>,
}

pub struct ADM {
    pub nodes: HashMap<AxialCoord, MycNode>,
    pub world_energy: SPA,
}

impl ADM {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            world_energy: SPA::zero(),
        }
    }

    /// Agrega un nodo a la lattice
    pub fn add_node(&mut self, q: i32, r: i32) {
        let coord = AxialCoord::new(q, r);
        self.nodes.insert(
            coord,
            MycNode {
                coord,
                amplitude: SPA::new(1, 0, 0, 0, 0), // Default saludable
                phase: SPA::zero(),
                signals: Vec::new(),
            },
        );
    }

    /// Propagación de señales (Crecimiento de Hifas)
    pub fn tick(&mut self, _dt: SPA) {
        let mut spikes = Vec::new();

        // 1. Percibir señales internas
        for (coord, node) in &mut self.nodes {
            if node.amplitude > SPA::new(1, 40, 0, 0, 0) {
                // Umbral de firing (reducido para mayor estabilidad)
                // Distribuimos la energía: cada vecino recibe una porción que sumada no exceda el total
                let spike_strength = node.amplitude / 12; // 6 vecinos * 2 = Factor de disipación
                for neighbor in coord.neighbors() {
                    spikes.push((neighbor, spike_strength));
                }
                node.amplitude = SPA::new(0, 20, 0, 0, 0); // Estado refractario (Hielo)
            }
        }

        // 2. Actuar (Distribuir energía)
        for (coord, strength) in spikes {
            if let Some(target) = self.nodes.get_mut(&coord) {
                target.amplitude = target.amplitude + strength;
            }
        }

        // 3. Normalizar energía global
        // TODO: Enlazar con eBPF para métricas reales
    }
}

impl Default for ADM {
    fn default() -> Self {
        Self::new()
    }
}

// =============================================================================
// HEXAGONAL CONTROLLER
// =============================================================================
// # HEXAGONAL GEOMETRY BASE-60
//
// Pilar 2 de la Trinidad Sentinel: Control Geométrico Hexagonal en Base-60.
// Implementa la red de nodos (Lattice), el "Salto 17" (Axiomatic Key)
// y la estabilización de "rifts" (rupturas de red).

#[cfg(feature = "extension-module")]
use pyo3::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct HexNode {
    pub q: i64,
    pub r: i64,
}

#[cfg_attr(feature = "extension-module", pyclass(module = "me60os_core"))]
pub struct HexagonalController {
    pub size: i64,
    // (q, r) tuples
    nodes_coords: Vec<(i64, i64)>,
    pub n_nodes: usize,
    pub base60_units: i64,
    pub step_key: i64,
    pub phases_base60: Vec<SPA>,
    pub plasma_shield_active: bool,
}

#[cfg(feature = "extension-module")]
#[pymethods]
impl HexagonalController {
    #[new]
    pub fn new_pyo3(size: i64) -> Self {
        HexagonalController::new(size)
    }

    #[getter]
    pub fn get_n_nodes(&self) -> usize {
        self.n_nodes
    }

    #[getter]
    pub fn get_plasma_shield_active(&self) -> bool {
        self.plasma_shield_active
    }

    /// Retorna la coordenada de un nodo dado su índice
    pub fn get_node_coord(&self, index: usize) -> pyo3::PyResult<(i64, i64)> {
        if index < self.n_nodes {
            Ok(self.nodes_coords[index])
        } else {
            Err(pyo3::exceptions::PyIndexError::new_err("Invalid node index"))
        }
    }

    /// Retorna la fase actual de un nodo
    pub fn get_node_phase(&self, index: usize) -> pyo3::PyResult<SPA> {
        if index < self.n_nodes {
            Ok(self.phases_base60[index])
        } else {
            Err(pyo3::exceptions::PyIndexError::new_err("Invalid node index"))
        }
    }

    /// Estabiliza la propagación de un rift usando rotación Base-60.
    /// Retorna (status_code, coherence_score_SPA, affected_count)
    pub fn control_rift_propagation(&mut self, rift_center_idx: usize) -> pyo3::PyResult<(i64, SPA, usize)> {
        if !self.plasma_shield_active {
            // Error Code: -1 (VOID_COLLAPSE)
            return Ok((-1, SPA::zero(), 0));
        }

        if rift_center_idx >= self.n_nodes {
            return Err(pyo3::exceptions::PyIndexError::new_err("Invalid rift center index"));
        }

        let neighbors = self.get_neighbors(rift_center_idx);
        let affected_count = neighbors.len();

        let center_deg = self.phases_base60[rift_center_idx].to_degrees();

        for (i, neighbor_idx) in neighbors.iter().enumerate() {
            let new_val = (center_deg + (i as i64 + 1) * 10) % 60;
            self.phases_base60[*neighbor_idx] = SPA::new(new_val, 0, 0, 0, 0);
        }

        // Status 1: SEXAGESIMAL_STABILITY_LOCKED, Coherence: 60
        Ok((1, SPA::new(60, 0, 0, 0, 0), affected_count))
    }
}

impl HexagonalController {
    pub fn new(size: i64) -> Self {
        let nodes_coords = Self::build_hex_lattice(size);
        let n_nodes = nodes_coords.len();
        let step_key = 17;

        // Inicializar fases
        let mut phases_base60 = vec![SPA::zero(); n_nodes];
        for (n, phase) in phases_base60.iter_mut().enumerate() {
            let val = ((n as i64) * step_key) % 60;
            *phase = SPA::new(val, 0, 0, 0, 0);
        }

        Self {
            size,
            nodes_coords,
            n_nodes,
            base60_units: 60,
            step_key,
            phases_base60,
            plasma_shield_active: true,
        }
    }

    // Genera red hexagonal con coordenadas axiales (q, r)
    fn build_hex_lattice(size: i64) -> Vec<(i64, i64)> {
        let mut nodes = Vec::new();
        for q in -size + 1..size {
            let r1 = std::cmp::max(-size + 1, -q - size + 1);
            let r2 = std::cmp::min(size - 1, -q + size - 1);
            for r in r1..r2 + 1 {
                nodes.push((q, r));
            }
        }
        nodes
    }

    // Calcula los índices de los 6 vecinos en la red hexagonal
    pub fn get_neighbors(&self, node_idx: usize) -> Vec<usize> {
        let (q, r) = self.nodes_coords[node_idx];
        let neighbor_coords = [
            (q + 1, r), (q + 1, r - 1), (q, r - 1),
            (q - 1, r), (q - 1, r + 1), (q, r + 1)
        ];

        let mut indices = Vec::new();
        for nc in &neighbor_coords {
            if let Some(pos) = self.nodes_coords.iter().position(|&c| c == *nc) {
                indices.push(pos);
            }
        }
        indices
    }
}

// =============================================================================
// MYCNET STATE — Wrapper Arc<Mutex<ADM>> para integración con AppState/Axum
// =============================================================================

/// Paquete de sincronización ADM-OGM (P2P mesh tick)
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct AdmogmPacket {
    pub amplitude_chunk: i64,    // Canal A (Energía/Datos en S60 raw)
    pub phase_hash: [u8; 32],    // Canal B (Firma/Fase invisible)
    pub lattice_node_idx: usize, // Coord hexagonal (Estado Difuso)
    pub origin_ts: Option<u64>,  // Registro de tiempo para RTT
}

/// Estado compartido del MyCNet para el servidor Axum
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

/// Cliente P2P: mantiene conexión WebSocket saliente hacia un nodo par
pub fn spawn_client(state: Arc<crate::AppState>, partner_url: String) {
    tokio::spawn(async move {
        loop {
            info!("🌱 Intentando brote ADM hacia: {}", partner_url);
            match tokio_tungstenite::connect_async(&partner_url).await {
                Ok((socket, _)) => {
                    let (mut write, mut read) = futures::StreamExt::split(socket);
                    info!("🔗 MyCNet ADM-OGM Outgoing Hub established with {}", partner_url);
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
                                if event.event_type == 8 && event.severity == 1 {
                                    if let Some(msg) = build_pulse(&state) {
                                        if futures::SinkExt::send(&mut write, tokio_tungstenite::tungstenite::Message::Text(msg)).await.is_err() { break; }
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

async fn sync_packet(state: &Arc<crate::AppState>, packet: AdmogmPacket) {
    let remote_tick = packet.amplitude_chunk as u64;
    let local_tick = state.global_tick.load(std::sync::atomic::Ordering::SeqCst);

    if remote_tick > local_tick {
        state.global_tick.store(remote_tick, std::sync::atomic::Ordering::SeqCst);
        info!("⏳ ADM Clock Resynced: Advanced to T={}", remote_tick);
    }

    if let Some(ots) = packet.origin_ts {
        let now = u64::try_from(
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ).unwrap_or(u64::MAX);
        if now > ots {
            let rtt_raw = i64::try_from(now - ots).unwrap_or(i64::MAX);
            let rtt_s60 = SPA::from_raw(rtt_raw);
            let rtt_ms = rtt_s60.div_safe(SPA::from_int(1_000_000)).unwrap_or(SPA::zero());
            info!("⚡ ADM TQ (Latency): {} ms (S60)", rtt_ms);
        }
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
    hasher.update(b"S60_RESONANCE_ADM");
    let phase_hash: [u8; 32] = hasher.finalize().into();

    let packet = AdmogmPacket {
        amplitude_chunk: time_chunk,
        phase_hash,
        lattice_node_idx: usize::try_from(time_chunk.abs() % 91).unwrap_or(0),
        origin_ts: Some(u64::try_from(
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ).unwrap_or(u64::MAX)),
    };
    serde_json::to_string(&packet).ok()
}
