//! # 🛡️ QUANTUM MODULE - SENTINEL CORTEX 🛡️
//!
//! High-performance quantum bridge and resonant systems.

pub mod bio_resonator;
pub mod portal_detector;
pub mod buffer_system;
pub mod semantic_router;
pub mod semantic_shell;

pub use bio_resonator::BioResonator;
pub use portal_detector::PortalDetector;
pub use buffer_system::{ResonantBuffer, BUFFER_SIZE_S60};
pub use semantic_router::{Intent, SemanticRouter};
pub use semantic_shell::SemanticShell;
