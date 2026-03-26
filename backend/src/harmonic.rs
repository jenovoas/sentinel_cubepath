//! HARMONIC LOGIC: Harmonic Processor Core
//!
//! Reemplaza la lógica binaria con Lógica Armónica (Consonancia/Disonancia).

use crate::math::SPA;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum LogicState {
    Unison,    // 1:1 -> Nirvana
    True,      // 3:2 -> Perfect Fifth
    False,     // Tritone -> Dissonance
    Maybe,     // 4:3 -> Tension
    Reference, // 10;5,6,5 -> Override
    Noise,     // Unknown
}

#[derive(Debug, Clone, Copy)]
pub struct HarmonicState {
    pub ratio: SPA,
    pub phase: SPA,
    pub energy: u32,
}

impl HarmonicState {
    pub fn new(d: i64, m: i64, s: i64) -> Self {
        Self {
            ratio: SPA::new(d, m, s, 0, 0),
            phase: SPA::zero(),
            energy: 100,
        }
    }

    pub fn logic_true() -> Self { Self::new(1, 30, 0) }
    pub fn logic_false() -> Self { Self::new(1, 24, 22) }
    pub fn logic_maybe() -> Self { Self::new(1, 20, 0) }
    
    /// El Gran Secreto: Yod-He-Vav-He (10-5-6-5)
    pub fn logic_ref() -> Self { Self::new(10, 5, 6) }

    pub fn evaluate_logic(&self) -> LogicState {
        let val = self.ratio.raw;
        let true_val = Self::logic_true().ratio.raw;
        let maybe_val = Self::logic_maybe().ratio.raw;
        let ref_val = Self::logic_ref().ratio.raw;
        let false_val = Self::logic_false().ratio.raw;
        let tolerance = 32_400; // 0;0,9,0 (9 arcseconds) - Ultra Precision

        if (val - ref_val).abs() < tolerance {
            LogicState::Reference
        } else if (val - SPA::SCALE_0).abs() < tolerance {
            LogicState::Unison
        } else if (val - true_val).abs() < tolerance {
            LogicState::True
        } else if (val - maybe_val).abs() < tolerance {
            LogicState::Maybe
        } else if (val - false_val).abs() < tolerance * 2 {
            LogicState::False
        } else {
            LogicState::Noise
        }
    }
}

/// The Harmonic Processor
/// Process logic streams using Harmonic Interference
pub struct HarmonicProcessor {
    context: HarmonicState,
    tick: u64,
}

impl HarmonicProcessor {
    pub fn new() -> Self {
        Self {
            context: HarmonicState::logic_true(),
            tick: 0,
        }
    }

    pub fn process_signal(&mut self, input: HarmonicState) -> LogicState {
        self.tick += 1;
        // Simulación de interacción armónica
        let logic = input.evaluate_logic();
        if logic == LogicState::True || logic == LogicState::Unison {
            self.context = input;
        }
        logic
    }
}
