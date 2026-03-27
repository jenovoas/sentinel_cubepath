//! predictive.rs - AI Buffer Cascade & Non-Markovian Memory
//! Implementación de telemetría predictiva basada en la métrica S60.

use crate::math::S60;
use std::collections::VecDeque;

#[derive(Debug, Clone)]
pub struct S60Vector {
    pub amplitude: i64,
    pub phase: i64,
    pub entropy: i64,
}

pub struct AIBufferCascade {
    buffer: VecDeque<S60Vector>,
    capacity: usize,
    coherence_threshold: i64,
}

impl AIBufferCascade {
    pub fn new() -> Self {
        Self {
            buffer: VecDeque::with_capacity(360),
            capacity: 360,
            coherence_threshold: 60000,
        }
    }

    pub fn push(&mut self, vec: S60Vector) {
        if self.buffer.len() >= self.capacity {
            self.buffer.pop_front();
        }
        self.buffer.push_back(vec);
    }

    pub fn measure_coherence(&self) -> i64 {
        if self.buffer.is_empty() { return 0; }
        let sum: i64 = self.buffer.iter().map(|v| v.amplitude).sum();
        sum / self.buffer.len() as i64
    }

    pub fn trigger_preventive_healing(&self) -> bool {
        let current = self.measure_coherence();
        current < self.coherence_threshold && self.buffer.len() > 60
    }
}
