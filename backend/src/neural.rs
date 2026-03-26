//! Neural Memory - Spiking Neural Network (SNN) Ring-0 Processor
//! Proporciona detección de patrones bio-inspirada para señales eBPF.

use std::collections::VecDeque;

/// Umbral de disparo (V_threshold) para la neurona Leaky Integrate-and-Fire (LIF)
const LIF_THRESHOLD: f64 = 1.0;
/// Constante de tiempo de decaimiento (Tau)
const LIF_DECAY: f64 = 0.9;

pub struct NeuralMembrane {
    potential: f64,
    spike_history: VecDeque<u64>, // Timestamps de disparos
    capacity: usize,
}

impl NeuralMembrane {
    pub fn new(capacity: usize) -> Self {
        Self {
            potential: 0.0,
            spike_history: VecDeque::with_capacity(capacity),
            capacity,
        }
    }

    /// Procesa una señal de entropía (amplitud) y retorna si hubo un "spike" (alerta)
    pub fn process_signal(&mut self, amplitude: f64, timestamp: u64) -> bool {
        // 1. Integración (Leaky Integrate)
        self.potential = (self.potential * LIF_DECAY) + amplitude;

        // 2. Disparo (Fire)
        if self.potential >= LIF_THRESHOLD {
            self.potential = 0.0; // Reset refractario
            self.spike_history.push_back(timestamp);
            if self.spike_history.len() > self.capacity {
                self.spike_history.pop_front();
            }
            return true;
        }

        false
    }

    /// Retorna la "Tasa de Disparo" (Firing Rate) actual
    pub fn firing_rate(&self) -> f64 {
        if self.spike_history.len() < 2 { return 0.0; }
        let first = *self.spike_history.front().unwrap();
        let last = *self.spike_history.back().unwrap();
        let duration = (last - first) as f64 / 1_000_000_000.0; // Segundos
        if duration == 0.0 { return 0.0; }
        self.spike_history.len() as f64 / duration
    }
}

pub struct NeuralMemory {
    membranes: Vec<NeuralMembrane>,
}

impl NeuralMemory {
    pub fn new(nodes: usize) -> Self {
        let mut membranes = Vec::new();
        for _ in 0..nodes {
            membranes.push(NeuralMembrane::new(100));
        }
        Self { membranes }
    }

    pub fn firing_rate(&self) -> f64 {
        if self.membranes.is_empty() { return 0.0; }
        // Retorna el promedio de la tasa de disparo de toda la red
        let sum: f64 = self.membranes.iter().map(|m| m.firing_rate()).sum();
        sum / (self.membranes.len() as f64)
    }

    pub fn observe(&mut self, node_idx: usize, signal: f64, ts: u64) -> bool {
        if let Some(m) = self.membranes.get_mut(node_idx) {
            return m.process_signal(signal, ts);
        }
        false
    }
}
