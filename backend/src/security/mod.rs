//! # 🛡️ SECURITY MODULE - SENTINEL CORTEX 🛡️
//!
//! Biometric verification and Soul Verifier (S60).
//! Ported for Sentinel Ring-0 (MiduDev Hackathon).

pub mod soul_verifier;
pub mod soul_verifier_production;

pub use soul_verifier_production::{
    BiometricError, BiometricProof, BiometricVerifier, LivenessChallenge,
};
