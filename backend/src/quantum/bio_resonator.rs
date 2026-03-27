// src/quantum/bio_resonator.rs
//! BioResonator: Bio-Quantum Coherence Engine
//!
//! Translates biological events (keyboard/mouse) into quantum coherence states.

use crate::math::S60;
use std::time::Instant;

/// Bio-Quantum Resonator
pub struct BioResonator {
    /// Current coherence level [0.0, 1.0] in S60
    pub coherence: S60,
    /// Decay factor per tick (entropy)
    decay_factor: S60,
    /// Gain per biological pulse
    pulse_gain: S60,
    /// Last biological event timestamp
    last_pulse: Instant,
    /// Dead Man's Switch threshold (ms)
    dead_man_threshold_ms: u64,
}

impl BioResonator {
    pub fn new() -> Self {
        BioResonator {
            coherence: S60::zero(),
            decay_factor: S60::new(0, 0, 5, 0, 0),
            pulse_gain: S60::new(0, 5, 0, 0, 0),
            last_pulse: Instant::now(),
            dead_man_threshold_ms: 30_000,
        }
    }

    pub fn inject_bio_pulse(&mut self) {
        self.coherence = self.coherence + self.pulse_gain;
        if self.coherence > S60::one() {
            self.coherence = S60::one();
        }
        self.last_pulse = Instant::now();
    }

    pub fn tick_entropy(&mut self) {
        if self.coherence > S60::zero() {
            self.coherence = self.coherence - self.decay_factor;
            if self.coherence < S60::zero() {
                self.coherence = S60::zero();
            }
        }
    }

    pub fn get_coherence_raw(&self) -> i64 {
        self.coherence.to_raw()
    }

    pub fn time_since_pulse_ms(&self) -> u64 {
        self.last_pulse.elapsed().as_millis() as u64
    }
}

impl Default for BioResonator {
    fn default() -> Self {
        Self::new()
    }
}
