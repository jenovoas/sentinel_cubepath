//! # 🌐 Resonant Memory — Crystal Lattice Matrix (RMM)
//!
//! Memoria distribuida basada en cristales resonantes acoplados.
//! Cada slot es un SovereignCrystal con su propio estado de fase y amplitud.
//! Reemplaza el stub Vec<Vec<u64>> por una red de cristales con dinámica real.

use crate::crystal::CrystalLattice;
use crate::math::S60;

/// Wrapper de alto nivel: expone la misma API pública que antes
/// pero internamente usa CrystalLattice con transferencia real de energía.
pub struct ResonantMemory {
    pub lattice: CrystalLattice,
}

impl ResonantMemory {
    pub fn new(size: usize) -> Self {
        Self {
            lattice: CrystalLattice::new(size),
        }
    }

    /// Inyecta una señal entre dos nodos (interferencia constructiva).
    pub fn resonate(&mut self, source: usize, target: usize, signal: u64) {
        let pressure = (signal as i64).min(S60::SCALE_0);
        self.lattice.inject(source, pressure);
        if target != source {
            self.lattice.inject(target, pressure / 4);
        }
        self.lattice.step();
    }

    /// Coherencia global del lattice (promedio de amplitudes activas).
    pub fn get_coherence(&self) -> u64 {
        self.lattice.global_coherence().to_raw().max(0) as u64
    }

    /// Ejecuta un tick de evolución del lattice.
    pub fn tick(&mut self) {
        self.lattice.step();
    }

    /// Energía total del sistema en S60.
    pub fn total_energy(&self) -> S60 {
        self.lattice.total_energy()
    }
}

impl Default for ResonantMemory {
    fn default() -> Self {
        Self::new(1024)
    }
}
