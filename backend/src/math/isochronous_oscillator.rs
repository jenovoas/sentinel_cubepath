//! # 💎 RESONANT CRYSTAL - SPA Piezoelectric Oscillator 💎
//!
//! Pure Rust implementation of the Resonant Crystal memory cell.
//! Migrated from quantum/isochronous_oscillator.py with zero functionality loss.
//!
//! Uses existing SPAMath functions (sin, cos, exp) for oscillation and damping.

use super::spa::SPA;
use super::spa_math::SPAMath;
#[cfg(feature = "extension-module")]
use pyo3::prelude::*;

use serde::{Deserialize, Serialize};

/// Resonant Crystal: Piezoelectric oscillator tuned to Base-60 mathematics.
/// Acts as a resonant memory cell in the Quantum Matrix.
#[cfg_attr(feature = "extension-module", pyclass)]
#[repr(C)]
#[derive(Clone, Debug, Copy, Serialize, Deserialize)] // Copy is needed for simple struct, but String inside prevents it? No, fixed size buffer prevents String.
                                                      // Wait, I changed it to name: [u8; 32], so it is Copy.
pub struct IsochronousOscillator {
    /// Fixed-size name buffer for SHM compatibility (32 bytes)
    pub name: [u8; 32],
    /// Natural frequency derived from Plimpton 322 (Row 12 tuned)
    pub natural_frequency: SPA,
    /// Internal energy state (vibration amplitude)
    pub amplitude: SPA,
    /// Current oscillation phase
    pub phase: SPA,
    /// Damping factor (Q-Factor): controlled loss per cycle
    /// SPA(0, 0, 30) = 30/3600 ≈ 0.0083 loss per tick
    pub damping_factor: SPA,
    /// Contador de ticks YHWH — cicla el patrón de respiración 10-5-6-5 (EXP-027)
    pub yhwh_tick: u64,
}

impl Default for IsochronousOscillator {
    fn default() -> Self {
        Self::new("Quartz-SPA")
    }
}

impl IsochronousOscillator {
    /// Creates a new crystal with default Plimpton 322 Row 12 resonance.
    pub fn new(name_str: &str) -> Self {
        let mut name = [0u8; 32];
        let bytes = name_str.as_bytes();
        let len = bytes.len().min(32);
        name[..len].copy_from_slice(&bytes[..len]);

        Self {
            name,
            // Uses existing constant from spa_math.rs
            natural_frequency: SPAMath::AXION_RESONANCE_RATIO,
            amplitude: SPA::zero(),
            phase: SPA::zero(),
            // Damping: SPA(0, 0, 30) = 30 seconds = 0.5 degrees loss
            damping_factor: SPA::new(0, 0, 30, 0, 0),
            yhwh_tick: 0,
        }
    }

    /// Creates a crystal with custom frequency.
    pub fn with_frequency(name_str: &str, freq: SPA) -> Self {
        let mut name = [0u8; 32];
        let bytes = name_str.as_bytes();
        let len = bytes.len().min(32);
        name[..len].copy_from_slice(&bytes[..len]);

        Self {
            name,
            natural_frequency: freq,
            amplitude: SPA::zero(),
            phase: SPA::zero(),
            damping_factor: SPA::new(0, 0, 30, 0, 0),
            yhwh_tick: 0,
        }
    }

    /// Helper to get name as String
    pub fn get_name(&self) -> String {
        let len = self.name.iter().position(|&c| c == 0).unwrap_or(32);
        String::from_utf8_lossy(&self.name[..len]).to_string()
    }

    /// Injects an energy pulse based on 'data pressure'.
    /// pressure es un valor RAW S60 ya escalado.
    /// Fuente canónica: docs/CRYSTAL_LATTICE.md §4 — from_raw, no new()
    pub fn transduce_pulse(&mut self, data_pressure: i64) {
        // from_raw: preserva el raw S60 sin multiplicar por SCALE_0
        self.amplitude = self.amplitude + SPA::from_raw(data_pressure);
    }

