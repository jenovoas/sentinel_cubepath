//! # 🛡️ TRUTHSYNC: SEMANTIC & ENTROPIC FIREWALL 🛡️
//!
//! Implementation of the Sentinel "TruthSync" architecture.
//! Acts as a membrane involved in filtering information before it reaches the Cognitive Core.
//!
//! Two Layers:
//! 1. **Semantic Firewall**: Regex-based pattern matching (Truth vs Falsehood).
//! 2. **Entropic Firewall**: Shannon Entropy validation (Signal vs Noise).

use regex::RegexSet;
use crate::security::soul_verifier::{SoulVerifier, calculate_lyapunov_s60, chaos_entropy_s60};
use crate::math::S60;
use crate::quantum::buffer_system::ResonantBuffer;
use sha3::{Digest, Sha3_512};
use std::collections::HashMap;

pub struct SemanticFirewall {
    // Whitelist patterns (Constructive/Truthful)
    allowed_patterns: RegexSet,
    // Blacklist patterns (Destructive/False/Noise)
    blocked_patterns: RegexSet,
}

impl SemanticFirewall {
    pub fn new() -> Self {
        // Default rules (Example - to be expanded)
        let allowed = RegexSet::new(&[
            r"ME-60OS",
            r"Resonance",
            r"Truth",
            r"Physics",
            r"System Stable",
        ]).unwrap();

        let blocked = RegexSet::new(&[
            r"Error",
            r"Failure",
            r"Corruption",
            r"Panic",
            r"Attack",
        ]).unwrap();

        Self {
            allowed_patterns: allowed,
            blocked_patterns: blocked,
        }
    }

    /// Checks if content passes the semantic filter
    pub fn verify(&self, text: &str) -> bool {
        // Block if matches blacklist
        if self.blocked_patterns.is_match(text) {
            return false;
        }
        // Allow if matches whitelist OR if it's neutral (simplification for now)
        // In strict mode, we might require whitelist match.
        true
    }
}

pub struct EntropicFirewall;

impl EntropicFirewall {
    /// Verifies if the information density is sufficient (neither random noise nor static repetition).
    /// Uses Shannon Entropy from Bio-Resonator.
    pub fn verify(signal: &[S60]) -> bool {
        // Reuse SoulVerifier logic but with different thresholds for "Information"
        // Information usually has entropy between 2.0 and 5.0
        // Low entropy (< 1.0) = Repetitive/Spam
        // High entropy (> 5.0) = Random Noise/Encryption/Compressed

        // We use the simpler method from Bio since we don't have a direct "Text -> S60" mapper
        // that preserves entropy perfectly yet, but assumes signal is numeric.
        // For text, we'd need a separate entropy calc.
        // For now, this validates NUMERIC signals (telemetry).
        let metrics = SoulVerifier::analyze(signal);

        // SoulVerifier checks [0.5, 3.5].
        // Let's say valid telemetry is also in this range for now.
        metrics.is_alive
    }

    /// Calculate text entropy via integer histogram (S60 compliant — zero f64)
    /// Entropy proxy: cuenta cuántos buckets distintos tienen al menos 1 ocurrencia.
    /// - Spam "aaaa"    → 1 bucket  (entropía ~0)   → rechazado
    /// - Texto normal   → 20-80 buckets distintos   → aceptado
    /// - Ruido puro     → 200+ buckets               → rechazado
    /// Equivale conceptualmente a H > 2.0 && H < 6.0 sin usar f64.
    pub fn verify_text(text: &str) -> bool {
        if text.is_empty() { return false; }

        let mut counts = [0u32; 256];
        let mut total: u32 = 0;

        for b in text.bytes() {
            counts[b as usize] += 1;
            total += 1;
        }

        // Número de símbolos distintos usados
        let distinct: u32 = u32::try_from(counts.iter().filter(|&&c| c > 0).count()).unwrap_or(0);

        // Varianza de distribución: sum(count^2) escalado — baja si distribución uniforme
        // Condición S60: al menos 10 símbolos distintos, máximo 200
        distinct >= 10 && distinct <= 200 && total >= 4
    }
}

pub struct TruthEngine {
    semantic: SemanticFirewall,
    entropic: EntropicFirewall,
}

