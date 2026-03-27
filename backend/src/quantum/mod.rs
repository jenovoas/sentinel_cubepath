//! # 🌌 QUANTUM MODULES - SENTINEL CORTEX 🛡️
//!
//! BioResonator & PortalDetector (S60) basado en el estándar de Resonancia Bio-Centro.

pub mod semantic_router;
pub mod semantic_shell;

use crate::math::{S60, S60Math};
use std::time::Instant;

pub struct BioResonator {
    pub coherence: S60,
    decay_factor: S60,
    pulse_gain: S60,
    threshold_portal: S60,
    dead_man_threshold: u64, // ms
    last_pulse: Instant,
}

impl BioResonator {
    pub fn new() -> Self {
        Self {
            coherence: S60::zero(),
            decay_factor: S60::from_raw(18014),
            pulse_gain: S60::from_raw(1079568),
            threshold_portal: S60::from_raw(11664000), // 0.9
            dead_man_threshold: 30000,
            last_pulse: Instant::now(),
        }
    }

    pub fn inject_bio_pulse(&mut self) {
        self.coherence = self.coherence + self.pulse_gain;
        if self.coherence.to_raw() > S60::one().to_raw() {
            self.coherence = S60::one();
        }
        self.last_pulse = Instant::now();
    }

    pub fn tick_entropy(&mut self) {
        if self.coherence.to_raw() > self.decay_factor.to_raw() {
            self.coherence = self.coherence - self.decay_factor;
        } else {
            self.coherence = S60::zero();
        }
    }

    pub fn is_pilot_present(&self) -> bool {
        self.last_pulse.elapsed().as_millis() < self.dead_man_threshold as u128
    }

    pub fn get_coherence_raw(&self) -> i64 {
        self.coherence.to_raw()
    }
}

pub struct PortalDetector {
    /// Periodo Bio: 17s
    period_bio: S60,
    /// Periodo Cristal (Oscilador de tiempo): 4.25s
    period_crystal: S60,
    /// Periodo Venus: 16.18s
    period_venus: S60,
    threshold: S60,
}

impl PortalDetector {
    pub fn new() -> Self {
        Self {
            // Periodos sincronizados con la constante de fase
            period_bio: S60::from_int(17), 
            // Plimpton 322 Row 12 Constant: 1;32,2,24 (Axionic Heartbeat)
            period_crystal: S60::new(1, 32, 2, 24, 0), 
            period_venus: S60::new(16, 10, 48, 0, 0),
            threshold: S60::new(0, 45, 0, 0, 0), // 0.75
        }
    }

    pub fn calculate_resonance(&self, tick_count: u64) -> S60 {
        // Un tick equivale a 23,939,835 nanosegundos.
        // Convertimos el tick_count a segundos en formato S60:
        // raw = (tick_count * 23_939_835 * 12_960_000) / 1_000_000_000
        // Para evitar overflow usamos i128:
        let ns_elapsed = (tick_count as i128) * 23_939_835;
        let t_spa_raw = (ns_elapsed * (S60::SCALE_0 as i128)) / 1_000_000_000;
        let t_spa = S60::from_raw(t_spa_raw as i64);

        let two_pi = S60Math::TWO_PI;
        
        // Fase Bio
        let phase_bio = S60Math::sin((two_pi * t_spa).div_safe(self.period_bio).unwrap_or(S60::zero()));
        // Fase Cristal (Oscilador)
        let phase_crystal = S60Math::sin((two_pi * t_spa).div_safe(self.period_crystal).unwrap_or(S60::zero()));
        // Fase Venus
        let phase_venus = S60Math::sin((two_pi * t_spa).div_safe(self.period_venus).unwrap_or(S60::zero()));
        
        // Retornamos el promedio de la superposición armónica
        let sum = phase_bio + phase_crystal + phase_venus;
        sum / 3i64
    }

    pub fn is_portal_open(&self, tick_count: u64) -> bool {
        self.calculate_resonance(tick_count).to_raw() > self.threshold.to_raw()
    }

    pub fn get_intensity(&self, tick_count: u64) -> S60 {
        self.calculate_resonance(tick_count)
    }
}

pub use semantic_router::{Intent, SemanticRouter};
pub use semantic_shell::SemanticShell;
