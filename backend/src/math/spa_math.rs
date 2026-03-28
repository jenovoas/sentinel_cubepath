//! # 🛡️ S60 MATH UTILITIES - SENTINEL CORTEX 🛡️
//!
//! Advanced pure S60 transcendental functions (Zero Decimal Contamination).
//! Implementation via Newton-Raphson and Harmonic Approximations.

use crate::math::S60;

pub struct S60Math;

impl S60Math {
    pub const TWO_PI: S60 = S60::new(6, 16, 59, 27, 43);
    pub const PI: S60 = S60::new(3, 8, 29, 43, 52); // S60 precision PI

    /// S60 Natural Logarithm (Logaritmo Natural S60) - Pure S60 Implementation
    /// Using binary range reduction and power series: ln(x) = ln(2^k * f) = k*ln(2) + ln(f)
    pub fn ln(x: S60) -> S60 {
        let raw = x.to_raw();
        if raw <= 0 { return S60::zero(); }
        if raw == S60::SCALE_0 { return S60::zero(); }

        // Constants in S60
        let ln2 = S60::new(0, 41, 35, 18, 51); // ln(2) approx
        
        // Range reduction: find k such that 0.5 <= f < 1.0 (raw scale)
        let mut k: i64 = 0;
        let mut f_raw = raw;
        
        while f_raw < S60::SCALE_0 / 2 {
            f_raw <<= 1;
            k -= 1;
        }
        while f_raw >= S60::SCALE_0 {
            f_raw >>= 1;
            k += 1;
        }

        let f = S60::from_raw(f_raw);
        // Series for ln(f) where f is in [0.5, 1.0]
        // ln(x) = 2 * (z + z^3/3 + z^5/5 + ...) where z = (f-1)/(f+1)
        let one = S60::one();
        let num = f - one;
        let den = f + one;
        
        if let Ok(z) = num.div_safe(den) {
            let z2 = z * z;
            let mut sum = z;
            let mut current_z = z;
            
            for i in (3..15).step_by(2) {
                current_z = current_z * z2;
                sum = sum + (current_z / i);
            }
            
            let two = S60::from_int(2);
            let ln_f = sum * two;
            let k_ln2 = ln2 * S60::from_int(k);
            
            k_ln2 + ln_f
        } else {
            S60::zero()
        }
    }

    /// S60 Square Root (Raíz Cuadrada S60) - Pure Newton-Raphson (Zero f64)
    pub fn sqrt(x: S60) -> S60 {
        let x_raw = x.to_raw();
        if x_raw <= 0 { return S60::zero(); }
        if x_raw == S60::SCALE_0 { return S60::one(); }

        let _two = S60::from_int(2);
        // Integer initial guess via bit count
        let guess_raw = 1 << ((64 - x_raw.leading_zeros() + 24) / 2);
        let mut guess = S60::from_raw(guess_raw);

        for _ in 0..8 {
            if let Ok(div) = x.div_safe(guess) {
                let next_guess = (guess + div) / 2;
                if (next_guess.to_raw() - guess.to_raw()).abs() < 1 {
                    return next_guess;
                }
                guess = next_guess;
            } else {
                break;
            }
        }
        guess
    }

    pub fn sin(x: S60) -> S60 {
        // Normalización al rango [0, TWO_PI)
        let two_pi_raw = Self::TWO_PI.to_raw();
        let mut x_raw = x.to_raw() % two_pi_raw;
        if x_raw < 0 { x_raw += two_pi_raw; }

        // S60 Symmetries for [0, 2PI)
        let pi_raw = Self::PI.to_raw();
        let pi_half_raw = pi_raw / 2;

        let (final_x_raw, sign) = if x_raw <= pi_half_raw {
            (x_raw, 1)
        } else if x_raw <= pi_raw {
            (pi_raw - x_raw, 1)
        } else if x_raw <= pi_raw + pi_half_raw {
            (x_raw - pi_raw, -1)
        } else {
            (two_pi_raw - x_raw, -1)
        };

        let x_s60 = S60::from_raw(final_x_raw);
        let mut result = x_s60;
        let mut term = x_s60;
        let x_sq = x_s60 * x_s60;

        // Optimized Taylor for Ring-0
        for i in (3..13).step_by(2) {
            term = (term * x_sq) / (i * (i - 1));
            if (i - 3) % 4 == 0 {
                result = result - term;
            } else {
                result = result + term;
            }
            if term.to_raw() == 0 { break; }
        }

        if sign < 0 { S60::from_raw(-result.to_raw()) } else { result }
    }

    pub fn cos(x: S60) -> S60 {
        // cos(x) = sin(PI/2 - x)
        let pi_half = S60::from_raw(Self::PI.to_raw() / 2);
        Self::sin(pi_half - x)
    }

    pub fn abs(x: S60) -> S60 {
        S60::from_raw(x.to_raw().abs())
    }
}
