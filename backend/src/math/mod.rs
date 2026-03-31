//! # 🛡️ RING-0 MATHEMATICAL SOVEREIGNTY 🛡️
//!
//! Consolidated module for Base-60 SPA arithmetic.
//! Purged of all floating-point simplification.

pub mod spa;
pub mod spa_math;
pub mod complex;
pub mod core;
pub mod isochronous_oscillator;
pub mod resonant_matrix;
pub mod hexagonal_control;

pub use spa::SPA;
pub use spa_math::SPAMath;
pub use complex::ComplexSPA;
pub use core::{S60PID, IsochronousClock, ResonantBuffer, LiquidLattice};
pub use isochronous_oscillator::IsochronousOscillator;
pub use resonant_matrix::ResonantMatrix;
pub use hexagonal_control::{HexagonalController, HexCoord};

// S60 is a semantic alias for SPA to align with external Quantum/eBPF modules
pub type S60 = SPA;
