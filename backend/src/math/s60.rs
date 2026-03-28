//! PROTOCOLO YATRA PURO: PROHIBIDO DECIMALES (f32/f64). SOLO ARITMÉTICA S60.
//! SOBERANÍA MATEMÁTICA ABSOLUTA - RING-0 LOCKDOWN.
use serde::{Deserialize, Serialize};
use std::ops::{Add, Div, Mul, Sub};

#[derive(Serialize, Deserialize, Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct S60 {
    raw: i128,
}

impl S60 {
    pub const SCALE: i128 = 12_960_000; // 60^4

    pub const fn from_raw(raw: i128) -> Self { Self { raw } }
    pub const fn from_int(v: i64) -> Self { Self { raw: v as i128 * Self::SCALE } }
    pub const fn zero() -> Self { Self { raw: 0 } }
    pub const fn one() -> Self { Self { raw: Self::SCALE } }

    pub fn to_raw(&self) -> i128 { self.raw }

    pub fn div_safe(self, other: Self) -> Self {
        if other.raw == 0 { Self::zero() } 
        else { Self::from_raw((self.raw * Self::SCALE) / other.raw) }
    }
}

impl Add for S60 { type Output = Self; fn add(self, other: Self) -> Self { Self::from_raw(self.raw + other.raw) } }
impl Sub for S60 { type Output = Self; fn sub(self, other: Self) -> Self { Self::from_raw(self.raw - other.raw) } }
impl Mul for S60 { type Output = Self; fn mul(self, other: Self) -> Self { Self::from_raw((self.raw * other.raw) / Self::SCALE) } }
