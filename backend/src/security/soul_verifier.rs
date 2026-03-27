//! # 🛡️ SOUL VERIFIER - SENTINEL CORTEX 🛡️
//!
//! Harmonic Content Certification (Lyapunov & Chaos Entropy).
//! Pure Base-60 implementation for high-integrity truth claims.

use crate::math::{S60, S60Math};
use std::collections::HashMap;

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
                    let ln_ratio = S60Math::ln(ratio);
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
                let ln_p = S60Math::ln(p);
                entropy = entropy - (p * ln_p);
            }
        }
    }
    entropy
}

/// Calculate Q-Factor for harmonic resonance
pub fn calculate_q_factor_s60(signal: &[S60]) -> S60 {
    if signal.len() < 10 { return S60::from_int(5); }
    
    // Simplificación armónica para el MVP en cubepath
    let sum: i64 = signal.iter().map(|s| s.to_raw()).sum();
    let avg = sum / signal.len() as i64;
    
    let variance: i64 = signal.iter()
        .map(|s| (s.to_raw() - avg).pow(2))
        .sum::<i64>() / signal.len() as i64;
    
    let bandwidth = S60Math::sqrt(S60::from_raw(variance));
    if bandwidth.to_raw() == 0 { return S60::from_int(5); }
    
    let f0 = S60::from_raw(avg.abs());
    f0.div_safe(bandwidth).unwrap_or(S60::from_int(5)).clamp(S60::from_int(2), S60::from_int(8))
}
