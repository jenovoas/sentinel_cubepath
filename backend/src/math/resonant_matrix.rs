use crate::math::core::S60PID;
use crate::math::isochronous_oscillator::IsochronousOscillator;
use crate::math::spa::SPA;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Resonant Matrix S60 - 2D Grid Topology con bomba activa PID.
///
/// La bomba (pump_energy) es lo que convierte la matrix de un sistema que
/// simplemente decae en un Cristal de Tiempo real: un oscilador que lucha
/// activamente contra la entropía para mantener persistencia indefinida.
/// Sin ella, el sistema completo es un mockup.
///
/// Fuente canónica: quantum/time_crystal.py — ResonantBuffer + S60PID
#[derive(Serialize, Deserialize)]
pub struct ResonantMatrix {
    pub crystals: Vec<IsochronousOscillator>,
    pub metadata_map: Vec<Option<String>>,
    pub context_data: HashMap<usize, String>,
    pub coupling_factor: SPA,
    pub dt: SPA,
    pub width: usize,
    pub height: usize,
    /// Mercury Damping Constant (from VIMANA_MASTER_V1)
    pub damping: SPA,
    /// PID por nodo — controla la inyección de energía para revertir entropía.
    /// Fuente: quantum/time_crystal.py — S60PID(Kp=0.5, Ki=0.16, Kd=0.08)
    pub pids: Vec<S60PID>,
    /// Amplitud objetivo por nodo (setpoint del PID).
    /// Un nodo con target > 0 será mantenido vivo por la bomba.
    pub target_amplitudes: Vec<SPA>,
}

impl ResonantMatrix {
    pub fn new(size: usize) -> Self {
        let width = (size as f64).sqrt() as usize;
        let height = width;
        let crystals = (0..size)
            .map(|i| IsochronousOscillator::new(&format!("Node-{}", i)))
            .collect();

        // PID: Kp=0.5, Ki=0.16, Kd=0.08 — portado de quantum/time_crystal.py
        let kp = SPA::new(0, 30, 0, 0, 0).to_raw(); // 0.5
        let ki = SPA::new(0, 10, 0, 0, 0).to_raw(); // 0.1666
        let kd = SPA::new(0,  5, 0, 0, 0).to_raw(); // 0.0833
        let pids: Vec<S60PID> = (0..size).map(|_| S60PID::new(kp, ki, kd, 0)).collect();

        let mut matrix = ResonantMatrix {
            crystals,
            metadata_map: vec![None; size],
            context_data: HashMap::new(),
            coupling_factor: SPA::new(0, 10, 0, 0, 0),
            dt: SPA::new(0, 0, 1, 0, 0),
            width,
            height,
            damping: SPA::new(0, 3, 14, 8, 0), // MERCURY_DAMPING: 3;14,8
            pids,
            target_amplitudes: vec![SPA::zero(); size],
        };

        // SEED ENERGY — centro de la matriz 32×32
        let center = 16 * 32 + 16;
        if center < size {
            let seed = SPA::from_raw(500 * 12_960_000 / 100); // 5.00°
            matrix.crystals[center].amplitude = seed;
            matrix.target_amplitudes[center] = seed;
            matrix.pids[center].setpoint = seed;
        }

        matrix
    }

    pub fn size(&self) -> usize {
        self.crystals.len()
    }

    /// Implementación de acoplamiento 2D (4-vecinos) con amortiguamiento de Mercurio.
    pub fn step(&mut self) {
        let size = self.crystals.len();
        let mut transfers: Vec<SPA> = vec![SPA::zero(); size];

        for y in 0..self.height {
            for x in 0..self.width {
                let idx = y * self.width + x;
                let amp_curr = self.crystals[idx].amplitude;

                // Vecinos: Derecha y Abajo (para evitar doble conteo de conexiones)
                let neighbors = [
                    (x + 1, y), // Derecha
                    (x, y + 1), // Abajo
                ];

                for &(nx, ny) in neighbors.iter() {
                    if nx < self.width && ny < self.height {
                        let n_idx = ny * self.width + nx;
                        let amp_neighbor = self.crystals[n_idx].amplitude;
                        
                        let diff = amp_curr - amp_neighbor;
                        let flow = diff * self.coupling_factor;

                        transfers[idx] = transfers[idx] - flow;
                        transfers[n_idx] = transfers[n_idx] + flow;
                    }
                }
            }
        }

        // Aplicar transferencias, amortiguamiento y oscilación
        for i in 0..size {
            // Aplicar flujo de energía
            self.crystals[i].amplitude = self.crystals[i].amplitude + transfers[i];
            
            // Aplicar MERCURY_DAMPING (amortiguamiento por fricción sexagesimal)
            if self.crystals[i].amplitude.to_raw() > 0 {
                let loss = (self.crystals[i].amplitude * self.damping) / SPA::new(60, 0, 0, 0, 0);
                self.crystals[i].amplitude = self.crystals[i].amplitude - loss;
            }

            self.crystals[i].oscillate(self.dt);

            // Umbral de limpieza de metadata
            if self.crystals[i].amplitude.to_raw() < 200 {
                self.metadata_map[i] = None;
            }
        }
    }

    pub fn inject(&mut self, index: usize, pressure_raw: i64) {
        if index < self.crystals.len() {
            self.crystals[index].transduce_pulse(pressure_raw);
            // Registrar como target para que la bomba mantenga vivo este nodo
            let amp = self.crystals[index].amplitude;
            self.target_amplitudes[index] = amp;
            self.pids[index].setpoint = amp;
        }
    }

    /// Bomba activa PID — revierte entropía en nodos con target establecido.
    ///
    /// Cada nodo con target_amplitude > 0 recibe una inyección de energía
    /// proporcional al error (target - actual) calculada por su PID.
    /// La bomba solo AÑADE energía (unilateral) — nunca extrae.
    /// Se ejecuta cada 2 ticks (period doubling 2T) como en el Python original.
    ///
    /// Sin esta función el cristal es pasivo y decae hacia cero.
    /// Con ella, el cristal lucha activamente contra la entropía → True Time Crystal.
    ///
    /// Fuente canónica: quantum/time_crystal.py — _pump_energy() / _regeneration_loop()
    pub fn pump_energy(&mut self) {
        let pump_dt = (self.dt * SPA::new(2, 0, 0, 0, 0)).to_raw();
        for i in 0..self.crystals.len() {
            let target = self.target_amplitudes[i];
            if target.to_raw() > 0 {
                let current = self.crystals[i].amplitude.to_raw();
                let injection_raw = self.pids[i].update(current, pump_dt);
                // Unilateral: solo inyectar si la bomba dice añadir
                if injection_raw > 0 {
                    self.crystals[i].amplitude =
                        self.crystals[i].amplitude + SPA::from_raw(injection_raw);
                }
            }
        }
    }

    pub fn global_coherence(&self) -> i64 {
        let active: Vec<_> = self.crystals.iter()
            .filter(|c| c.amplitude.to_raw() > 0)
            .collect();
        if active.is_empty() { return 0; }
        let total = active.iter().fold(0i64, |acc, c| acc + c.amplitude.to_raw());
        total / active.len() as i64
    }
}
