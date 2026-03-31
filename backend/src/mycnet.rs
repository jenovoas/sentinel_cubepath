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

/// Coordenadas Axiales (Hexagonal Grid) — expresadas en grados S60.
/// SPA::new(q, 0, 0, 0, 0) = q grados exactos. Sin decimales infinitos.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct AxialCoord {
    pub q: SPA,
    pub r: SPA,
}

impl AxialCoord {
    /// Construye una coordenada axial desde enteros de grados S60.
    pub fn new(q: i64, r: i64) -> Self {
        Self {
            q: SPA::new(q, 0, 0, 0, 0),
            r: SPA::new(r, 0, 0, 0, 0),
        }
    }

    /// Los 6 vecinos hexagonales en coordenadas axiales (q, r).
    /// Los desplazamientos son ±1 grado — aritmética SPA exacta.
    pub fn neighbors(&self) -> [AxialCoord; 6] {
        let one = SPA::one();
        [
            AxialCoord { q: self.q + one, r: self.r },
            AxialCoord { q: self.q + one, r: self.r - one },
            AxialCoord { q: self.q,       r: self.r - one },
            AxialCoord { q: self.q - one, r: self.r },
            AxialCoord { q: self.q - one, r: self.r + one },
            AxialCoord { q: self.q,       r: self.r + one },
        ]
    }
}

/// Nodo Micelial (Unidad de Procesamiento)
pub struct MycNode {
    pub coord: AxialCoord,
    pub amplitude: SPA, // Salud energética del nodo
    pub phase_s60: SPA, // Sincronización en grados S60 (Salto-17)
}

/// Axial Diffusion Model (Red de Resonancia Micelial)
pub struct ADM {
    pub nodes: HashMap<AxialCoord, MycNode>,
    /// Salto Axiomático = 17 — clave de distribución de fases en la red
    pub step_key: SPA,
}

