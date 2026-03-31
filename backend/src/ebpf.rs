//! eBPF Bridge for Sentinel Ring-0
//! 
//! Consumes kernel events from BPF RingBuffer (256KB) 
//! and forwards them to the Cortex Engine.

use crate::models::CortexEvent;
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
        tx: broadcast::Sender<CortexEvent>,
        wal: crate::security::wal::WalState
    ) -> anyhow::Result<()> {
        let paths = self.ringbuf_paths.clone();
        
        tracing::info!("🛡️ Starting Unified Ring-0 Monitor for {} paths...", paths.len());

        for path in paths {
            let tx_clone = tx.clone();
            let wal_clone = wal.clone();
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



                    // Copias locales para evitar referencias a campos packed
                    let ts  = raw.timestamp_ns;
                    let pid = raw.pid;
                    let et  = raw.event_type;
                    let es  = raw.entropy_signal;
                    let sv  = raw.severity;

                    let (event_type_str, message) = match et {
                        1  => ("FILE_BLOCKED",   "Archivo bloqueado por LSM cognitivo"),
                        2  => ("EXEC_BLOCKED",   "Ejecución bloqueada por Guardian Ring-0"),
                        3  => ("FILE_ALLOWED",   "Acceso a archivo verificado"),
                        4  => ("EXEC_ALLOWED",   "Ejecución verificada por whitelist"),
                        5  => ("NETWORK_BURST",  "Anomalía de red detectada"),
                        6  => ("NETWORK_NORMAL", "Tráfico de red normal"),
                        7  => ("SYSTEM_METRIC",  "Métrica del sistema"),
                        8  => ("BIO_PULSE",      "Pulso bio-soberano (17s)"),
                        9  => ("PHASE_RESYNC",   "Reset QHC T=68s"),
                        10 => ("PTRACE_CHECK",   "Intento de PTRACE interceptado"),
                        11 => ("CHMOD_CHECK",    "Cambio de permisos interceptado"),
                        _  => ("SYSTEM_METRIC",  "Evento kernel desconocido"),
                    };

                    let event = CortexEvent {
                        event_id: ts,
                        event_type: event_type_str.to_string(),
                        severity: sv,
                        payload_hash: [0u8; 32],
                        entropy_signal: es as i64,
                        timestamp_ns: ts,
                        pid,
                        message: message.to_string(),
                    };

                    // LANE 1: Security Audit Log — severidad alta o eventos de bloqueo
                    if sv >= 2 || et <= 2 || et >= 10 {
                        let _ = wal_clone.log_security(event.clone());
                        // Autonomía Defensiva Real: Aislar Fénix instantáneamente si entra un Rootkit o Exec anómalo
                        // Se efectúa dentro del context de Ring-0
                        use libbpf_rs::MapHandle;
                        let map_res = MapHandle::from_pinned_path("/sys/fs/bpf/tc_firewall_config");
                        if let Ok(map) = map_res {
                            let key: u32 = 0;
                            let value: u32 = 1;
                            let _ = map.update(&key.to_ne_bytes(), &value.to_ne_bytes(), libbpf_rs::MapFlags::ANY);
                            tracing::warn!("🚨 DEFENSA AUTÓNOMA GATILLADA: Cuarentena de red TC XDP activada en Ring-0 por evento eBPF {:?}", et);
                        }
                    }

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
