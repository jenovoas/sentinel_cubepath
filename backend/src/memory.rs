//! Memory Module - Vector Store & Embeddings (Candle)
//! Basado en la arquitectura real de Sentinel Memory.

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

// Entry with vector (float components for similarity, kept separate from S60 internals for standard compat)
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct MemoryEntry {
    pub content: String,
    pub timestamp: u64,
    pub severity: u8,
    pub vector: Vec<f32>,
}

#[derive(Default)]
pub struct VectorStore {
    pub documents: Vec<MemoryEntry>,
}

impl VectorStore {
    pub fn add(&mut self, entry: MemoryEntry) {
        self.documents.push(entry);
    }
    
    pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
        let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
        let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm_a == 0.0 || norm_b == 0.0 { 0.0 } else { dot / (norm_a * norm_b) }
    }
}

pub struct SentinelMemory {
    store: Arc<Mutex<VectorStore>>,
}

impl SentinelMemory {
    pub fn new() -> Self {
        Self {
            store: Arc::new(Mutex::new(VectorStore::default())),
        }
    }

    pub fn add_event(&self, content: String, severity: u8, vector: Vec<f32>) {
        let mut store = self.store.lock().unwrap();
        store.add(MemoryEntry {
            content,
            timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
            severity,
            vector,
        });
    }

    pub fn search(&self, query_vector: &[f32], limit: usize) -> Vec<MemoryEntry> {
        let store = self.store.lock().unwrap();
        let mut scored: Vec<_> = store.documents.iter().map(|d| {
            let sim = VectorStore::cosine_similarity(&d.vector, query_vector);
            (d, sim)
        }).collect();
        scored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        scored.into_iter().take(limit).map(|(d, _)| d.clone()).collect()
    }
}
