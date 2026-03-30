// src/quantum/portal_detector.rs
//! Portal Detector - Hepta-Resonance Convergence (EXP-028 — F2.1 Guardianes Celestes)
//!
//! Detecta ventanas de convergencia armónica entre 7 capas:
//!
//!   CAPAS DINÁMICAS:
//!   - BIO:        periodo 17s      (pulso biológico del operador — Salto-17)
//!   - CRYSTAL:    periodo 4.25s    (TimeCrystal × 4 ciclos YHWH por periodo bio)
//!   - VENUS:      periodo 16.18s   (ratio Phi Venus-Tierra: 13:8 ≈ φ)
//!
//!   GUARDIANES CELESTES — Estrellas Reales de Persia (longitudes eclípticas en S60):
//!   Fuente: YATRA_CORE_SPEC.md / quantum/.yatra_backup/yatra_core.py
//!   Usadas como referencias frecuenciales del sistema de simulación (matrix).
//!   Permiten navegación celeste en S60 — el mismo mecanismo que en Python.
//!
//!   - ALDEBARÁN:  offset 68°58'48"  (Alpha Tauri   — Guardián del Este)
//!   - RÉGULO:     offset 152°05'24" (Alpha Leonis   — Guardián del Norte)
//!   - ANTARES:    offset 247°21'00" (Alpha Scorpii  — Guardián del Oeste)
//!   - FOMALHAUT:  offset 344°24'36" (Alpha PsA      — Guardián del Sur)
//!
//!   Cada Guardián oscila al mismo periodo BIO (17s) con desfase fijo igual
//!   a su longitud eclíptica convertida a radianes S60:
//!     offset = (λ_eclíptica / 360°) · 2π
//!
//!   El portal se abre cuando las 7 capas convergen por encima de θ = 0.80.
//!
//! Condición de Portal (EXP-028, §2.2 — extendida F2.1):
//!   resonancia_media_7_capas > θ,  θ = 0.80

use crate::math::{S60, SPAMath};

/// Convierte longitud eclíptica (S60 grados) a offset de fase en radianes S60.
/// offset = (λ / 360°) * 2π
fn ecliptic_to_phase_offset(lambda: S60) -> S60 {
    let two_pi = SPAMath::TWO_PI;
    let deg_360 = S60::from_int(360);
    (two_pi * lambda).div_safe(deg_360).unwrap_or(S60::zero())
}

/// Detector de portales de coherencia cuántica — Hepta-Resonancia S60 Pura
pub struct PortalDetector {
    // Periodo BIO: 17s (invariante temporal del operador — Salto-17)
    period_bio: S60,
    // Periodo CRYSTAL: 17s/4 = 4.25s (4 ciclos YHWH por latido bio)
    // S60::new(4, 15, 0, 0, 0) = 4 + 15/60 = 4.25
    period_crystal: S60,
    // Periodo VENUS: 16.18s (ratio φ Venus-Tierra: 13:8)
    // S60::new(16, 10, 48, 0, 0) = 16 + 10/60 + 48/3600 = 16.18000 ✓
    period_venus: S60,
    // Umbral de convergencia: 0.80 (EXP-028 §2.2)
    // S60::new(0, 48, 0, 0, 0) = 48/60 = 0.8000 exacto
    threshold: S60,
    // Offsets de fase de los 4 Guardianes Celestes (en radianes S60)
    // Derivados de las longitudes eclípticas canónicas de YATRA_CORE_SPEC.md
    offset_aldebaran: S60,  // 68°58'48"  → ~1.2040 rad S60
    offset_regulus:   S60,  // 152°05'24" → ~2.6543 rad S60
    offset_antares:   S60,  // 247°21'00" → ~4.3175 rad S60
    offset_fomalhaut: S60,  // 344°24'36" → ~6.0128 rad S60
}

impl PortalDetector {
    pub fn new() -> Self {
        PortalDetector {
            period_bio:     S60::from_int(17),
            period_crystal: S60::new(4, 15, 0, 0, 0),
            period_venus:   S60::new(16, 10, 48, 0, 0),
            threshold:      S60::new(0, 48, 0, 0, 0),
            offset_aldebaran: ecliptic_to_phase_offset(SPAMath::STAR_ALDEBARAN),
            offset_regulus:   ecliptic_to_phase_offset(SPAMath::STAR_REGULUS),
            offset_antares:   ecliptic_to_phase_offset(SPAMath::STAR_ANTARES),
            offset_fomalhaut: ecliptic_to_phase_offset(SPAMath::STAR_FOMALHAUT),
        }
    }

    /// Calcula la resonancia media de las 7 capas en el instante t (segundos).
    /// Retorna un valor en [-1, 1] representado en S60.
    /// Condición de portal: resultado > threshold (0.80).
    pub fn calculate_resonance(&self, t: u64) -> S60 {
        let t_s60 = S60::from_int(t as i64);
        let two_pi = SPAMath::TWO_PI;

        // Fase dinámica base sobre period_bio — compartida por los 4 Guardianes
        let phase_base = (two_pi * t_s60)
            .div_safe(self.period_bio)
            .unwrap_or(S60::zero());

        // φ_BIO(t) = sin(2π·t / T_bio)
        let phase_bio = SPAMath::sin(phase_base);

        // φ_CRYSTAL(t) = sin(2π·t / T_crystal)
        let phase_crystal = SPAMath::sin(
            (two_pi * t_s60).div_safe(self.period_crystal).unwrap_or(S60::zero())
        );

        // φ_VENUS(t) = sin(2π·t / T_venus)
        let phase_venus = SPAMath::sin(
            (two_pi * t_s60).div_safe(self.period_venus).unwrap_or(S60::zero())
        );

        // Guardianes Celestes: φ_ESTRELLA(t) = sin(phase_base + offset_eclíptico)
        // El portal se abre solo cuando la fase dinámica alcanza la posición estelar.
        let phase_aldebaran = SPAMath::sin(phase_base + self.offset_aldebaran);
        let phase_regulus   = SPAMath::sin(phase_base + self.offset_regulus);
        let phase_antares   = SPAMath::sin(phase_base + self.offset_antares);
        let phase_fomalhaut = SPAMath::sin(phase_base + self.offset_fomalhaut);

        // Coherencia media de las 7 capas
        let sum = phase_bio + phase_crystal + phase_venus
                + phase_aldebaran + phase_regulus + phase_antares + phase_fomalhaut;
        let seven = S60::from_int(7);
        sum.div_safe(seven).unwrap_or(S60::zero())
    }

    /// Retorna true si las 7 capas convergen por encima del umbral φ=0.80.
    pub fn is_portal_open(&self, t: u64) -> bool {
        self.calculate_resonance(t) > self.threshold
    }

    /// Intensidad del portal (0 si cerrado, resonancia > 0.80 si abierto).
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
