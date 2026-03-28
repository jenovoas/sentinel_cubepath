//! 🛡️ QUANTUM SCHEDULER V2 (S60 Edition)
//! Basado en el Experimento EXP-029-V2 (Eficiencia 94.4%)
//! 
//! Optimiza el procesamiento de eventos eBPF según la resonancia del portal.

use crate::math::S60;
use std::collections::VecDeque;

#[derive(Default)]
pub struct QuantumScheduler {
    queue: VecDeque<u32>, // IDs o PIDs de eventos pendientes
    overflow_limit: usize,
    pre_flush_threshold: usize,
    last_reset_tick: u64,
}

impl QuantumScheduler {
    pub fn new() -> Self {
        Self {
            queue: VecDeque::with_capacity(32),
            overflow_limit: 20,         // Tanque de expansión V2
            pre_flush_threshold: 12,    // Válvula de alivio V2
            last_reset_tick: 0,
        }
    }

    /// Calcula la cantidad de tareas a ejecutar según la intensidad de resonancia (Pág. 113 EXP-029V2)
    pub fn get_adaptive_batch_size(&self, resonance: S60) -> usize {
        let raw = resonance.to_raw();
        let scale = 12_960_000; // SCALE_0

        if raw > (scale * 90 / 100) {      5 // Portal Muy Fuerte
        } else if raw > (scale * 85 / 100) { 4 // Portal Fuerte
        } else if raw > (scale * 80 / 100) { 3 // Portal Normal
        } else if raw > (scale * 75 / 100) { 2 // Portal Débil
        } else {                             0 // Disonancia (Enfriamiento)
        }
    }

    pub fn push_event(&mut self, pid: u32) {
        if self.queue.len() < self.overflow_limit {
            self.queue.push_back(pid);
        } else {
            // Emergency Flush (Overflow)
            self.queue.pop_front();
            self.queue.push_back(pid);
        }
    }

    pub fn tick_schedule(&mut self, tick: u64, resonance: S60) -> Vec<u32> {
        let mut to_process = Vec::new();
        
        // V2: Pre-Flush Check (T=60s del ciclo de 68s)
        // El Oscilador Isócrono funciona a ~41.7713 Hz (23,939,835 ns por tick)
        // 68s = 2840 ticks. 60s = 2506 ticks.
        let cycle_pos = tick % 2840;
        if cycle_pos == 2506 && self.queue.len() > self.pre_flush_threshold {
            // Forzar vaciado parcial antes del QHC Reset
            for _ in 0..5 {
                if let Some(pid) = self.queue.pop_front() {
                    to_process.push(pid);
                }
            }
        }

        // Batch Adaptativo normal
        let batch_size = self.get_adaptive_batch_size(resonance);
        for _ in 0..batch_size {
            if let Some(pid) = self.queue.pop_front() {
                to_process.push(pid);
            }
        }

        to_process
    }

    pub fn get_queue_load(&self) -> usize {
        self.queue.len()
    }
}
