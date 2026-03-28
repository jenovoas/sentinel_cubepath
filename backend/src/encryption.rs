//! Dynamic Encryption Layer (Cognitive Pulse)
//! 
//! Proyecta una nueva capa de encriptación en cada latido (pulse) del sistema,
//! derivada matemáticamente de los estados de las memorias Neuronal (SNN) y Resonante (RMM).

use crate::neural::NeuralMemory;
use crate::resonant::ResonantMemory;
use crate::math::S60;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Default)]
pub struct DynamicEncryption {
    pub current_layer_hash: String,
}

impl DynamicEncryption {
    pub fn new() -> Self {
        Self {
            current_layer_hash: String::from("INIT_S60_SHIELD"),
        }
    }

    /// Genera una nueva llave dinámica ("Pulse") basada en el estado cognitivo
    pub fn pulse(&mut self, neural: &NeuralMemory, resonant: &ResonantMemory) -> String {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos() as u64;
            
        let spike_rate = neural.firing_rate();
        let coherence = resonant.get_coherence();

        // Simple Plimpton-inspired Hash (Base-60 Math)
        // Combina timestamp, actividad neuronal (spikes) y coherencia resonante
        let spike_factor = spike_rate.to_raw().max(0) as u64;
        let mixed_seed = timestamp.wrapping_add(spike_factor).wrapping_add(coherence);
        
        // Inyectamos el valor en nuestra aritmética S60 (Base-60)
        let mut spa_val = S60::from_raw(mixed_seed as i64);
        
        // Multiplicador caótico pero determinista basado en el Ratio de Plimpton 322 (Fila 1)
        spa_val = spa_val * S60::from_raw(21923999); 
        
        // Formateo a una representación hexadecimal fuerte que sirve como llave simétrica
        self.current_layer_hash = format!("S60_SHIELD_{:016x}", spa_val.to_raw().abs());
        
        self.current_layer_hash.clone()
    }
}
