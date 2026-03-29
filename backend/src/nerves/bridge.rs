//! # 🛰️ eBPF → Cortex Bridge Hub 🛰️
//!
//! Sincronización de eventos del Kernel con el Core S60.

use crate::quantum::buffer_system::ResonantBuffer;
use crate::math::SPA;
use std::sync::Arc;
use std::time::Duration;
use crate::models::{CortexEvent};

// Severity levels
pub const SEVERITY_LOW: u8 = 0;
pub const SEVERITY_MEDIUM: u8 = 1;
pub const SEVERITY_HIGH: u8 = 2;
pub const SEVERITY_CRITICAL: u8 = 3;

/// Raw Cortex Event (Packed, matching C layout)
#[repr(C, packed)]
#[derive(Debug, Copy, Clone)]
pub struct RawCortexEvent {
    pub timestamp_ns: u64,
    pub event_type: u32,
    pub pid: u32,
    pub entropy_signal: u64, // SPA raw value
    pub severity: u8,
    pub _reserved: [u8; 7],
}

impl CortexEvent {
    /// Constructor para eventos manuales (Mitos de Telemetría)
    pub fn new(
        timestamp_ns: u64,
        event_type: String,
        severity: u8,
        entropy_signal: i64,
    ) -> Self {
        Self {
            event_id: timestamp_ns,
            event_type,
            severity,
            payload_hash: [0u8; 32],
            entropy_signal,
            timestamp_ns,
        }
    }

    /// Transformación de Raw C-struct a Dominio Cortex S60 (Segura para campos packed)
    pub fn from_raw_event(raw_event: RawCortexEvent) -> Self {
        // Copia local para evitar referencias a campos packed (E0793)
        let et = raw_event.event_type;
        let ts = raw_event.timestamp_ns;
        let sv = raw_event.severity;
        let es = raw_event.entropy_signal;

        let event_type_str = match et {
            1 => "FILE_BLOCK".to_string(),
            2 => "EXEC_BLOCK".to_string(),
            3 => "FILE_ALLOW".to_string(),
            4 => "EXEC_ALLOW".to_string(),
            5 => "NETWORK_BURST".to_string(),
            6 => "NETWORK_NORMAL".to_string(),
            10 => "SYSTEM_HEARTBEAT".to_string(),
            _ => format!("RAW_EV_{}", et),
        };

        Self {
            event_id: ts,
            event_type: event_type_str,
            severity: sv,
            payload_hash: [0u8; 32],
            entropy_signal: es as i64,
            timestamp_ns: ts,
        }
    }
}

/// eBPF to Cortex Bridge
pub struct EbpfCortexBridge {
    buffer: Arc<ResonantBuffer>,
}

impl EbpfCortexBridge {
    pub fn new(buffer: Arc<ResonantBuffer>) -> Self {
        Self { buffer }
    }

    /// Loop de polling para capturar señales del kernel
    pub fn start_polling(&self, ringbuf_path: &str) -> Result<(), Box<dyn std::error::Error>> {
        use libbpf_rs::{MapHandle, RingBufferBuilder};
        use std::path::Path;

        let map_path = if Path::new(ringbuf_path).is_dir() {
            format!("{}/cortex_events", ringbuf_path)
        } else {
            ringbuf_path.to_string()
        };

        let map = MapHandle::from_pinned_path(&map_path)
            .map_err(|e| format!("Error en ring buffer map en {}: {}", map_path, e))?;

        let mut builder = RingBufferBuilder::new();
        let buffer_clone = self.buffer.clone();

        builder.add(&map, move |data: &[u8]| -> i32 {
            if data.len() < std::mem::size_of::<RawCortexEvent>() { return 0; }
            let raw: RawCortexEvent = unsafe { std::ptr::read_unaligned(data.as_ptr() as *const RawCortexEvent) };
            
            let event = CortexEvent::from_raw_event(raw);
            buffer_clone.push(event);
            0 
        })?;

        let ringbuf = builder.build()?;
        loop {
            let _ = ringbuf.poll(Duration::from_millis(100));
        }
    }
}
