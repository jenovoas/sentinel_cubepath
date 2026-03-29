use crate::math::isochronous_oscillator::IsochronousOscillator;
use crate::math::spa::SPA;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Resonant Matrix S60 - 2D Grid Topology (Engineered Revision)
#[derive(Serialize, Deserialize)]
pub struct ResonantMatrix {
    pub crystals: Vec<IsochronousOscillator>,
    pub metadata_map: Vec<Option<String>>,
    pub context_data: HashMap<usize, String>,
    pub coupling_factor: SPA,
    pub dt: SPA,
    pub width: usize,
    pub height: usize,
    /// Mercury Damping Constant (from VIMANA_MASTER_V1)
    pub damping: SPA, 
}

impl ResonantMatrix {
    pub fn new(size: usize) -> Self {
        let width = (size as f64).sqrt() as usize;
        let height = width;
        let crystals = (0..size)
            .map(|i| IsochronousOscillator::new(&format!("Node-{}", i)))
            .collect();

        let mut matrix = ResonantMatrix {
            crystals,
            metadata_map: vec![None; size],
            context_data: HashMap::new(),
            coupling_factor: SPA::new(0, 10, 0, 0, 0), // 10/60
            dt: SPA::new(0, 0, 1, 0, 0),
            width,
            height,
            damping: SPA::new(0, 3, 14, 8, 0), // MERCURY_DAMPING: 3;14,8
        };

        // EXCITACIÓN INICIAL (SEED ENERGY) - Para evitar estado inerte en t=0
        // Inyectamos energía en el centro de la matriz 32x32 (índice 528 aprox)
        let center = 16 * 32 + 16;
        if center < size {
            matrix.crystals[center].amplitude = SPA::from_raw(500 * 12_960_000 / 100); // 5.00 Degrees
        }

        matrix
    }

    pub fn size(&self) -> usize {
        self.crystals.len()
    }

    /// Implementación de acoplamiento 2D (4-vecinos) con amortiguamiento de Mercurio.
    pub fn step(&mut self) {
        let size = self.crystals.len();
        let mut transfers: Vec<SPA> = vec![SPA::zero(); size];

        for y in 0..self.height {
            for x in 0..self.width {
                let idx = y * self.width + x;
                let amp_curr = self.crystals[idx].amplitude;

                // Vecinos: Derecha y Abajo (para evitar doble conteo de conexiones)
                let neighbors = [
                    (x + 1, y), // Derecha
                    (x, y + 1), // Abajo
                ];

                for &(nx, ny) in neighbors.iter() {
                    if nx < self.width && ny < self.height {
                        let n_idx = ny * self.width + nx;
                        let amp_neighbor = self.crystals[n_idx].amplitude;
                        
                        let diff = amp_curr - amp_neighbor;
                        let flow = diff * self.coupling_factor;

                        transfers[idx] = transfers[idx] - flow;
                        transfers[n_idx] = transfers[n_idx] + flow;
                    }
                }
            }
        }

        // Aplicar transferencias, amortiguamiento y oscilación
        for i in 0..size {
            // Aplicar flujo de energía
            self.crystals[i].amplitude = self.crystals[i].amplitude + transfers[i];
            
            // Aplicar MERCURY_DAMPING (amortiguamiento por fricción sexagesimal)
            if self.crystals[i].amplitude.to_raw() > 0 {
                let loss = (self.crystals[i].amplitude * self.damping) / SPA::new(60, 0, 0, 0, 0);
                self.crystals[i].amplitude = self.crystals[i].amplitude - loss;
            }

            self.crystals[i].oscillate(self.dt);

            // Umbral de limpieza de metadata
            if self.crystals[i].amplitude.to_raw() < 200 {
                self.metadata_map[i] = None;
            }
        }
    }

    pub fn inject(&mut self, index: usize, pressure_raw: i64) {
        if index < self.crystals.len() {
            self.crystals[index].transduce_pulse(pressure_raw);
        }
    }

    pub fn global_coherence(&self) -> i64 {
        if self.crystals.is_empty() { return 0; }
        let total = self.crystals.iter().fold(0i64, |acc, c| acc + c.amplitude.to_raw());
        total / self.crystals.len() as i64
    }
}
