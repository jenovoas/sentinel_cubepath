use serde::{Deserialize, Serialize};
use crate::math::SPA;

/// Niveles de Severidad para eventos del Cortex
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum Severity {
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3,
}

impl From<u8> for Severity {
    fn from(s: u8) -> Self {
        match s {
            0 => Severity::Low,
            1 => Severity::Medium,
            2 => Severity::High,
            3 => Severity::Critical,
            _ => Severity::Low,
        }
    }
}

/// Tipos de Eventos detectados por el sistema eBPF / Cortex
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum EventType {
    FileBlocked = 1,
    ExecBlocked = 2,
    FileAllowed = 3,
    ExecAllowed = 4,
    NetworkBurst = 5,
    NetworkNormal = 6,
    SystemHeartbeat = 10,
}

impl From<u32> for EventType {
    fn from(t: u32) -> Self {
        match t {
            1 => EventType::FileBlocked,
            2 => EventType::ExecBlocked,
            3 => EventType::FileAllowed,
            4 => EventType::ExecAllowed,
            5 => EventType::NetworkBurst,
            6 => EventType::NetworkNormal,
            _ => EventType::SystemHeartbeat,
        }
    }
}

/// Evento de Cortex con tipado fuerte (Yatra Pure)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub timestamp_ns: u64,
    pub event_type: EventType,
    pub pid: u32,
    pub entropy_signal: SPA,
    pub severity: Severity,
}

/// Estructura de compatibilidad para el bridge eBPF y el Dashboard
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CortexEvent {
    pub event_id: u64,
    pub event_type: String,
    pub severity: u8,
    pub payload_hash: [u8; 32],
    pub entropy_signal: i64,
    pub timestamp_ns: u64,
}

impl Default for CortexEvent {
    fn default() -> Self {
        Self {
            event_id: 0,
            event_type: "VOID".to_string(),
            severity: 0, // SEVERITY_LOW
            payload_hash: [0u8; 32],
            entropy_signal: 0, // SPA::zero() raw
            timestamp_ns: 0,
        }
    }
}

/// Patrón detectado por la red neuronal LIF
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectedPattern {
    pub name: String,
    pub confidence: SPA,
    pub severity: Severity,
    pub recommended_action: String,
    pub playbook: String,
}
