//! # 🛡️ S60 MATH UTILITIES - SENTINEL CORTEX 🛡️
//!
//! Advanced transcendental functions for S60.

use crate::math::S60;

pub struct S60Math;

impl S60Math {
    pub const TWO_PI: S60 = S60::new(6, 16, 59, 27, 43);

    pub fn ln(x: S60) -> S60 {
        // Simple log implementation for S60
        let val = x.to_raw() as f64 / S60::SCALE_0 as f64;
        S60::from_raw((val.ln() * S60::SCALE_0 as f64) as i64)
    }

    pub fn exp(x: S60) -> S60 {
        let val = x.to_raw() as f64 / S60::SCALE_0 as f64;
        S60::from_raw((val.exp() * S60::SCALE_0 as f64) as i64)
    }

    pub fn sin(x: S60) -> S60 {
        let val = x.to_raw() as f64 / S60::SCALE_0 as f64;
        S60::from_raw((val.sin() * S60::SCALE_0 as f64) as i64)
    }

    pub fn cos(x: S60) -> S60 {
        let val = x.to_raw() as f64 / S60::SCALE_0 as f64;
        S60::from_raw((val.cos() * S60::SCALE_0 as f64) as i64)
    }

    pub fn sqrt(x: S60) -> S60 {
        let val = x.to_raw() as f64 / S60::SCALE_0 as f64;
        S60::from_raw((val.sqrt() * S60::SCALE_0 as f64) as i64)
    }
}