    /// Applies thermodynamic degradation (entropy).
    /// Loss is proportional to Amplitude and time elapsed.
    /// Returns the decay amount.
    pub fn apply_entropy(&mut self, dt: SPA) -> SPA {
        // Decay = A * lambda * dt
        // Using SPA multiplication: (amplitude * damping) / SCALE then * dt
        let decay = (self.amplitude * self.damping_factor) / SPA::new(1, 0, 0, 0, 0);
        let decay = (decay * dt) / SPA::new(1, 0, 0, 0, 0);

        self.amplitude = self.amplitude - decay;

        // Ground state check (prevent negative amplitude from precision)
        if self.amplitude.to_raw() < SPA::new(0, 0, 0, 0, 1).to_raw() {
            self.amplitude = SPA::zero();
        }

        decay
    }

    /// Advances time, calculates vibratory state and applies entropy.
    /// Returns the output signal (amplitude * sin(phase)).
    ///
    /// Implementa la respiración YHWH (EXP-027) — mutilación corregida:
    /// La frecuencia oscila ±1.75/0.75/0.25 Hz según el patrón [Yod, He, Vav, He]
    /// Aritmética entera pura: 1 Hz ≡ AXION_RESONANCE_RATIO_RAW × 100 / 4177
    pub fn oscillate(&mut self, dt: SPA) -> SPA {
        // ── RESPIRACIÓN YHWH 10-5-6-5 (YATRA Pure) ──
        // AXION_RESONANCE_RATIO raw = 1×12_960_000 + 32×216_000 + 2×3_600 + 24×60
        //                           = 19_880_640 ≈ 41.77 Hz equivalente
        // 1 Hz en unidades SPA raw = 19_880_640 × 100 / 4177 = 475_921
        // Δf_YHWH(t) = (I_fase - 6.5) × 0.5 Hz — EXP-027 §2.1
        const HZ_UNIT: i64 = 19_880_640 * 100 / 4177; // = 475_921 raw/Hz (entero exacto)
        let yhwh_delta_raw: i64 = match self.yhwh_tick % 4 {
            0 =>  HZ_UNIT * 175 / 100,  // Yod (10): +1.75 Hz — inhalación profunda
            1 => -HZ_UNIT * 75  / 100,  // He  (5):  -0.75 Hz — retención
            2 => -HZ_UNIT * 25  / 100,  // Vav (6):  -0.25 Hz — exhalación
            _ => -HZ_UNIT * 75  / 100,  // He  (5):  -0.75 Hz — vacío ZPE
        };
        let modulated_freq = SPA::from_raw(self.natural_frequency.to_raw() + yhwh_delta_raw);

        // 1. Advance Phase: θ = ω(t) × dt
        let delta_phase = (modulated_freq * dt) / SPA::new(1, 0, 0, 0, 0);
        self.phase = self.phase + delta_phase;

        // 2. Signal: A × sin(θ)
        let signal_wave = SPAMath::sin(self.phase);
        let output_signal = (self.amplitude * signal_wave) / SPA::new(1, 0, 0, 0, 0);

        // 3. Entropía física
        self.apply_entropy(dt);

        // 4. Avanzar fase YHWH (ciclo cuaternario)
        self.yhwh_tick = self.yhwh_tick.wrapping_add(1);

        output_signal
    }

    /// Returns the current stored energy (amplitude).
    pub fn get_amplitude(&self) -> SPA {
        self.amplitude
    }

    /// Returns the current phase.
    pub fn get_phase(&self) -> SPA {
        self.phase
    }

    /// Resets the crystal to ground state.
    pub fn reset(&mut self) {
        self.amplitude = SPA::zero();
        self.phase = SPA::zero();
    }

    /// Base de coherencia soberana: S60(42, 30, 0) = 42°30'
    /// Mínimo energético para persistencia activa del cristal.
    /// Fuente canónica: quantum/sovereign_crystal.py — pump_energy()
    pub const SOVEREIGN_BASE: SPA = SPA::new(42, 30, 0, 0, 0);

