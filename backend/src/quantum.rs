//! Quantum Modules: BioResonator & PortalDetector (S60)
//! Basado en el estándar de Resonancia Bio-Centro.

use crate::math::{SPA, SPAMath};
use std::time::Instant;

pub struct BioResonator {
    pub coherence: SPA,
    decay_factor: SPA,
    pulse_gain: SPA,
    threshold_portal: SPA,
    dead_man_threshold: u64, // ms
    last_pulse: Instant,
}

impl BioResonator {
    pub fn new() -> Self {
        Self {
            coherence: SPA::zero(),
            decay_factor: SPA::from_raw(18014),
            pulse_gain: SPA::from_raw(1079568),
            threshold_portal: SPA::from_raw(11664000), // 0.9
            dead_man_threshold: 30000,
            last_pulse: Instant::now(),
        }
    }

    pub fn inject_bio_pulse(&mut self) {
        self.coherence = self.coherence + self.pulse_gain;
        if self.coherence.raw > SPA::ONE.raw {
            self.coherence = SPA::ONE;
        }
        self.last_pulse = Instant::now();
    }

    pub fn tick_entropy(&mut self) {
        if self.coherence.raw > self.decay_factor.raw {
            self.coherence = self.coherence - self.decay_factor;
        } else {
            self.coherence = SPA::ZERO;
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
    period_bio: SPA,
    /// Periodo Cristal (Oscilador de tiempo): 4.25s
    period_crystal: SPA,
    /// Periodo Venus: 16.18s
    period_venus: SPA,
    threshold: SPA,
}

impl PortalDetector {
    pub fn new() -> Self {
        Self {
            // Periodos sincronizados con la constante de fase
            period_bio: SPA::from_int(17), 
            // Plimpton 322 Row 12 Constant: 1;32,2,24 (Axionic Heartbeat)
            period_crystal: SPA::new(1, 32, 2, 24, 0), 
            period_venus: SPA::new(16, 10, 48, 0, 0),
            threshold: SPA::new(0, 45, 0, 0, 0), // 0.75
        }
    }

    pub fn calculate_resonance(&self, tick_count: u64) -> SPA {
        // Un tick equivale a 23,939,835 nanosegundos.
        // Convertimos el tick_count a segundos en formato SPA:
        // raw = (tick_count * 23_939_835 * 12_960_000) / 1_000_000_000
        // Para evitar overflow usamos i128:
        let ns_elapsed = (tick_count as i128) * 23_939_835;
        let t_spa_raw = (ns_elapsed * (SPA::SCALE_0 as i128)) / 1_000_000_000;
        let t_spa = SPA::from_raw(t_spa_raw as i64);

        let two_pi = SPAMath::TWO_PI;
        
        // Fase Bio
        let phase_bio = SPAMath::sin((two_pi * t_spa).div_safe(self.period_bio).unwrap_or(SPA::zero()));
        // Fase Cristal (Oscilador)
        let phase_crystal = SPAMath::sin((two_pi * t_spa).div_safe(self.period_crystal).unwrap_or(SPA::zero()));
        // Fase Venus
        let phase_venus = SPAMath::sin((two_pi * t_spa).div_safe(self.period_venus).unwrap_or(SPA::zero()));
        
        // Retornamos el promedio de la superposición armónica
        let sum = phase_bio + phase_crystal + phase_venus;
        sum / 3i64
    }

    pub fn is_portal_open(&self, tick_count: u64) -> bool {
        self.calculate_resonance(tick_count).raw > self.threshold.raw
    }

    pub fn get_intensity(&self, tick_count: u64) -> SPA {
        self.calculate_resonance(tick_count)
    }
}
