//! eBPF Bridge for Sentinel Ring-0
//! 
//! Consumes real kernel events from BPF RingBuffer (256KB) 
//! and forwards them to the Cortex Engine.

use crate::main::CortexEvent;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::sync::broadcast;

/// Mirroring C struct from cortex_events.h
/// Size: Exactly 32 bytes (packed)
#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct CortexEventRaw {
    pub timestamp_ns: u64,
    pub event_type: u32,
    pub pid: u32,
    pub entropy_signal: u64,
    pub severity: u8,
    pub _reserved: [u8; 7],
}

pub struct EbpfBridge {
    ringbuf_path: String,
}

impl EbpfBridge {
    pub fn new(path: impl Into<String>) -> Self {
        Self {
            ringbuf_path: path.into(),
        }
    }

    /// Primary monitor loop using libbpf-rs
    pub async fn run_monitor(
        &self, 
        tx: broadcast::Sender<CortexEvent>
    ) -> anyhow::Result<()> {
        let ringbuf_path = self.ringbuf_path.clone();
        
        tracing::info!("🛡️ Starting Real eBPF Monitor at {}...", ringbuf_path);

        // Spawn a blocking task for libbpf polling
        tokio::task::spawn_blocking(move || -> anyhow::Result<()> {
            use libbpf_rs::{MapHandle, RingBufferBuilder};

            // Open the pinned BPF map from the filesystem
            let map = MapHandle::from_pinned_path(&ringbuf_path)
                .map_err(|e| anyhow::anyhow!("Kernel Error: Failed to open RingBuffer at {}: {}", ringbuf_path, e))?;

            let mut builder = RingBufferBuilder::new();
            
            // Callback for each event received from Kernel
            builder.add(&map, |data: &[u8]| -> i32 {
                if data.len() < std::mem::size_of::<CortexEventRaw>() {
                    return 0;
                }

                // Zero-copy read from kernel memory
                let raw: CortexEventRaw = unsafe { 
                    std::ptr::read_unaligned(data.as_ptr() as *const CortexEventRaw) 
                };

                let event_type = match raw.event_type {
                    1 => "FILE_BLOCKED".to_string(),
                    2 => "EXEC_BLOCKED".to_string(),
                    3 => "FILE_ALLOWED".to_string(),
                    4 => "EXEC_ALLOWED".to_string(),
                    5 => "NETWORK_BURST".to_string(),
                    6 => "NETWORK_NORMAL".to_string(),
                    7 => "SYSTEM_METRIC".to_string(),
                    8 => "BIO_PULSE".to_string(),
                    9 => "QHC_RESET".to_string(),
                    _ => "UNKNOWN".to_string(),
                };

                let event = CortexEvent {
                    timestamp_ns: raw.timestamp_ns,
                    pid: raw.pid,
                    event_type,
                    entropy_s60_raw: raw.entropy_signal as i64,
                    severity: raw.severity,
                };

                // Broadcast to all subscribers (WASM, Dashboard, Analytics)
                let _ = tx.send(event);
                0
            })?;

            let mut ringbuf = builder.build()?;

            loop {
                // Poll with 100ms timeout to allow process signals
                ringbuf.poll(Duration::from_millis(100))?;
            }
        }).await?
    /// Reflex Arc: Enter/Exit Total System Quarantine (Sealed Mode)
    /// Writes directly to the tc_firewall config_map in Ring 0.
    pub fn set_quarantine_mode(&self, enabled: bool) -> anyhow::Result<()> {
        use libbpf_rs::MapHandle;
        
        let path = "/sys/fs/bpf/tc_firewall_config"; // Path del mapa de config
        let map = MapHandle::from_pinned_path(path)
            .map_err(|e| anyhow::anyhow!("Kernel Lock Error: Failed to access Firewall Config at {}: {}", path, e))?;

        let key: u32 = 0;
        let value: u32 = if enabled { 1 } else { 0 };

        map.update(&key.to_ne_bytes(), &value.to_ne_bytes(), libbpf_rs::MapFlags::ANY)
            .map_err(|e| anyhow::anyhow!("Reflex Arc Failure: Failed to flip quarantine switch: {}", e))?;

        if enabled {
            tracing::warn!("🚨 SYSTEM SEALED: Total network quarantine activated via Ring-0 TC Firewall.");
        } else {
            tracing::info!("🛡️ System Resumed: Network quarantine lifted.");
        }

        Ok(())
    }
}