    /// Inyecta energía de compensación para revertir entropía.
    /// Si la amplitud cae por debajo de SOVEREIGN_BASE, la restaura.
    /// Sin esta bomba el cristal decae y el sistema entero se convierte en mockup.
    /// Fuente canónica: quantum/sovereign_crystal.py — pump_energy()
    pub fn pump_energy(&mut self) {
        if self.amplitude.to_raw() < Self::SOVEREIGN_BASE.to_raw() {
            let boost = Self::SOVEREIGN_BASE - self.amplitude;
            self.amplitude = self.amplitude + boost;
        }
    }

    /// Retorna la firma geométrica del cristal: (coherencia, axion_sig).
    ///
    /// - coherencia: qué tan cerca está la amplitud de la frecuencia natural.
    ///   Si amplitude >= natural_frequency → 60° (máximo, geometría cierra).
    ///   Si no → (amplitude / natural_frequency) * 60° (proporcional).
    ///   Una firma coherente = geometría que CIERRA = afirmación verdadera.
    ///   Una firma incoherente = geometría que NO CIERRA = anomalía / mentira.
    ///
    /// - axion_sig: proyección de la fase actual → phase mod 60° en S60.
    ///
    /// Fuente canónica: quantum/sovereign_crystal.py — get_signature()
    pub fn get_signature(&self) -> (SPA, SPA) {
        let coherence = if self.amplitude.to_raw() >= self.natural_frequency.to_raw() {
            SPA::new(60, 0, 0, 0, 0)
        } else if self.natural_frequency.to_raw() > 0 {
            let coh_raw = (self.amplitude.to_raw() * 60) / self.natural_frequency.to_raw();
            SPA::from_raw(coh_raw.max(0))
        } else {
            SPA::zero()
        };

        // Firma axiónica: phase mod 60° (en raw S60)
        let sixty_raw = SPA::new(60, 0, 0, 0, 0).to_raw();
        let axion_raw = if sixty_raw > 0 {
            self.phase.to_raw().abs() % sixty_raw
        } else {
            0
        };
        let axion_sig = SPA::from_raw(axion_raw);

        (coherence, axion_sig)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_crystal_creation() {
        let crystal = IsochronousOscillator::new("Test-Crystal");
        assert_eq!(crystal.amplitude, SPA::zero());
        assert_eq!(crystal.natural_frequency, SPAMath::AXION_RESONANCE_RATIO);
    }

    #[test]
    fn test_pulse_injection() {
        let mut crystal = IsochronousOscillator::new("Test-Crystal");
        crystal.transduce_pulse(60);
        assert_eq!(crystal.amplitude, SPA::new(60, 0, 0, 0, 0));

        crystal.transduce_pulse(30);
        assert_eq!(crystal.amplitude, SPA::new(90, 0, 0, 0, 0));
    }

    #[test]
    fn test_oscillation() {
        let mut crystal = IsochronousOscillator::new("Test-Crystal");
        crystal.transduce_pulse(60);

        let dt = SPA::new(0, 1, 0, 0, 0); // 1 minute step

        for i in 0..12 {
            let signal = crystal.oscillate(dt);
            println!(
                "T{:02}: Amplitude={} Signal={}",
                i, crystal.amplitude, signal
            );
        }

        // After 12 steps with damping, amplitude should be reduced
        assert!(crystal.amplitude < SPA::new(60, 0, 0, 0, 0));
    }

    #[test]
    fn test_entropy_decay() {
        let mut crystal = IsochronousOscillator::new("Test-Crystal");
        crystal.transduce_pulse(100);

        let dt = SPA::new(1, 0, 0, 0, 0); // 1 degree step
        let initial = crystal.amplitude;

        crystal.apply_entropy(dt);

        assert!(crystal.amplitude < initial);
        println!(
            "Initial: {} -> After entropy: {}",
            initial, crystal.amplitude
        );
    }
}