impl ADM {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            step_key: SPA::from_int(17),
        }
    }

    pub fn add_node(&mut self, q: i64, r: i64) {
        let coord = AxialCoord::new(q, r);
        // Fase inicial: (n * 17) % 60 grados — distribución hexagonal soberana
        let n = self.nodes.len() as i64;
        let phase_deg = (n * self.step_key.to_degrees()) % 60;
        self.nodes.insert(
            coord,
            MycNode {
                coord,
                amplitude: SPA::one(),
                phase_s60: SPA::new(phase_deg, 0, 0, 0, 0),
            },
        );
    }

    /// Ciclo de vida de la red (Propagación bio-inspirada).
    /// DEBE llamarse en cada tick del loop isocrono.
    pub fn tick(&mut self) {
        let mut spikes: Vec<(AxialCoord, SPA)> = Vec::new();

        // 1. Detección de sobretensión armónica (umbral: SPA(1;15;0;0;0))
        for (coord, node) in &mut self.nodes {
            if node.amplitude > SPA::new(1, 15, 0, 0, 0) {
                // Dispersión hexagonal: energía / 12 vecinos posibles
                let energy_per_neighbor = node.amplitude
                    .div_safe(SPA::from_int(12))
                    .unwrap_or(SPA::zero());
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

/// Controlador Geométrico Hexagonal — Pilar 2 de la Trinidad Sentinel.
///
/// Implementa la red de nodos hexagonales (Lattice), el Salto-17
/// (distribución de fases soberana) y la estabilización de rifts.
///
/// Fuente canónica: me-60os/src/hexagonal_control.rs
/// Coordenadas SPA (grados S60) — sin i32/i64 expuesto al exterior.
pub struct HexagonalController {
    pub size: SPA,
    pub nodes_coords: Vec<AxialCoord>,
    pub phases_base60: Vec<SPA>,
    pub plasma_shield_active: bool,
    pub step_key: SPA,
}

impl HexagonalController {
    pub fn new(size: i64) -> Self {
        let nodes_coords = Self::build_hex_lattice(size);
        let n_nodes = nodes_coords.len();
        let step_key = SPA::from_int(17); // Salto Axiomático

        // Fases: (n * 17) % 60 grados — distribución exacta en Base-60
        let mut phases_base60 = vec![SPA::zero(); n_nodes];
        for (n, phase) in phases_base60.iter_mut().enumerate() {
            let deg = ((n as i64) * 17) % 60;
            *phase = SPA::new(deg, 0, 0, 0, 0);
        }

        Self {
            size: SPA::from_int(size),
            nodes_coords,
            phases_base60,
            plasma_shield_active: true,
            step_key,
        }
    }

    pub fn get_n_nodes(&self) -> usize {
        self.nodes_coords.len()
    }

    pub fn get_plasma_shield_active(&self) -> bool {
        self.plasma_shield_active
    }

    /// Retorna la coordenada SPA de un nodo dado su índice.
    pub fn get_node_coord(&self, index: usize) -> Option<AxialCoord> {
        self.nodes_coords.get(index).copied()
    }

    /// Retorna la fase S60 actual de un nodo dado su índice.
    pub fn get_node_phase(&self, index: usize) -> Option<SPA> {
        self.phases_base60.get(index).copied()
    }

    /// Estabiliza la propagación de un rift usando rotación Base-60.
    /// Retorna (status_code, coherence_score, affected_count).
    /// status SPA(1) = SEXAGESIMAL_STABILITY_LOCKED
    /// status SPA(-1) = VOID_COLLAPSE (plasma shield inactivo)
    pub fn control_rift_propagation(&mut self, rift_center_idx: usize) -> (SPA, SPA, usize) {
        if !self.plasma_shield_active {
            return (SPA::from_int(-1), SPA::zero(), 0);
        }
        if rift_center_idx >= self.nodes_coords.len() {
            return (SPA::zero(), SPA::zero(), 0);
        }

        let neighbors = self.get_neighbors(rift_center_idx);
        let affected_count = neighbors.len();
        let center_deg = self.phases_base60[rift_center_idx].to_degrees();

        for (i, &neighbor_idx) in neighbors.iter().enumerate() {
            let new_deg = (center_deg + (i as i64 + 1) * 10) % 60;
            self.phases_base60[neighbor_idx] = SPA::new(new_deg, 0, 0, 0, 0);
        }

        (SPA::one(), SPA::new(60, 0, 0, 0, 0), affected_count)
    }

    /// Vecinos de un nodo por índice — devuelve Vec<usize> (interfaz canónica).
    pub fn get_neighbors(&self, node_idx: usize) -> Vec<usize> {
        let coord = &self.nodes_coords[node_idx];
        coord.neighbors()
            .iter()
            .filter_map(|nc| self.nodes_coords.iter().position(|c| c == nc))
            .collect()
    }

    // --- Privado ---

    /// Genera la red hexagonal axial con coordenadas SPA.
    fn build_hex_lattice(size: i64) -> Vec<AxialCoord> {
        let mut nodes = Vec::new();
        for q in (-size + 1)..size {
            let r1 = std::cmp::max(-size + 1, -q - size + 1);
            let r2 = std::cmp::min(size - 1, -q + size - 1);
            for r in r1..=r2 {
                nodes.push(AxialCoord::new(q, r));
            }
        }
        nodes
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
        for q in -5i64..=5 {
            for r in -5i64..=5 {
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
                                if let Some(Ok(tokio_tungstenite::tungstenite::Message::Text(payload))) = msg {
                                    let current_tick = state.global_tick.load(std::sync::atomic::Ordering::Relaxed);
                                    // Descifrado Dinámico basado en fase S60
                                    if let Some(json) = s60_dynamic_decrypt(&payload, current_tick) {
                                        if let Ok(packet) = serde_json::from_str::<AdmogmPacket>(&json) {
                                            sync_packet(&state, packet).await;
                                        }
                                    } else {
                                        // Legacy fallback o paquete inválido
                                        if let Ok(packet) = serde_json::from_str::<AdmogmPacket>(&payload) {
                                            sync_packet(&state, packet).await;
                                        }
                                    }
                                } else { break; }
                            }
                            Ok(event) = rx.recv() => {
                                if event.event_type == "SYSTEM_HEARTBEAT" && event.severity == 1 {
                                    // Sincronizar ADM con el cristal de tiempo central (Salto-17)
                                    // El timer interno del MyCNet existe solo para mantener vivas
                                    // las señales de red, pero el tick del ADM lo dispara el cristal.
                                    state.mycnet_state.adm.lock().await.tick();

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
    let q = (packet.lattice_node_idx % 11) as i64 - 5;
    let r = (packet.lattice_node_idx / 11) as i64 - 5;
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
    if let Ok(json_str) = serde_json::to_string(&packet) {
        // Cifrado Dinámico basado en fase S60 del cristal de tiempo
        let current_tick = state.global_tick.load(std::sync::atomic::Ordering::Relaxed);
        Some(s60_dynamic_encrypt(&json_str, current_tick))
    } else {
        None
    }
}

/// 🛡️ Cifrado Dinámico Yatra-Compliant 
/// Usa el TimeCrystal tick (modulo 60) combinado con Salto-17 para mutar la llave continuamente
pub fn s60_dynamic_encrypt(json_str: &str, phase_tick: u64) -> String {
    let mut encrypted = Vec::with_capacity(json_str.len());
    let base_shift = (phase_tick % 60) as u8;
    for (i, &byte) in json_str.as_bytes().iter().enumerate() {
        // Cifrado Dinámico: Fase S60 rotativa mezclada con Salto Axiomático (17)
        let key = base_shift.wrapping_add((i % 17) as u8);
        encrypted.push(byte ^ key);
    }
    hex::encode(&encrypted)
}

/// 🛡️ Descifrado S60
pub fn s60_dynamic_decrypt(encoded_hex: &str, phase_tick: u64) -> Option<String> {
    let data = hex::decode(encoded_hex).ok()?;
    let mut decrypted = Vec::with_capacity(data.len());
    let base_shift = (phase_tick % 60) as u8;
    for (i, &byte) in data.iter().enumerate() {
        let key = base_shift.wrapping_add((i % 17) as u8);
        decrypted.push(byte ^ key);
    }
    String::from_utf8(decrypted).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_s60_dynamic_cipher() {
        let payload = r#"{"amplitude_chunk":100,"phase_hash":[0,0,0,0],"lattice_node_idx":5,"origin_ts":null}"#;
        
        // Cifrado con tick 123 (múltiplo de la fase, dinámico)
        let tick = 123;
        let encrypted = s60_dynamic_encrypt(payload, tick);
        assert_ne!(payload, encrypted); // No debe ser igual al payload en claro
        
        // Descifrado con mismo tick
        let decrypted = s60_dynamic_decrypt(&encrypted, tick).unwrap();
        assert_eq!(payload, decrypted); // Debe coincidir
        
        // Descifrado con tick distinto falla u obtiene basura
        let decrypted_bad = s60_dynamic_decrypt(&encrypted, tick + 1).unwrap();
        assert_ne!(payload, decrypted_bad);
    }
}
