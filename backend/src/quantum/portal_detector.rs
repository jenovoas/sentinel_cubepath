// src/quantum/portal_detector.rs
//! Portal Detector - Penta-Resonance Convergence

use crate::math::{S60, S60Math};

/// Portal Detector - Detects harmonic convergence
pub struct PortalDetector {
    period_bio: S60,
    period_crystal: S60,
    threshold: S60,
}

impl PortalDetector {
    pub fn new() -> Self {
        PortalDetector {
            period_bio: S60::from_int(17),
            period_crystal: S60::new(4, 15, 0, 0, 0),
            threshold: S60::new(0, 45, 0, 0, 0),
        }
    }

    pub fn calculate_resonance(&self, t: u64) -> S60 {
        let t_s60 = S60::from_int(t as i64);
        let two_pi = S60Math::TWO_PI;
        
        // Harmonic sin waves for bio and crystal cycles
        let phase_bio = S60Math::sin((two_pi * t_s60).div_safe(self.period_bio).unwrap_or(S60::zero()));
        let phase_crystal = S60Math::sin((two_pi * t_s60).div_safe(self.period_crystal).unwrap_or(S60::zero()));

        let sum = phase_bio + phase_crystal;
        let two = S60::from_int(2);
        sum.div_safe(two).unwrap_or(S60::zero())
    }

    pub fn is_portal_open(&self, t: u64) -> bool {
        self.calculate_resonance(t) > self.threshold
    }

    pub fn get_intensity(&self, t: u64) -> S60 {
        let res = self.calculate_resonance(t);
        if res > self.threshold { res } else { S60::zero() }
    }
}

impl Default for PortalDetector {
    fn default() -> Self {
        Self::new()
    }
}
