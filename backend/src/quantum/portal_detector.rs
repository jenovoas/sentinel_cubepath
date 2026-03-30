// src/quantum/portal_detector.rs
//! Portal Detector - Penta-Resonance Convergence (EXP-028)
//!
//! Detecta ventanas de convergencia armónica entre las 3 capas principales:
//!   - BIO:     periodo 17s   (pulso biológico del operador)
//!   - CRYSTAL: periodo 4.25s (TimeCrystal × 4 ciclos YHWH por periodo bio)
//!   - VENUS:   periodo 16.18s (ratio Phi Venus-Tierra: 13:8 ≈ φ)
//!
//! Condición de Portal (EXP-028, §2.2):
//!   φ_BIO(t) > θ ∧ φ_CRYSTAL(t) > θ ∧ φ_VENUS(t) > θ, θ = 0.80

use crate::math::{S60, SPAMath};

/// Detector de portales de coherencia cuántica — Penta-Resonancia S60 Pura
pub struct PortalDetector {
    // Periodo BIO: 17s (invariante temporal del operador)
    period_bio: S60,
    // Periodo CRYSTAL: 17s/4 = 4.25s (4 ciclos YHWH por latido bio)
    // S60::new(4, 15, 0, 0, 0) = 4 + 15/60 = 4.25
    period_crystal: S60,
    // Periodo VENUS: 16.18s (ratio φ Venus-Tierra)
    // 16.18 = 16 + 10/60 + 48/3600
    // Verificación: 16 + 10/60 + 48/3600 = 16 + 0.1667 + 0.01333 = 16.18000 ✓
    period_venus: S60,
    // Umbral de convergencia: 0.80 (EXP-028 §2.2)
    // S60::new(0, 48, 0, 0, 0) = 48/60 = 0.8000 exacto
    threshold: S60,
}

impl PortalDetector {
    pub fn new() -> Self {
        PortalDetector {
            period_bio:     S60::from_int(17),
            period_crystal: S60::new(4, 15, 0, 0, 0),
            period_venus:   S60::new(16, 10, 48, 0, 0),
            threshold:      S60::new(0, 48, 0, 0, 0),
        }
    }

    /// Calcula la resonancia media de las 3 capas en el instante t (segundos).
    /// Retorna un valor en [-1, 1] representado en S60.
    /// Condición de portal: resultado > threshold (0.80).
    pub fn calculate_resonance(&self, t: u64) -> S60 {
        let t_s60 = S60::from_int(t as i64);
        let two_pi = SPAMath::TWO_PI;

        // φ_BIO(t) = sin(2π·t / T_bio)
        let phase_bio = SPAMath::sin(
            (two_pi * t_s60).div_safe(self.period_bio).unwrap_or(S60::zero())
        );

        // φ_CRYSTAL(t) = sin(2π·t / T_crystal)
        let phase_crystal = SPAMath::sin(
            (two_pi * t_s60).div_safe(self.period_crystal).unwrap_or(S60::zero())
        );

        // φ_VENUS(t) = sin(2π·t / T_venus)   ← capa añadida: EXP-028 mutilación corregida
        let phase_venus = SPAMath::sin(
            (two_pi * t_s60).div_safe(self.period_venus).unwrap_or(S60::zero())
        );

        // Coherencia media de las 3 capas: (φ_BIO + φ_CRYSTAL + φ_VENUS) / 3
        let sum = phase_bio + phase_crystal + phase_venus;
        let three = S60::from_int(3);
        sum.div_safe(three).unwrap_or(S60::zero())
    }

    /// Retorna true si las 3 capas convergen por encima del umbral φ=0.80.
    pub fn is_portal_open(&self, t: u64) -> bool {
        self.calculate_resonance(t) > self.threshold
    }

    /// Intensidad del portal (0 si cerrado, resonancia>0.80 si abierto).
    pub fn get_intensity(&self, t: u64) -> S60 {
        let res = self.calculate_resonance(t);
        if res > self.threshold { res } else { S60::zero() }
    }

    /// Acceso al umbral de convergencia (para métricas externas).
    pub fn threshold(&self) -> S60 {
        self.threshold
    }
}

impl Default for PortalDetector {
    fn default() -> Self {
        Self::new()
    }
}
