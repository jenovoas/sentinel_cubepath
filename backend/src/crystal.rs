//! # 💎 SovereignCrystal — Oscilador Piezoeléctrico S60
//!
//! Celda de memoria resonante basada en vibración Base-60.
//! Cada cristal mantiene amplitud, fase y entropía en aritmética S60 pura.
//! Portado desde quantum/sovereign_crystal.py (Protocolo Yatra — sin floats).

use crate::math::{S60, spa_math::S60Math};
use serde::Serialize;

/// Factor de amortiguación por ciclo: ~0.5/60 (pérdida pequeña)
const DAMPING_FACTOR: S60 = S60::new(0, 0, 30, 0, 0);

/// Frecuencia natural: Ratio Plimpton 322 Fila 12 — 4;47,6,39,59 aprox.
/// En raw S60: 62_159_999
const NATURAL_FREQ_RAW: i64 = 62_159_999;

/// Paso de tiempo por tick del oscilador: 1/60 en S60
const DT: S60 = S60::new(0, 1, 0, 0, 0);

/// Estado serializable para el endpoint de lattice
#[derive(Serialize, Clone)]
pub struct CrystalState {
    pub amplitude_raw: i64,
    pub phase_raw: i64,
    pub is_active: bool,
}

/// Oscilador piezoeléctrico virtual sintonizado a matemáticas Base-60.
/// Actúa como celda de memoria resonante con dinámica física real.
#[derive(Clone)]
pub struct SovereignCrystal {
    pub name: String,
    /// Amplitud de vibración (energía almacenada)
    pub amplitude: S60,
    /// Fase actual de la oscilación
    pub phase: S60,
    /// Frecuencia natural (derivada de Plimpton 322)
    natural_frequency: S60,
}

impl SovereignCrystal {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            amplitude: S60::zero(),
            phase: S60::zero(),
            natural_frequency: S60::from_raw(NATURAL_FREQ_RAW),
        }
    }

    pub fn with_frequency_raw(name: &str, freq_raw: i64) -> Self {
        Self {
            name: name.to_string(),
            amplitude: S60::zero(),
            phase: S60::zero(),
            natural_frequency: S60::from_raw(freq_raw),
        }
    }

    /// Inyecta un pulso de energía (excitación constructiva).
    pub fn transduce_pulse(&mut self, pressure: i64) {
        self.amplitude = self.amplitude + S60::from_raw(pressure);
    }

    /// Aplica degradación termodinámica (entropía natural).
    /// decay = amplitude * damping * dt
    pub fn apply_entropy(&mut self) {
        let decay = self.amplitude * DAMPING_FACTOR * DT;
        self.amplitude = self.amplitude - decay;
        // Ground state: si la amplitud cae a casi cero, resetear
        if self.amplitude.to_raw().abs() < S60::new(0, 0, 1, 0, 0).to_raw() {
            self.amplitude = S60::zero();
        }
    }

    /// Avanza un tick: actualiza fase, calcula señal de salida, aplica entropía.
    /// Retorna la señal de onda actual (amplitud * sin(fase)).
    pub fn oscillate(&mut self) -> S60 {
        // 1. Avanzar fase: theta += omega * dt
        let delta_phase = self.natural_frequency * DT;
        self.phase = self.phase + delta_phase;

        // Envolver fase en [0, 2π) para evitar overflow a largo plazo
        let two_pi = S60Math::TWO_PI;
        if self.phase.to_raw() > two_pi.to_raw() {
            self.phase = self.phase - two_pi;
        }

        // 2. Señal de salida: amplitude * sin(phase)
        let signal = self.amplitude * S60Math::sin(self.phase);

        // 3. Aplicar entropía
        self.apply_entropy();

        signal
    }

    /// Propaga energía internamente (acoplamiento fase ↔ amplitud).
    pub fn propagate(&mut self) -> S60 {
        let delta_phase = self.natural_frequency * S60::one();
        self.phase = self.phase + delta_phase;
        self.amplitude * S60Math::sin(self.phase)
    }

    pub fn get_amplitude(&self) -> S60 { self.amplitude }
    pub fn get_phase(&self) -> S60 { self.phase }

    pub fn state(&self) -> CrystalState {
        CrystalState {
            amplitude_raw: self.amplitude.to_raw(),
            phase_raw: self.phase.to_raw(),
            is_active: self.amplitude.to_raw() > 0,
        }
    }
}

