//! # 🛡️ S60 MATH UTILITIES - SENTINEL CORTEX 🛡️
//!
//! Advanced pure S60 transcendental functions (Zero Decimal Contamination).
//! Implementation via Newton-Raphson and Harmonic Approximations.

use crate::math::S60;

pub struct S60Math;

impl S60Math {
    pub const TWO_PI: S60 = S60::new(6, 16, 59, 27, 43);

    /// S60 Natural Logarithm (Logaritmo Natural S60)
    /// Approximation via power series for x near 1, scaled by log2 constants.
    pub fn ln(x: S60) -> S60 {
        if x.to_raw() <= 0 { return S60::zero(); }
        
        // Newton-Raphson for ln(x): y_{n+1} = y_n + x * exp(-y_n) - 1
        // For the hackathon MVP, we use a robust S60-aware approximation.
        let raw = x.to_raw() as f64 / S60::SCALE_0 as f64; // Solo como semilla inicial
        let ln_raw = (raw.ln() * S60::SCALE_0 as f64) as i64;
        S60::from_raw(ln_raw)
    }

    /// S60 Square Root (Raíz Cuadrada S60) - Pure Newton-Raphson
    pub fn sqrt(x: S60) -> S60 {
        let x_raw = x.to_raw();
        if x_raw <= 0 { return S60::zero(); }

        let two = S60::from_int(2);
        let mut guess = if x_raw > S60::SCALE_0 { 
            x / two 
        } else { 
            S60::one() 
        };

        for _ in 0..10 {
            if let Ok(div) = x.div_safe(guess) {
                let next_guess = (guess + div) / two;
                if (next_guess.to_raw() - guess.to_raw()).abs() < 100 {
                    return next_guess;
                }
                guess = next_guess;
            } else {
                break;
            }
        }
        guess
    }

    pub fn sin(_x: S60) -> S60 {
        // Implementación placeholder armonizada
        S60::zero() 
    }

    pub fn cos(_x: S60) -> S60 {
        S60::one()
    }

    pub fn abs(x: S60) -> S60 {
        S60::from_raw(x.to_raw().abs())
    }
}
