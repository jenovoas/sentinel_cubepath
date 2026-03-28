//! PROTOCOLO YATRA PURO: PROHIBIDO DECIMALES (f32/f64). SOLO ARITMÉTICA S60.
//! SOBERANÍA MATEMÁTICA ABSOLUTA - RING-0 LOCKDOWN.
use super::s60::S60;

pub struct S60Math;

impl S60Math {
    pub const PI: S60 = S60::from_raw(40_715_040); // PI * 60^4 approx
    pub const PI_2: S60 = S60::from_raw(20_357_520);

    pub fn sin(x: S60) -> S60 {
        let x_raw = x.to_raw() % (2 * Self::PI.to_raw());
        let x_norm = if x_raw > Self::PI.to_raw() { x_raw - 2 * Self::PI.to_raw() } 
                     else if x_raw < -Self::PI.to_raw() { x_raw + 2 * Self::PI.to_raw() } 
                     else { x_raw };
        
        let x_s60 = S60::from_raw(x_norm);
        let x_sq = x_s60 * x_s60;
        let mut result = x_s60;
        let mut term = x_s60;

        for i in (3..11).step_by(2) {
            term = (term * x_sq).div_safe(S60::from_int((i * (i - 1)) as i64));
            if (i - 3) % 4 == 0 { result = result - term; } 
            else { result = result + term; }
            if term.to_raw() == 0 { break; }
        }
        result
    }

    pub fn cos(x: S60) -> S60 {
        Self::sin(S60::from_raw(Self::PI_2.to_raw() - x.to_raw()))
    }

    pub fn sqrt(x: S60) -> S60 {
        if x.to_raw() <= 0 { return S60::zero(); }
        let mut res = x;
        for _ in 0..8 {
            res = (res + x.div_safe(res)).div_safe(S60::from_int(2));
        }
        res
    }
}
