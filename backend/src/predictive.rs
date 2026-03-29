use crate::math::{SPA, SPAMath};
use std::collections::VecDeque;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

/// Vector de Telemetría Cognitiva S60
#[derive(Debug, Clone, Copy, Default)]
pub struct S60Vector {
    pub amplitude: SPA,
    pub phase: SPA,
    pub entropy: SPA,
}

/// Registro Histórico Akáshico (S60)
#[derive(Debug, Clone)]
struct AkashicRecord {
    pub timestamp: SPA,
    pub coherence: SPA,
}

/// Cascada de Buffer de IA (Memoria No-Markoviana)
pub struct AIBufferCascade {
    records: Mutex<VecDeque<AkashicRecord>>,
    pub capacity: usize,
    tau_c: SPA, // Tiempo de correlación (Relajación)
}

impl AIBufferCascade {
    pub fn new() -> Self {
        Self {
            records: Mutex::new(VecDeque::with_capacity(120)), // 2 ciclos YHWH
            capacity: 120,
            tau_c: SPA::new(1, 0, 0, 0, 0), // 1s de tau base
        }
    }

    /// Obtiene el timestamp actual en formato S60 (Segundos;Minutos...)
    fn get_now_s60(&self) -> SPA {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default();
        let secs = now.as_secs();
        let nanos = now.subsec_nanos();
        // Convertimos a base-60 simplificada para el kernel: Segundos + (Nanos as fraction)
        SPA::from_raw(secs as i64 * SPA::SCALE_0 + (nanos as i64 * SPA::SCALE_0 / 1_000_000_000))
    }

    /// Kernel Ornstein-Uhlenbeck Sexagesimal (Yatra Pure)
    /// K(t, s) = (1 / 2tau) * exp(-|t-s| / tau)
    fn memory_kernel(&self, t: SPA, s: SPA) -> SPA {
        let dt = if t > s { t - s } else { s - t };
        
        // 1. Prefactor: 1 / 2tau
        let two_tau = self.tau_c.to_raw() * 2;
        let prefactor = SPA::from_raw(SPA::SCALE_0 * SPA::SCALE_0 / two_tau);
        
        // 2. Exponente: -dt / tau
        let exponent = SPA::from_raw(-(dt.to_raw() * SPA::SCALE_0 / self.tau_c.to_raw()));
        
        // 3. Exponencial S60
        let exp_val = SPAMath::exp(exponent);
        
        prefactor * exp_val
    }

    /// Inserción y Cálculo de Backflow (Memoria Ambiental)
    pub fn push(&self, coherence: SPA) -> SPA {
        let now = self.get_now_s60();
        let mut records = self.records.lock().unwrap();

        // 1. Calcular efecto de memoria (Integral del pasado)
        let mut memory_effect = SPA::zero();
        for record in records.iter() {
            let k_val = self.memory_kernel(now, record.timestamp);
            // El backflow recupera coherencia: efecto = K * record_coherence * 0.5
            memory_effect = memory_effect + (k_val * record.coherence * SPA::new(0, 30, 0, 0, 0));
        }

        // 2. Gestión de ventana deslizante
        if records.len() >= self.capacity {
            records.pop_front();
        }
        records.push_back(AkashicRecord {
            timestamp: now,
            coherence,
        });

        memory_effect
    }

    /// Medición de Coherencia Futura (Predicción No-Markoviana)
    pub fn predict_evolution(&self) -> SPA {
        let records = self.records.lock().unwrap();
        if records.is_empty() { return SPA::zero(); }
        
        // Promedio pesado por el kernel del último estado
        let last = records.back().unwrap();
        let now = self.get_now_s60();
        let weight = self.memory_kernel(now, last.timestamp);
        
        last.coherence * weight
    }
}

impl Default for AIBufferCascade {
    fn default() -> Self {
        Self::new()
    }
}
