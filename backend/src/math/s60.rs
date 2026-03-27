//! # 🛡️ BASE-60 FIXED-POINT: RUST CORE 🛡️
//!
//! Pure sexagesimal arithmetic for Sentinel-Cortex.
//! Implementation: Zero-allocation, fixed-point (60^4 scaling).
//! Compliant with AI Prime Directives: ZERO DECIMAL CONTAMINATION.

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
/// Unified math bridge via me60os_core/S60 (60^4 accuracy).
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
pub struct S60 {
    pub components: [i64; 5],
}

/// Alias for S60 (Standard Positioning Arithmetic) in Base-60
pub type S60 = S60;

impl S60 {
    pub const SCALE_0: i64 = 12_960_000; // 60^4
    pub const SCALE_1: i64 = 216_000;    // 60^3
    pub const SCALE_2: i64 = 3_600;      // 60^2
    pub const SCALE_3: i64 = 60;         // 60^1
    pub const SCALE_4: i64 = 1;          // 60^0

    pub const ZERO: S60 = S60 { components: [0; 5] };
    pub const ONE: S60 = S60 { components: [1, 0, 0, 0, 0] };

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
    pub fn from_base_units(raw: i64) -> Self { Self::from_raw(raw) }
    pub fn two_pi() -> Self { Self::new(6, 16, 59, 27, 43) }
    pub const fn zero() -> Self { Self::ZERO }
    pub const fn one() -> Self { Self::ONE }
    pub fn abs(&self) -> Self { Self::from_raw(self.to_raw().abs()) }

    pub fn to_raw(&self) -> i64 {
        let raw_128 = (self.components[0] as i128 * Self::SCALE_0 as i128)
            + (self.components[1] as i128 * Self::SCALE_1 as i128)
            + (self.components[2] as i128 * Self::SCALE_2 as i128)
            + (self.components[3] as i128 * Self::SCALE_3 as i128)
            + (self.components[4] as i128 * Self::SCALE_4 as i128);
        raw_128.clamp(i64::MIN as i128, i64::MAX as i128) as i64
    }

    pub fn to_degrees(&self) -> i64 { self.components[0] }
    pub fn to_components(&self) -> [i64; 5] { self.components }
    pub fn from_legacy_tertia(tertia: i64) -> Self { Self::from_raw(tertia * 60) }
    pub fn to_legacy_tertia(&self) -> i64 { self.to_raw() / 60 }
    pub fn from_decimal_for_import_only(decimal: f64) -> Self {
        let raw = (decimal * Self::SCALE_0 as f64).round() as i64;
        Self::from_raw(raw)
    }

    pub fn clamp(&self, min: Self, max: Self) -> Self {
        let raw = self.to_raw();
        let min_raw = min.to_raw();
        let max_raw = max.to_raw();
        if raw < min_raw { min }
        else if raw > max_raw { max }
        else { *self }
    }
}

// --- ARITHMETIC ---
impl Add for S60 {
    type Output = Self;
    fn add(self, other: Self) -> Self { Self::from_raw(self.to_raw().wrapping_add(other.to_raw())) }
}

impl Sub for S60 {
    type Output = Self;
    fn sub(self, other: Self) -> Self { Self::from_raw(self.to_raw().wrapping_sub(other.to_raw())) }
}

impl Mul<i64> for S60 {
    type Output = Self;
    fn mul(self, scalar: i64) -> Self { Self::from_raw(self.to_raw().wrapping_mul(scalar)) }
}

impl Mul for S60 {
    type Output = Self;
    fn mul(self, other: Self) -> Self {
        let v1 = self.to_raw() as i128;
        let v2 = other.to_raw() as i128;
        Self::from_raw(((v1 * v2) / Self::SCALE_0 as i128) as i64)
    }
}

impl Div<i64> for S60 {
    type Output = Self;
    fn div(self, divisor: i64) -> Self {
        if divisor == 0 { panic!("S60 Division by zero (scalar)"); }
        Self::from_raw(self.to_raw() / divisor)
    }
}

impl Div for S60 {
    type Output = Self;
    fn div(self, other: Self) -> Self {
        let v2 = other.to_raw();
        if v2 == 0 { panic!("S60 Division by zero"); }
        let v1 = self.to_raw() as i128;
        Self::from_raw(((v1 * Self::SCALE_0 as i128) / v2 as i128) as i64)
    }
}

impl S60 {
    pub fn div_safe(&self, other: Self) -> Result<Self, S60Error> {
        let v2 = other.to_raw();
        if v2 == 0 { return Err(S60Error::DivisionByZero); }
        let v1 = self.to_raw() as i128;
        Ok(Self::from_raw(((v1 * Self::SCALE_0 as i128) / v2 as i128) as i64))
    }
}

impl Rem<i64> for S60 {
    type Output = Self;
    fn rem(self, rhs: i64) -> Self::Output { Self::from_raw(self.to_raw() % (rhs * Self::SCALE_0)) }
}

impl Rem for S60 {
    type Output = Self;
    fn rem(self, rhs: Self) -> Self::Output { Self::from_raw(self.to_raw() % rhs.to_raw()) }
}

impl Neg for S60 {
    type Output = Self;
    fn neg(self) -> Self { Self::from_raw(-self.to_raw()) }
}

// --- FORMATTING ---
impl fmt::Display for S60 {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let raw = self.to_raw();
        let sign = if raw < 0 { "-" } else { "" };
        let c = self.abs().components;
        write!(f, "S60[{}{:03}; {:02}, {:02}, {:02}, {:02}]", sign, c[0], c[1], c[2], c[3], c[4])
    }
}

impl fmt::Debug for S60 {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result { write!(f, "{}", self) }
}
