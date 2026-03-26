//! BASE-60 FIXED-POINT ARITHMETIC: Sentinel Ring-0 Core
//! Pure sexagesimal integer arithmetic. Zero-allocation, deterministic layout.
//! Precision: 1/12,960,000 per unit (60^-4). No IEEE 754 rounding errors.
//! Reference: Plimpton 322 (Babylonian mathematics, c. 1800 BCE)

use std::fmt;
use std::ops::{Add, Div, Mul, Neg, Rem, Sub};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SPAError {
    DivisionByZero,
}

impl std::error::Error for SPAError {}
impl fmt::Display for SPAError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "SPA Division by zero")
    }
}

/// Sexagesimal (Base-60) Fixed-Point Number.
/// 
/// Implements the mathematical field S60 = {k * 60^-4 | k ∈ ℤ}.
/// Memory layout is `#[repr(C)]` for direct hardware buffer mapping.
/// One unit of `raw` represents 1/12,960,000 of a whole.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
#[repr(C)]
pub struct SPA {
    pub raw: i64,
}

impl SPA {
    pub const SCALE_0: i64 = 12_960_000; // 60^4
    pub const SCALE_1: i64 = 216_000;    // 60^3
    pub const SCALE_2: i64 = 3_600;      // 60^2
    pub const SCALE_3: i64 = 60;         // 60^1

    pub const ZERO: SPA = SPA { raw: 0 };
    pub const ONE: SPA = SPA { raw: 12_960_000 };

    pub const fn new(d: i64, m: i64, s: i64, t: i64, q: i64) -> Self {
        Self { 
            raw: d * 12_960_000 + m * 216_000 + s * 3_600 + t * 60 + q
        }
    }

    pub fn from_raw(raw: i64) -> Self { Self { raw } }
    pub fn from_int(i: i64) -> Self { Self::from_raw(i * Self::SCALE_0) }
    pub fn zero() -> Self { Self::ZERO }
    pub fn one() -> Self { Self::ONE }
    pub fn two_pi() -> Self { Self::new(6, 16, 59, 27, 43) }
    
    pub fn to_raw(&self) -> i64 { self.raw }
    pub fn abs(&self) -> Self { Self::from_raw(self.raw.abs()) }
    
    pub fn div_safe(&self, other: Self) -> Result<Self, SPAError> {
        let v2 = other.raw;
        if v2 == 0 { return Err(SPAError::DivisionByZero); }
        let v1 = self.raw as i128;
        Ok(Self::from_raw(((v1 * Self::SCALE_0 as i128) / v2 as i128) as i64))
    }

    /// Checks if a value belongs to the sacred harmonic set (Plimpton 322)
    pub fn is_harmonic_ratio(val: SPA) -> bool {
        // Known sacred ratios from TruthSync/Plimpton 322
        let ratios = [
            Self::new(1, 32, 2, 24, 0), // Row 12 (Axionic)
            Self::new(1, 30, 0, 0, 0),    // True (3/2)
            Self::new(1, 20, 0, 0, 0),    // Maybe (4/3)
            Self::new(10, 5, 6, 5, 0),   // Reference (QHC)
        ];
        ratios.iter().any(|&r| (r.raw - val.raw).abs() < 100)
    }
}

// --- ARITHMETIC ---
impl Add for SPA {
    type Output = Self;
    fn add(self, other: Self) -> Self { Self::from_raw(self.raw.wrapping_add(other.raw)) }
}
impl Sub for SPA {
    type Output = Self;
    fn sub(self, other: Self) -> Self { Self::from_raw(self.raw.wrapping_sub(other.raw)) }
}
impl Mul for SPA {
    type Output = Self;
    fn mul(self, other: Self) -> Self {
        let v1 = self.raw as i128;
        let v2 = other.raw as i128;
        Self::from_raw(((v1 * v2) / Self::SCALE_0 as i128) as i64)
    }
}
impl Mul<i64> for SPA {
    type Output = Self;
    fn mul(self, rhs: i64) -> Self { Self::from_raw(self.raw.wrapping_mul(rhs)) }
}
impl Div for SPA {
    type Output = Self;
    fn div(self, other: Self) -> Self {
        let v2 = other.raw;
        if v2 == 0 { panic!("SPA Division by zero"); }
        let v1 = self.raw as i128;
        Self::from_raw(((v1 * Self::SCALE_0 as i128) / v2 as i128) as i64)
    }
}
impl Div<i64> for SPA {
    type Output = Self;
    fn div(self, rhs: i64) -> Self {
        if rhs == 0 { panic!("SPA Division by zero"); }
        Self::from_raw(self.raw / rhs)
    }
}
impl Neg for SPA {
    type Output = Self;
    fn neg(self) -> Self { Self::from_raw(-self.raw) }
}

// --- MATH FUNCTIONS ---
pub struct SPAMath;
impl SPAMath {
    pub const PI: SPA = SPA::new(3, 8, 29, 44, 0);
    pub const TWO_PI: SPA = SPA::new(6, 16, 59, 28, 0);
    pub const DEG_TO_RAD_FACTOR: i128 = 226_152;

    pub fn sin(angle: SPA) -> SPA {
        let full = SPA::SCALE_0 * 360;
        let mut raw = angle.raw % full;
        if raw < 0 { raw += full; }
        
        let mut s_sin = 1;
        let deg = raw / SPA::SCALE_0;
        let mut norm_raw = raw;

        if deg <= 90 {
            norm_raw = raw;
        } else if deg <= 180 {
            norm_raw = 180 * SPA::SCALE_0 - raw;
        } else if deg <= 270 {
            norm_raw = raw - 180 * SPA::SCALE_0;
            s_sin = -1;
        } else {
            norm_raw = 360 * SPA::SCALE_0 - raw;
            s_sin = -1;
        }

        let x = (norm_raw as i128 * Self::DEG_TO_RAD_FACTOR) / SPA::SCALE_0 as i128;
        let mut res = x;
        let mut term = x;
        let x_sq = (x * x) / SPA::SCALE_0 as i128;

        for i in 1..10 {
            let n = (2 * i) as i128;
            let factorial_part = n * (n + 1);
            term = -(term * x_sq) / (factorial_part * SPA::SCALE_0 as i128);
            if term.abs() < 1 { break; }
            res += term;
        }
        SPA::from_raw((res as i64) * s_sin)
    }
}

impl fmt::Display for SPA {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let raw = self.raw;
        let sign = if raw < 0 { "-" } else { "" };
        let mut val = raw.abs();
        let q = val % 60; val /= 60;
        let t = val % 60; val /= 60;
        let s = val % 60; val /= 60;
        let m = val % 60; val /= 60;
        let d = val;
        write!(f, "{}{};{},{},{},{}", sign, d, m, s, t, q)
    }
}

impl fmt::Debug for SPA {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result { write!(f, "SPA[{}]", self) }
}
