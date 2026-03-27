//! # 🛡️ BASE-60 FIXED-POINT: RUST CORE 🛡️
//!
//! Pure sexagesimal arithmetic for Sentinel-Cortex.
//! Base-60 Arithmetic (60^4 accuracy).

use std::fmt;
use std::ops::{Add, Div, Mul, Neg, Rem, Sub};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum S60Error {
    DivisionByZero,
}

impl std::fmt::Display for S60Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            S60Error::DivisionByZero => write!(f, "S60 Division by zero"),
        }
    }
}

impl std::error::Error for S60Error {}

/// Sexagesimal (Base-60) Fixed-Point Number.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub struct S60 {
    pub components: [i64; 5],
}

impl S60 {
    pub const SCALE_0: i64 = 12960000;    // 60^4
    pub const SCALE_1: i64 = 216000;      // 60^3
    pub const SCALE_2: i64 = 3600;        // 60^2
    pub const SCALE_3: i64 = 60;          // 60^1
    pub const SCALE_4: i64 = 1;           // 60^0

    pub const fn new(d: i64, m: i64, s: i64, t: i64, q: i64) -> Self {
        Self { components: [d, m, s, t, q] }
    }

    pub fn from_raw(raw: i64) -> Self {
        let sign = if raw < 0 { -1 } else { 1 };
        let mut val = raw.abs();
        let q = val % 60; val /= 60;
        let t = val % 60; val /= 60;
        let s = val % 60; val /= 60;
        let m = val % 60; val /= 60;
        let d = val;
        Self { components: [d * sign, m * sign, s * sign, t * sign, q * sign] }
    }

    pub fn from_int(i: i64) -> Self { Self::from_raw(i * Self::SCALE_0) }
    pub const fn zero() -> Self { Self { components: [0; 5] } }
    pub const fn one() -> Self { Self { components: [1, 0, 0, 0, 0] } }

    pub fn to_raw(&self) -> i64 {
        let raw_128 = (self.components[0] as i128 * Self::SCALE_0 as i128)
            + (self.components[1] as i128 * Self::SCALE_1 as i128)
            + (self.components[2] as i128 * Self::SCALE_2 as i128)
            + (self.components[3] as i128 * Self::SCALE_3 as i128)
            + (self.components[4] as i128 * Self::SCALE_4 as i128);
        raw_128 as i64
    }

    pub fn abs(&self) -> Self { Self::from_raw(self.to_raw().abs()) }
    pub fn clamp(&self, min: Self, max: Self) -> Self {
        let raw = self.to_raw();
        if raw < min.to_raw() { min }
        else if raw > max.to_raw() { max }
        else { *self }
    }
    pub fn div_safe(&self, other: Self) -> Result<Self, S60Error> {
        let v2 = other.to_raw();
        if v2 == 0 { return Err(S60Error::DivisionByZero); }
        let v1 = self.to_raw() as i128;
        Ok(Self::from_raw(((v1 * Self::SCALE_0 as i128) / v2 as i128) as i64))
    }

    pub fn is_harmonic_ratio(value: Self) -> bool {
        let raw = value.to_raw();
        // Fallback simple harmonic detection: value is multiple of S60::SCALE_4
        raw > 0 && raw % Self::SCALE_4 == 0
    }
}

impl Add for S60 {
    type Output = Self;
    fn add(self, other: Self) -> Self { Self::from_raw(self.to_raw() + other.to_raw()) }
}
impl Sub for S60 {
    type Output = Self;
    fn sub(self, other: Self) -> Self { Self::from_raw(self.to_raw() - other.to_raw()) }
}
impl Mul for S60 {
    type Output = Self;
    fn mul(self, other: Self) -> Self {
        let v1 = self.to_raw() as i128;
        let v2 = other.to_raw() as i128;
        Self::from_raw(((v1 * v2) / Self::SCALE_0 as i128) as i64)
    }
}
impl Div for S60 {
    type Output = Self;
    fn div(self, other: Self) -> Self { self.div_safe(other).expect("Division by zero") }
}
impl Div<i64> for S60 {
    type Output = Self;
    fn div(self, other: i64) -> Self { Self::from_raw(self.to_raw() / other) }
}

impl fmt::Display for S60 {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let c = self.components;
        write!(f, "{};{},{},{},{}", c[0], c[1], c[2], c[3], c[4])
    }
}
