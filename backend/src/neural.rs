//! Neural Memory - Spiking Neural Network (SNN) Ring-0 Processor
//! Proporciona detección de patrones bio-inspirada para señales eBPF.
//! Migrado a S60 puro — sin floats (Protocolo Yatra).

use std::collections::VecDeque;
use crate::math::S60;

/// Umbral de disparo (V_threshold): 1.0 en S60
const LIF_THRESHOLD: S60 = S60::new(1, 0, 0, 0, 0);
/// Constante de decaimiento (Tau): 54/60 ≈ 0.9 en S60
const LIF_DECAY: S60 = S60::new(0, 54, 0, 0, 0);

pub struct NeuralMembrane {
    potential: S60,
    spike_history: VecDeque<u64>, // Ticks de disparo (global_tick)
    capacity: usize,
}

impl NeuralMembrane {
    pub fn new(capacity: usize) -> Self {
        Self {
            potential: S60::zero(),
            spike_history: VecDeque::with_capacity(capacity),
            capacity,
        }
    }

    /// Procesa una señal de entropía (amplitud S60) y retorna si hubo un spike.
    pub fn process_signal(&mut self, amplitude: S60, timestamp: u64) -> bool {
        // Leaky Integrate: V = V * decay + amplitude
        self.potential = self.potential * LIF_DECAY + amplitude;

        // Fire: si V >= threshold, disparar y resetear
        if self.potential.to_raw() >= LIF_THRESHOLD.to_raw() {
            self.potential = S60::zero();
            self.spike_history.push_back(timestamp);
            if self.spike_history.len() > self.capacity {
                self.spike_history.pop_front();
            }
            return true;
        }

        false
    }

    /// Tasa de disparo: spikes / duración_en_ticks, expresada como fracción S60.
    pub fn firing_rate(&self) -> S60 {
        if self.spike_history.len() < 2 { return S60::zero(); }
        let first = *self.spike_history.front().unwrap();
        let last = *self.spike_history.back().unwrap();
        let duration = last.saturating_sub(first);
        if duration == 0 { return S60::zero(); }
        let count = self.spike_history.len() as i64;
        S60::from_raw(count * S60::SCALE_0 / duration as i64)
    }
}

pub struct NeuralMemory {
    membranes: Vec<NeuralMembrane>,
}

impl NeuralMemory {
    pub fn new(nodes: usize) -> Self {
        Self {
            membranes: (0..nodes).map(|_| NeuralMembrane::new(100)).collect(),
        }
    }

    /// Promedio de la tasa de disparo de toda la red (S60).
    pub fn firing_rate(&self) -> S60 {
        if self.membranes.is_empty() { return S60::zero(); }
        let sum = self.membranes.iter().fold(S60::zero(), |acc, m| acc + m.firing_rate());
        S60::from_raw(sum.to_raw() / self.membranes.len() as i64)
    }

    pub fn observe(&mut self, node_idx: usize, signal: S60, ts: u64) -> bool {
        if let Some(m) = self.membranes.get_mut(node_idx) {
            return m.process_signal(signal, ts);
        }
        false
    }
}
