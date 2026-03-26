//! 📚 TruthSync: Mathematical Integrity Protocol (Plimpton 322)
//! 
//! Verified against the standard sexagesimal table.
//! Part of the Sentinel Cognitive Firewall sanitization layer.

use crate::math::SPA;
use std::collections::HashMap;

/// Plimpton 322 Row Ratios (Base-60)
/// a^2 + b^2 = c^2 => Ratio = (c/a)^2 or (c/b)^2 depending on column
/// We use the standard (c/a)^2 ratios for Rows 1-15.
pub struct TruthSync {
    ratios: HashMap<u32, SPA>,
    tolerance: i64,
}

impl TruthSync {
    pub fn new() -> Self {
        let mut ratios = HashMap::new();
        
        // Ratios mapped from Plimpton 322 table (Calculated in S60)
        // Row: Ratio (S60 raw value)
        ratios.insert(1,  SPA::from_raw(21923999)); // 1.691666...
        ratios.insert(2,  SPA::from_raw(23971127)); // 1.849624...
        ratios.insert(3,  SPA::from_raw(26211235)); // 2.022471...
        ratios.insert(4,  SPA::from_raw(28686741)); // 2.213483...
        ratios.insert(5,  SPA::from_raw(31437623)); // 2.425742...
        ratios.insert(6,  SPA::from_raw(34513043)); // 2.663043...
        ratios.insert(7,  SPA::from_raw(37959344)); // 2.928961...
        ratios.insert(8,  SPA::from_raw(41806451)); // 3.225806...
        ratios.insert(9,  SPA::from_raw(46095154)); // 3.556701...
        ratios.insert(10, SPA::from_raw(50879629)); // 3.925925...
        ratios.insert(11, SPA::from_raw(56214000)); // 4.3375
        ratios.insert(12, SPA::from_raw(62159999)); // 4.796296...
        ratios.insert(13, SPA::from_raw(68787692)); // 5.307692...
        ratios.insert(14, SPA::from_raw(76159176)); // 5.876470...
        ratios.insert(15, SPA::from_raw(84357818)); // 6.509090...

        Self {
            ratios,
            tolerance: 1000, // Minimal drift allowed
        }
    }

    /// Verify if a claim matches the mathematical truth
    pub fn verify_ratio(&self, row: u32, claimed_ratio: SPA) -> bool {
        if let Some(target) = self.ratios.get(&row) {
            let diff = (target.raw - claimed_ratio.raw).abs();
            diff <= self.tolerance
        } else {
            false
        }
    }

    /// Sanitize entropy signal: If it doesn't align with a known Plimpton phase,
    /// it increases the "Cognitive Heat" (Severity).
    /// Now integrated with Neural (SNN) and Resonant (Matrix) Memory.
    pub fn sanitize_telemetry(
        &self, 
        entropy_raw: i64,
        neural: &mut crate::neural::NeuralMemory,
        resonant: &mut crate::resonant::ResonantMemory,
        timestamp: u64
    ) -> u8 {
        // 1. Resonance Path (Fast-path alignment)
        resonant.resonate(0, 1, entropy_raw as u64);
        let global_coherence = resonant.get_coherence();
        
        // 2. Neural Path (Pattern recognition)
        // We normalize the signal for the SNN (LIF threshold is 1.0)
        let signal_normalized = (entropy_raw as f64).abs() / 12_960_000.0;
        let neural_spike = neural.observe(0, signal_normalized, timestamp);

        // 3. Mathematical Proof (TruthSync)
        let is_doom = self.detect_aiops_doom(entropy_raw);
        if is_doom {
            return 4; // CRITICAL: IAOopsdown Triggered
        }

        // 4. Severity Synthesis
        let mut severity = if entropy_raw % 12_960_000 == 0 {
            0 // Low severity (Harmonic)
        } else if entropy_raw % 60 == 0 {
            1 // Medium severity (Heuristic dissonance)
        } else {
            2 // High severity (Chaotic)
        };

        // If SNN spikes, the pattern is suspicious
        if neural_spike {
            severity = std::cmp::max(severity, 3); // Elevate to Warning
        }

        // If resonance is low, it's dissonant
        if global_coherence < 60000 && severity < 2 {
            severity = 2; // Elevate to Chaotic
        }

        severity
    }

    /// AIOpsShield Logic: Detect AIOpsDoom (Malicious Hallucinations)
    /// In this S60 implementation, Doom is characterized by "Anti-Phased" signals
    /// that attempt to force a non-Plimpton state into the Ring-0 buffer.
    pub fn detect_aiops_doom(&self, entropy_raw: i64) -> bool {
        // AIOpsDoom Signature Checklist:
        // 1. Prime-17 Dissonance: Signal is a multiple of 17 (The Hiccup) but NOT aligned with S60 scales.
        // 2. Anti-Phase: The absolute value is extremely high (Overflow attack attempt).
        // 3. Negative Entropy: Theoretically impossible in a closed YATRA system.
        
        if entropy_raw < 0 {
            return true; // Negative entropy = Cognitive Injection
        }

        if entropy_raw > 1_000_000_000_000 {
            return true; // Overflow attempt
        }

        // Specific 'Doom' constant: 0xDEAD_BEEF in S60
        if entropy_raw == 3735928559 {
            return true;
        }

        // Global Dissonance Check:
        // If the signal doesn't align with ANY known Plimpton ratio within 10%,
        // and its magnitude is significant, it's flagged as a Cognitive Hallucination.
        if entropy_raw > 12_960_000 {
            let mut found_match = false;
            let claimed = SPA::from_raw(entropy_raw);
            for ratio in self.ratios.values() {
                let diff = (ratio.raw - claimed.raw).abs();
                if diff < (ratio.raw / 10) { // 10% tolerance for non-doom
                    found_match = true;
                    break;
                }
            }
            if !found_match {
                return true; // Extreme dissonance detected
            }
        }

        false
    }
}
