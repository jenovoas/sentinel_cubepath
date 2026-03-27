//! eBPF Bridge for Sentinel Ring-0
//! 
//! Consumes real kernel events from BPF RingBuffer (256KB) 
//! and forwards them to the Cortex Engine.

use crate::CortexEvent;
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
    ringbuf_paths: Vec<String>,
}

impl EbpfBridge {
    pub fn new(paths: Vec<String>) -> Self {
        Self {
            ringbuf_paths: paths,
        }
    }

    /// Primary monitor loop using libbpf-rs
    pub async fn run_monitor(
        &self, 
        tx: broadcast::Sender<CortexEvent>
    ) -> anyhow::Result<()> {
        let paths = self.ringbuf_paths.clone();
        
        tracing::info!("🛡️ Starting Unified Ring-0 Monitor for {} paths...", paths.len());

        for path in paths {
            let tx_clone = tx.clone();
            let p = path.clone();
            
            tokio::task::spawn_blocking(move || -> anyhow::Result<()> {
                use libbpf_rs::{MapHandle, RingBufferBuilder};

                tracing::info!("🔍 Attaching to RingBuffer: {}", p);

                // Open the pinned BPF map from the filesystem
                let map = MapHandle::from_pinned_path(&p)
                    .map_err(|e| anyhow::anyhow!("Kernel Error: Failed to open RingBuffer at {}: {}", p, e))?;

                let mut builder = RingBufferBuilder::new();
                
                // Callback for each event received from Kernel
                builder.add(&map, move |data: &[u8]| -> i32 {
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
                        10 => "PTRACE_CHECK".to_string(),
                        11 => "CHMOD_CHECK".to_string(),
                        _ => "UNKNOWN".to_string(),
                    };

                    let message = match raw.event_type {
                        1 => "LSM: Unauthorized file access blocked (Ring-0)".to_string(),
                        2 => "LSM: Unauthorized execution attempt blocked (Ring-0)".to_string(),
                        3 => "LSM: File access allowed by AI Guardian".to_string(),
                        4 => "LSM: Execution allowed by AI Guardian".to_string(),
                        5 => "XDP: Network burst detected (DDoS Protection active)".to_string(),
                        6 => "XDP: Network traffic within normal parameters".to_string(),
                        7 => "System metric updated in kernel space".to_string(),
                        8 => "Bio-pulse detected: Operator presence verified".to_string(),
                        9 => "Quantum Harmonic Controller cache reset".to_string(),
                        10 => "Watchdog: Suspicious PTRACE access check intercepted".to_string(),
                        11 => "Watchdog: Unauthorized chmod attempt detected".to_string(),
                        _ => "Unknown kernel-level event detected".to_string(),
                    };

                    let event = CortexEvent {
                        timestamp_ns: raw.timestamp_ns,
                        pid: raw.pid,
                        event_type,
                        message,
                        entropy_s60_raw: raw.entropy_signal as i64,
                        severity: raw.severity,
                    };

                    let _ = tx_clone.send(event);
                    0
                })?;

                let mut ringbuf = builder.build()?;

                loop {
                    ringbuf.poll(Duration::from_millis(100))?;
                }
            });
        }
        
        Ok(())
    }
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