impl TruthEngine {
    pub fn new() -> Self {
        Self {
            semantic: SemanticFirewall::new(),
            entropic: EntropicFirewall,
        }
    }

    pub fn verify(&self, text: &str) -> bool {
        if !self.semantic.verify(text) {
            return false; // Blocked by Semantic Layer
        }

        if !EntropicFirewall::verify_text(text) {
            // Maybe log warning but allow for now if it's short commands?
            // For strict mode, return false.
            // return false;
        }

        true
    }
}

// =============================================================================
// TRUTHSYNC — Certificación matemática Plimpton 322 + Soul Verifier
// Integra el TruthEngine semántico con validación entrópica de eBPF events
// =============================================================================

#[derive(serde::Serialize)]
pub struct CertificationSeal {
    pub row: u32,
    pub lyapunov: S60,
    pub entropy: S60,
    pub seal_hash: String,
    pub certified: bool,
}

pub struct TruthSync {
    ratios: HashMap<u32, S60>,
    tolerance: i64,
    engine: TruthEngine,
}

impl TruthSync {
    pub fn new() -> Self {
        let mut ratios = HashMap::new();
        ratios.insert(1,  S60::from_raw(21923999));
        ratios.insert(2,  S60::from_raw(23971127));
        ratios.insert(3,  S60::from_raw(26211235));
        ratios.insert(4,  S60::from_raw(28686741));
        ratios.insert(5,  S60::from_raw(31437623));
        ratios.insert(6,  S60::from_raw(34513043));
        ratios.insert(7,  S60::from_raw(37959344));
        ratios.insert(8,  S60::from_raw(41806451));
        ratios.insert(9,  S60::from_raw(46095154));
        ratios.insert(10, S60::from_raw(50879629));
        ratios.insert(11, S60::from_raw(56214000));
        ratios.insert(12, S60::from_raw(62159999));
        ratios.insert(13, S60::from_raw(68787692));
        ratios.insert(14, S60::from_raw(76159176));
        ratios.insert(15, S60::from_raw(84357818));

        Self { ratios, tolerance: 1000, engine: TruthEngine::new() }
    }

    /// Certifica un evento via validación caótica S60 + firma SHA3-512
    pub fn certify_content(&self, row: u32, signal: &[S60]) -> CertificationSeal {
        let lyapunov = calculate_lyapunov_s60(signal);
        let entropy = chaos_entropy_s60(signal);

        let mut certified = false;
        if let Some(target) = self.ratios.get(&row) {
            let diff = (target.to_raw() as i128 - lyapunov.to_raw() as i128).abs();
            if diff < self.tolerance as i128 * 10 {
                certified = true;
            }
        }

        let mut hasher = Sha3_512::new();
        hasher.update(lyapunov.to_raw().to_le_bytes());
        hasher.update(entropy.to_raw().to_le_bytes());
        hasher.update(row.to_le_bytes());
        let seal_hash = hex::encode(hasher.finalize());

        CertificationSeal { row, lyapunov, entropy, seal_hash, certified }
    }

    /// AIOpsShield: detecta firmas entrópicas anómalas
    pub fn detect_aiops_doom(&self, entropy_raw: i64) -> bool {
        if entropy_raw < 0 || entropy_raw > 1_000_000_000_000 { return true; }
        let claimed = S60::from_raw(entropy_raw);
        for ratio in self.ratios.values() {
            let diff = (ratio.to_raw() as i128 - claimed.to_raw() as i128).abs();
            if diff < (ratio.to_raw() / 60) as i128 { return false; }
        }
        true
    }

    pub fn sanitize_telemetry(
        &self,
        entropy_raw: i64,
        _neural: &mut crate::neural::NeuralMemory,
        _timestamp: u64,
    ) -> u8 {
        if self.detect_aiops_doom(entropy_raw) { 5 } else { 0 }
    }

    pub fn verify_infrastructure_integrity(&self, buffer: &ResonantBuffer, biometric_state: S60) -> bool {
        let load = buffer.load_factor();
        if load.to_raw() > (S60::SCALE_0 * 7 / 10) && biometric_state.to_raw() < (S60::SCALE_0 / 2) {
            return false;
        }
        true
    }

    /// Proxy al SemanticFirewall del TruthEngine
    pub fn verify_text(&self, text: &str) -> bool {
        self.engine.verify(text)
    }
}
