//! # 🛡️ S60 MATH CONSOLIDATION - SENTINEL CORTEX 🛡️
//!
//! Unified math bridge for Sentinel-Cortex.
//! Base-60 Arithmetic (60^4 accuracy).

pub mod s60;
pub mod spa_math;

pub use s60::S60;
pub use spa_math::S60Math;
