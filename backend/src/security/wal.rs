use std::fs::{OpenOptions, File};
use std::io::Write;
use std::path::Path;
use std::sync::{Arc, Mutex};
use serde::Serialize;
use chrono::Utc;

pub enum DataLane {
    Security,
    Observability,
}

#[derive(Serialize)]
struct WalEntry<T: Serialize> {
    timestamp: String,
    lane: String,
    payload: T,
}

pub struct SecurityWAL {
    file: Arc<Mutex<File>>,
    path: String,
}

impl SecurityWAL {
    pub fn new(path: &str) -> std::io::Result<Self> {
        // Ensure directory exists
        if let Some(parent) = Path::new(path).parent() {
            std::fs::create_dir_all(parent)?;
        }

        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)?;

        Ok(Self {
            file: Arc::new(Mutex::new(file)),
            path: path.to_string(),
        })
    }

    pub fn log_security<T: Serialize>(&self, payload: T) -> std::io::Result<()> {
        let entry = WalEntry {
            timestamp: Utc::now().to_rfc3339(),
            lane: "security".to_string(),
            payload,
        };

        let mut data = serde_json::to_vec(&entry)?;
        data.push(b'\n');

        let mut file = self.file.lock().unwrap();
        file.write_all(&data)?;
        
        // CRITICAL (Lane 1): Immediate physical sync to disk
        file.sync_all()?;
        
        Ok(())
    }

    pub fn get_path(&self) -> &str {
        &self.path
    }
}

// Global accessor for the Security Lane
pub type WalState = Arc<SecurityWAL>;
