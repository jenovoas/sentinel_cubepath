//! Resonant Memory - Resonant Memory Matrix (RMM)
//! Correlación de eventos basada en la métrica Plimpton 322 (Base-60).

use crate::math::SPA;

/// Matriz de Resonancia: Nodos x Nodos de la red Sentinel.
pub struct ResonantMatrix {
    matrix: Vec<Vec<u64>>, // Valores SPA raw (Base-60)
    size: usize,
}

impl ResonantMatrix {
    pub fn new(size: usize) -> Self {
        Self {
            matrix: vec![vec![0; size]; size],
            size,
        }
    }

    /// Inyecta una resonancia entre dos nodos.
    /// Si los nodos vibran en ratios de Plimpton 322, la resonancia se amplifica.
    pub fn inject_resonance(&mut self, node_a: usize, node_b: usize, value: u64) {
        if node_a < self.size && node_b < self.size {
            // Actualización por interferencia constructiva (SPA Addition)
            self.matrix[node_a][node_b] = self.matrix[node_a][node_b].wrapping_add(value);
            self.matrix[node_b][node_a] = self.matrix[node_a][node_b]; // Simetría
        }
    }

    /// Obtiene la "Coherencia Global" de la matriz.
    /// Retorna un valor SPA que representa el alineamiento de fase del sistema.
    pub fn get_global_coherence(&self) -> u64 {
        let mut sum = 0u64;
        let mut count = 0u64;
        for row in &self.matrix {
            for &val in row {
                if val > 0 {
                    sum = sum.wrapping_add(val);
                    count += 1;
                }
            }
        }
        if count == 0 { return 0; }
        sum / count
    }

    /// Verifica si un par de nodos están en "Resonancia Plimpton".
    pub fn is_resonant(&self, node_a: usize, node_b: usize) -> bool {
        if node_a >= self.size || node_b >= self.size { return false; }
        
        let val = self.matrix[node_a][node_b];
        // Ejemplo: Si el valor es múltiplo de la constante maestra 1.0 (en S60)
        // O si cumple con los ratios de la tabla Plimpton 322.
        SPA::is_harmonic_ratio(SPA::from_raw(val as i64))
    }
}

pub struct ResonantMemory {
    rmm: ResonantMatrix,
}

impl ResonantMemory {
    pub fn new(size: usize) -> Self {
        Self {
            rmm: ResonantMatrix::new(size),
        }
    }

    pub fn resonate(&mut self, source: usize, target: usize, signal: u64) {
        self.rmm.inject_resonance(source, target, signal);
    }

    pub fn get_coherence(&self) -> u64 {
        self.rmm.get_global_coherence()
    }
}
