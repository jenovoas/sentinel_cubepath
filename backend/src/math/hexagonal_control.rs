//! # 💎 HEXAGONAL GEOMETRY BASE-60 — Pilar 2 de la Trinidad Sentinel 💎
//!
//! Control geométrico hexagonal del kernel en Base-60.
//! Implementa la red de nodos (Lattice), el Salto-17 (Axiomatic Key)
//! y la estabilización de rifts (rupturas de fase en la red).
//!
//! ## Protocolo Yatra
//! - Coordenadas axiales: SPA grados exactos — sin i32/i64 expuesto exterior.
//! - `SPA::new(q, 0, 0, 0, 0)` = q grados. `to_degrees()` recupera el entero sin pérdida.
//! - Desplazamientos de vecinos = `±SPA::one()` (aritmética S60 exacta).
//!
//! Fuente canónica: me-60os/src/hexagonal_control.rs

use crate::math::spa::SPA;
use serde::{Deserialize, Serialize};

/// Coordenadas axiales hexagonales expresadas en grados S60.
/// Derivadas de SPA — compatibles como clave de HashMap.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct HexCoord {
    pub q: SPA,
    pub r: SPA,
}

impl HexCoord {
    /// Construye desde enteros de grados S60.
    pub fn from_ints(q: i64, r: i64) -> Self {
        Self {
            q: SPA::new(q, 0, 0, 0, 0),
            r: SPA::new(r, 0, 0, 0, 0),
        }
    }

    /// Los 6 vecinos hexagonales en coordenadas axiales.
    /// Desplazamientos ±1 grado S60 — sin floats, sin series infinitas.
    pub fn neighbors(self) -> [HexCoord; 6] {
        let one = SPA::one();
        [
            HexCoord { q: self.q + one, r: self.r        },
            HexCoord { q: self.q + one, r: self.r - one  },
            HexCoord { q: self.q,       r: self.r - one  },
            HexCoord { q: self.q - one, r: self.r        },
            HexCoord { q: self.q - one, r: self.r + one  },
            HexCoord { q: self.q,       r: self.r + one  },
        ]
    }
}

/// Controlador Geométrico Hexagonal — Pilar 2 de la Trinidad Sentinel.
///
/// - Genera la red hexagonal completa de radio `size` con el Salto-17.
/// - Cada nodo tiene una fase S60 inicializada como `(n × 17) % 60` grados.
/// - `control_rift_propagation()` estabiliza rifts rotando las fases vecinas.
///
/// Fuente canónica: me-60os/src/hexagonal_control.rs
#[derive(Serialize, Deserialize)]
pub struct HexagonalController {
    pub size: SPA,
    /// Coordenadas de todos los nodos de la red hexagonal.
    pub nodes_coords: Vec<HexCoord>,
    /// Fase S60 actual de cada nodo (por índice, alineado con crystals[]).
    pub phases_base60: Vec<SPA>,
    /// Si es false: control_rift retorna VOID_COLLAPSE inmediatamente.
    pub plasma_shield_active: bool,
    /// Salto Axiomático = SPA(17) — clave de distribución de fases.
    pub step_key: SPA,
}

impl HexagonalController {
    /// Construye la red hexagonal de radio `size`.
    /// El número de nodos es `3*size^2 - 3*size + 1` (fórmula hexagonal exacta).
    pub fn new(size: i64) -> Self {
        let nodes_coords = Self::build_hex_lattice(size);
        let n_nodes = nodes_coords.len();
        let step_key = SPA::from_int(17);

        // Fases iniciales: (n × 17) % 60 grados — distribución soberana en Base-60
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

    /// Número total de nodos.
    pub fn n_nodes(&self) -> usize {
        self.nodes_coords.len()
    }

    /// Coordenada SPA de un nodo por índice.
    pub fn get_node_coord(&self, index: usize) -> Option<HexCoord> {
        self.nodes_coords.get(index).copied()
    }

    /// Fase S60 actual de un nodo por índice.
    pub fn get_node_phase(&self, index: usize) -> Option<SPA> {
        self.phases_base60.get(index).copied()
    }

    /// Estabiliza la propagación de un rift usando rotación Base-60.
    ///
    /// Para el nodo central `rift_center_idx`, calcula sus 6 vecinos hexagonales
    /// y ajusta sus fases rotándolas a partir de la fase del centro.
    ///
    /// Retorna:
    /// - `(SPA::one(),  SPA(60), affected)` → SEXAGESIMAL_STABILITY_LOCKED
    /// - `(SPA::from_int(-1), SPA::zero(), 0)` → VOID_COLLAPSE (plasma shield off)
    pub fn control_rift_propagation(&mut self, rift_center_idx: usize) -> (SPA, SPA, usize) {
        if !self.plasma_shield_active {
            return (SPA::from_int(-1), SPA::zero(), 0);
        }
        if rift_center_idx >= self.nodes_coords.len() {
            return (SPA::zero(), SPA::zero(), 0);
        }

        let neighbors = self.get_neighbors(rift_center_idx);
        let affected = neighbors.len();
        let center_deg = self.phases_base60[rift_center_idx].to_degrees();

        for (i, &n_idx) in neighbors.iter().enumerate() {
            let new_deg = (center_deg + (i as i64 + 1) * 10) % 60;
            self.phases_base60[n_idx] = SPA::new(new_deg, 0, 0, 0, 0);
        }

        (SPA::one(), SPA::new(60, 0, 0, 0, 0), affected)
    }

    /// Vecinos de un nodo por índice — devuelve `Vec<usize>` (interfaz canónica).
    pub fn get_neighbors(&self, node_idx: usize) -> Vec<usize> {
        let coord = self.nodes_coords[node_idx];
        coord.neighbors()
            .iter()
            .filter_map(|nc| self.nodes_coords.iter().position(|c| c == nc))
            .collect()
    }

    // --- Privado ---

    /// Genera la red hexagonal con coordenadas axiales (q, r) como SPA.
    fn build_hex_lattice(size: i64) -> Vec<HexCoord> {
        let mut nodes = Vec::new();
        for q in (-size + 1)..size {
            let r1 = std::cmp::max(-size + 1, -q - size + 1);
            let r2 = std::cmp::min(size - 1,  -q + size - 1);
            for r in r1..=r2 {
                nodes.push(HexCoord::from_ints(q, r));
            }
        }
        nodes
    }
}
