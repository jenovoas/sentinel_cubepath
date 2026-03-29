//! # 🛡️ SOUL VERIFIER - SENTINEL CORTEX 🛡️
//!
//! Harmonic Content Certification (Lyapunov & Chaos Entropy).
//! Pure Base-60 implementation for high-integrity truth claims.
//!
//! # 💓 BIO-RESONANCE (SOUL VERIFIER) 💓
//!
//! Implementation of Axiom V: "Biocentrism".
//! Verifies that the operator is a biological entity via Chaos Theory.
//!
//! Based on EXP-019 protocols:
//! - Lyapunov Exponent (λ): Measures orbital divergence (Chaos).
//! - Shannon Entropy (H): Measures information density.

use crate::math::{S60, SPAMath};
use std::collections::HashMap;

// =========================================================================
// BIO-RESONANCE: SoulVerifier (from me-60os/src/bio.rs)
// =========================================================================

#[derive(Debug, Clone)]
pub struct BioMetrics {
    pub lyapunov: S60,
    pub entropy: S60,
    pub is_alive: bool,
}

pub struct SoulVerifier;

impl SoulVerifier {
    /// Analyzes a time-series signal (e.g., Heart Rhythm) for biological signatures.
    pub fn analyze(signal: &[S60]) -> BioMetrics {
        let lyapunov = Self::calculate_lyapunov(signal);
        let entropy = Self::calculate_entropy(signal);

        // Validation Ranges (from EXP-019)
        // Lyapunov: 0.1 .. 2.5
        let l_min = S60::new(0, 6, 0, 0, 0);  // 0.1
        let l_max = S60::new(2, 30, 0, 0, 0); // 2.5

        // Entropy: 0.5 .. 3.5
        let e_min = S60::new(0, 30, 0, 0, 0); // 0.5
        let e_max = S60::new(3, 30, 0, 0, 0); // 3.5

        let alive = lyapunov >= l_min && lyapunov <= l_max && entropy >= e_min && entropy <= e_max;

        BioMetrics { lyapunov, entropy, is_alive: alive }
    }

    /// Calculates Lyapunov Exponent (λ)
    /// λ = (1/N) * Σ ln(|d2/d1|)
    fn calculate_lyapunov(signal: &[S60]) -> S60 {
        if signal.len() < 3 {
            return S60::zero();
        }

        let mut sum_div = S60::zero();
        let mut count = S60::zero();
        let threshold = S60::new(0, 0, 0, 0, 1); // Epsilon (Fourths resolution)

        for i in 0..signal.len() - 2 {
            let d1 = (signal[i + 1] - signal[i]).abs();
            let d2 = (signal[i + 2] - signal[i + 1]).abs();

            if d1 > threshold {
                let ratio = d2 / d1;
                if ratio.to_raw() > 0 {
                    let ln_val = SPAMath::ln(ratio).abs();
                    sum_div = sum_div + ln_val;
                    count = count + S60::new(1, 0, 0, 0, 0);
                }
            }
        }

        if count.to_raw() == 0 {
            return S60::zero();
        }

        let avg = sum_div / count;
        let scale = S60::new(0, 30, 0, 0, 0); // 0.5 from EXP-021
        avg * scale
    }

    /// Calculates Shannon Entropy (H)
    /// H = -Σ p * ln(p)
    fn calculate_entropy(signal: &[S60]) -> S60 {
        if signal.is_empty() {
            return S60::zero();
        }

        let mut counts = [0u32; 256];
        let mut total = 0u32;

        for &val in signal {
            let idx = val.to_raw() / S60::SCALE_0;
            if (0..256).contains(&idx) {
                counts[usize::try_from(idx).unwrap_or(0)] += 1;
                total += 1;
            }
        }

        let mut entropy = S60::zero();
        let total_spa = S60::new(total as i64, 0, 0, 0, 0);

        for &c in &counts {
            if c > 0 {
                let p = S60::new(c as i64, 0, 0, 0, 0) / total_spa;
                let ln_p = SPAMath::ln(p);
                let term = p * ln_p;
                entropy = entropy - term;
            }
        }

        entropy
    }
}

/// Calculate Lyapunov exponent in Base-60 (Pure S60 path)
pub fn calculate_lyapunov_s60(signal: &[S60]) -> S60 {
    if signal.len() < 2 {
        return S60::zero();
    }

    let mut sum_div = S60::zero();
    let mut count = 0;

    for i in 0..signal.len() - 2 {
        let d1 = (signal[i + 1] - signal[i]).abs();
        let d2 = (signal[i + 2] - signal[i + 1]).abs();

        let threshold = S60::from_raw(S60::SCALE_0 / 10000); // 0.0001
        if d1.to_raw() > threshold.to_raw() {
            if let Ok(ratio) = d2.div_safe(d1) {
                if ratio.to_raw() > 0 {
                    let ln_ratio = SPAMath::ln(ratio);
                    sum_div = sum_div + ln_ratio.abs();
                    count += 1;
                }
            }
        }
    }

    if count == 0 {
        return S60::zero();
    }

    let count_s60 = S60::from_int(count as i64);
    let raw_lambda = sum_div.div_safe(count_s60).unwrap_or(S60::zero());

    // Scale to range (0.1 - 2.5) for biometric signature
    let min = S60::from_raw(S60::SCALE_0 / 10);
    let max = S60::from_raw((S60::SCALE_0 * 5) / 2);
    raw_lambda.clamp(min, max)
}

/// Calculate Chaos Entropy in Base-60
pub fn chaos_entropy_s60(signal: &[S60]) -> S60 {
    if signal.is_empty() { return S60::zero(); }

    let mut counts: HashMap<i64, u32> = HashMap::new();
    for val in signal {
        let bucket = (val.to_raw() * 100) / S60::SCALE_0;
        *counts.entry(bucket).or_insert(0) += 1;
    }

    let total = signal.len();
    let total_s60 = S60::from_int(total as i64);

    let mut entropy = S60::zero();
    for &count in counts.values() {
        let count_s60 = S60::from_int(count as i64);
        if let Ok(p) = count_s60.div_safe(total_s60) {
            if p.to_raw() > 0 {
                let ln_p = SPAMath::ln(p);
                entropy = entropy - (p * ln_p);
            }
        }
    }
    entropy
}

