//! # 🛡️ BASE-60 MATHEMATICAL FUNCTIONS - SENTINEL CORTEX 🛡️
//!
//! Power series implementation for S60 Arithmetic.
//! Guaranteed zero-decimal contamination.

use crate::math::s60::S60;

pub struct S60Math;

impl S60Math {
    pub const PI: S60 = S60::new(3, 8, 29, 44, 0);
    pub const TWO_PI: S60 = S60::new(6, 16, 59, 28, 0);
    pub const PI_HALF: S60 = S60::new(1, 34, 14, 52, 0);
    
    // --- QUANTUM CONSTANTS ---
    pub const DEG_TO_RAD_FACTOR: i128 = 226_152;
    pub const LN_2: i64 = 8_983_187;
    pub const LN_60: i64 = 53_062_706;
    pub const INV_LN2: i64 = 18_698_485;

    // --- QUANTUM PHYSICAL CONSTANTS ---
    pub const AXION_RESONANCE_RATIO: S60 = S60::new(1, 32, 2, 24, 0);
    pub const AXION_FREQUENCY_MHZ: S60 = S60::new(153, 24, 0, 0, 0);

    /// Normalizes angle to [0, 360) and returns (normalized, sign_sin, sign_cos).
    fn normalize_quadrants(angle: S60) -> (S60, i64, i64) {
        let full = S60::SCALE_0 * 360;
        let mut raw = angle.to_raw() % full;
        if raw < 0 {
            raw += full;
        }

        let deg = raw / S60::SCALE_0;
        if deg <= 90 {
            (S60::from_raw(raw), 1, 1)
        } else if deg <= 180 {
            (S60::from_raw(180 * S60::SCALE_0 - raw), 1, -1)
        } else if deg <= 270 {
            (S60::from_raw(raw - 180 * S60::SCALE_0), -1, -1)
        } else {
            (S60::from_raw(360 * S60::SCALE_0 - raw), -1, 1)
        }
    }

    pub fn sin(angle: S60) -> S60 {
        let (norm, s_sin, _) = Self::normalize_quadrants(angle);
        let x = (norm.to_raw() as i128 * Self::DEG_TO_RAD_FACTOR) / S60::SCALE_0 as i128;

        let mut res = x;
        let mut term = x;
        let x_sq = (x * x) / S60::SCALE_0 as i128;

        for i in 1..10 {
            let n = (2 * i) as i128;
            let factorial_part = n * (n + 1);
            term = -(term * x_sq) / (factorial_part * S60::SCALE_0 as i128);
            if term.abs() < 1 {
                break;
            }
            res += term;
        }
        S60::from_raw((res as i64) * s_sin)
    }

    pub fn cos(angle: S60) -> S60 {
        let (norm, _, s_cos) = Self::normalize_quadrants(angle);
        let x = (norm.to_raw() as i128 * Self::DEG_TO_RAD_FACTOR) / S60::SCALE_0 as i128;

        let mut res = S60::SCALE_0 as i128;
        let mut term = S60::SCALE_0 as i128;
        let x_sq = (x * x) / S60::SCALE_0 as i128;

        for i in 1..10 {
            let n = ((2 * i - 1) * (2 * i)) as i128;
            term = -(term * x_sq) / (n * S60::SCALE_0 as i128);
            if term.abs() < 1 {
                break;
            }
            res += term;
        }
        S60::from_raw((res as i64) * s_cos)
    }

    pub fn sqrt(n: S60) -> S60 {
        if n.to_raw() < 0 {
            panic!("S60Math::sqrt applied to negative value");
        }
        if n.to_raw() == 0 {
            return S60::from_raw(0);
        }

        let mut x = if n.to_raw() > S60::SCALE_0 {
            n.to_raw() / 2
        } else {
            S60::SCALE_0
        };
        for _ in 0..15 {
            let next = (x + (n.to_raw() * S60::SCALE_0) / x) / 2;
            if (next - x).abs() < 1 {
                break;
            }
            x = next;
        }
        S60::from_raw(x)
    }

    pub fn exp(x: S60) -> S60 {
        let x_raw = x.to_raw();
        if x_raw == 0 {
            return S60::new(1, 0, 0, 0, 0);
        }

        let mut res = S60::SCALE_0 as i128;
        let mut term = S60::SCALE_0 as i128;

        for i in 1..15 {
            term = (term * x_raw as i128) / (i as i128 * S60::SCALE_0 as i128);
            if term == 0 {
                break;
            }
            res += term;
        }

        S60::from_raw(res as i64)
    }

    pub fn ln(x: S60) -> S60 {
        let x_raw = x.to_raw();
        if x_raw <= 0 {
            panic!("S60Math::ln undefined for x <= 0");
        }
        if x_raw == S60::SCALE_0 {
            return S60::zero();
        }

        let mut m = x_raw;
        let mut k = 0;
        let one = S60::SCALE_0;
        let two = 2 * S60::SCALE_0;

        while m > two {
            m >>= 1;
            k += 1;
        }
        while m < one {
            m <<= 1;
            k -= 1;
        }

        let y_num = (m - S60::SCALE_0) as i128;
        let y_den = (m + S60::SCALE_0) as i128;
        let y = (y_num * S60::SCALE_0 as i128) / y_den;

        let mut res = y;
        let mut term = y;
        let y_sq = (y * y) / S60::SCALE_0 as i128;

        for i in 1..10 {
            let n = (2 * i + 1) as i128;
            term = (term * y_sq) / S60::SCALE_0 as i128;
            let step = term / n;
            if step == 0 {
                break;
            }
            res += step;
        }

        res *= 2;
        let k_factor = k as i128 * Self::LN_2 as i128;
        res += k_factor;

        S60::from_raw(res as i64)
    }

    pub fn from_radians(rad_raw: i64) -> S60 {
        let deg_raw = (rad_raw as i128 * 180) / Self::PI.to_raw() as i128;
        S60::from_raw((deg_raw as i64) * S60::SCALE_0)
    }
}
