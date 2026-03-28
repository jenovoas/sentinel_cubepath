//! # 🧠 PREDICTIVE KERNEL: Resonant Integration Layer 🛡️
//!
//! Adaptador para el sistema de buffer cuántico determinista.
//! Provee la interfase S60 para telemetría de largo plazo (Non-Markovian).

use crate::math::S60;
pub use crate::quantum::ResonantBuffer;

/// Vector de Telemetría Cognitiva (Consistente con soul_verifier)
#[derive(Debug, Clone, Copy, Default)]
pub struct S60Vector {
    pub amplitude: S60,
    pub phase: S60,
    pub entropy: S60,
}

/// Cascada de Buffer de IA (Wrapper sobre ResonantBuffer)
pub struct AIBufferCascade {
    pub internal_buffer: ResonantBuffer,
    pub capacity: usize,
}

impl AIBufferCascade {
    pub fn new() -> Self {
        Self {
            internal_buffer: ResonantBuffer::new(),
            capacity: crate::quantum::BUFFER_SIZE_S60,
        }
    }

    /// Inserción en el Buffer Resonante (Lock-Free O(1))
    pub fn push(&self, value: S60) -> bool {
        self.internal_buffer.push(value)
    }

    /// Medición de Coherencia (Carga del Buffer)
    pub fn measure_coherence(&self) -> S60 {
        self.internal_buffer.load_factor()
    }

    /// Gatillo de Sanación Preventiva
    pub fn trigger_preventive_healing(&self) -> bool {
        // Si el buffer está al 80% de su capacidad armónica
        self.measure_coherence().to_raw() > (S60::SCALE_0 * 8 / 10)
    }
}

impl Default for AIBufferCascade {
    fn default() -> Self {
        Self::new()
    }
}