/// Red de cristales acoplados: transferencia de energía por simpatía vibratoria.
/// Portado desde quantum/crystal_lattice.py (CrystalLattice).
pub struct CrystalLattice {
    pub crystals: Vec<SovereignCrystal>,
    /// Factor de acoplamiento entre nodos adyacentes (10/60 ≈ 0.1667)
    pub coupling_factor: S60,
}

impl CrystalLattice {
    pub fn new(size: usize) -> Self {
        let coupling = S60::new(0, 10, 0, 0, 0); // 10/60
        Self {
            crystals: (0..size).map(|i| SovereignCrystal::new(&format!("Node-{}", i))).collect(),
            coupling_factor: coupling,
        }
    }

    pub fn with_coupling(size: usize, coupling_raw: i64) -> Self {
        Self {
            crystals: (0..size).map(|i| SovereignCrystal::new(&format!("Node-{}", i))).collect(),
            coupling_factor: S60::from_raw(coupling_raw),
        }
    }

    /// Inyecta presión en un nodo específico.
    pub fn inject(&mut self, index: usize, pressure: i64) {
        if let Some(c) = self.crystals.get_mut(index) {
            c.transduce_pulse(pressure);
        }
    }

    /// Ejecuta un tick: transfiere energía entre nodos adyacentes y oscila cada cristal.
    pub fn step(&mut self) {
        let n = self.crystals.len();
        if n < 2 {
            if let Some(c) = self.crystals.get_mut(0) { c.oscillate(); }
            return;
        }

        // Calcular transferencias sin mutar (preservar simetría del paso)
        let mut transfers: Vec<S60> = vec![S60::zero(); n];
        for i in 0..n - 1 {
            let a1 = self.crystals[i].get_amplitude();
            let a2 = self.crystals[i + 1].get_amplitude();
            let diff = a1 - a2;
            let flow = diff * self.coupling_factor;
            transfers[i] = transfers[i] - flow;
            transfers[i + 1] = transfers[i + 1] + flow;
        }

        // Aplicar transferencias y oscilar
        for (i, crystal) in self.crystals.iter_mut().enumerate() {
            crystal.amplitude = crystal.amplitude + transfers[i];
            crystal.oscillate();
        }
    }

    /// Energía total del sistema.
    pub fn total_energy(&self) -> S60 {
        self.crystals.iter().fold(S60::zero(), |acc, c| acc + c.get_amplitude())
    }

    /// Amplitudes raw de todos los nodos.
    pub fn get_amplitudes(&self) -> Vec<i64> {
        self.crystals.iter().map(|c| c.get_amplitude().to_raw()).collect()
    }

    /// Fases raw de todos los nodos.
    pub fn get_phases(&self) -> Vec<i64> {
        self.crystals.iter().map(|c| c.get_phase().to_raw()).collect()
    }

    /// Estado serializable de todos los nodos.
    pub fn get_states(&self) -> Vec<CrystalState> {
        self.crystals.iter().map(|c| c.state()).collect()
    }

    /// Coherencia global: promedio de amplitudes activas.
    pub fn global_coherence(&self) -> S60 {
        let active: Vec<_> = self.crystals.iter().filter(|c| c.get_amplitude().to_raw() > 0).collect();
        if active.is_empty() { return S60::zero(); }
        let sum = active.iter().fold(S60::zero(), |acc, c| acc + c.get_amplitude());
        S60::from_raw(sum.to_raw() / active.len() as i64)
    }
}
