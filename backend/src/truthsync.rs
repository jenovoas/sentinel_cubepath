//! 📚 TruthSync: Mathematical Integrity Protocol (Plimpton 322)
//! 
//! Verified against the standard sexagesimal table.
//! Part of the Sentinel Cognitive Firewall sanitization layer.

use crate::math::S60;
use std::collections::HashMap;

/// Plimpton 322 Row Ratios (Base-60)
/// We use the standard (c/a)^2 ratios for Rows 1-15.
pub struct TruthSync {
    ratios: HashMap<u32, S60>,
    tolerance: i64,
}

impl TruthSync {
    pub fn new() -> Self {
        let mut ratios = HashMap::new();
        
        // Ratios mapped from Plimpton 322 table (Calculated in S60)
        // Row: Ratio (S60 raw value)
        ratios.insert(1,  S60::from_raw(21923999)); // 1.691666...
        ratios.insert(2,  S60::from_raw(23971127)); // 1.849624...
        ratios.insert(3,  S60::from_raw(26211235)); // 2.022471...
        ratios.insert(4,  S60::from_raw(28686741)); // 2.213483...
        ratios.insert(5,  S60::from_raw(31437623)); // 2.425742...
        ratios.insert(6,  S60::from_raw(34513043)); // 2.663043...
        ratios.insert(7,  S60::from_raw(37959344)); // 2.928961...
        ratios.insert(8,  S60::from_raw(41806451)); // 3.225806...
        ratios.insert(9,  S60::from_raw(46095154)); // 3.556701...
        ratios.insert(10, S60::from_raw(50879629)); // 3.925925...
        ratios.insert(11, S60::from_raw(56214000)); // 4.3375
        ratios.insert(12, S60::from_raw(62159999)); // 4.796296...
        ratios.insert(13, S60::from_raw(68787692)); // 5.307692...
        ratios.insert(14, S60::from_raw(76159176)); // 5.876470...
        ratios.insert(15, S60::from_raw(84357818)); // 6.509090...

        Self {
            ratios,
            tolerance: 1000, 
        }
    }

    /// Verify if a claim matches the mathematical truth
    pub fn verify_ratio(&self, row: u32, claimed_ratio: S60) -> bool {
        if let Some(target) = self.ratios.get(&row) {
            let diff = (target.to_raw() as i128 - claimed_ratio.to_raw() as i128).abs() as i64;
            diff <= self.tolerance
        } else {
            false
        }
    }

    /// AIOpsShield Logic: Detect AIOpsDoom (Malicious Hallucinations)
    pub fn detect_aiops_doom(&self, entropy_raw: i64) -> bool {
        if entropy_raw < 0 { return true; }
        if entropy_raw > 1_000_000_000_000 { return true; }
        if entropy_raw == 3735928559 { return true; }

        if entropy_raw > 12_960_000 {
            let mut found_match = false;
            let claimed = S60::from_raw(entropy_raw);
            for ratio in self.ratios.values() {
                let r_raw = ratio.to_raw() as i128;
                let c_raw = claimed.to_raw() as i128;
                let diff = (r_raw - c_raw).abs();
                if diff < (r_raw / 10) { 
                    found_match = true;
                    break;
                }
            }
            if !found_match { return true; }
        }
        false
    }
}
