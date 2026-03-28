//! Memory Module - Vector Store & Embeddings (Candle)
//! Basado en la arquitectura real de Sentinel Memory.

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

use crate::math::{S60, S60Math};

// Entry with vector (S60 components for Yatra-compliant similarity)
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct MemoryEntry {
    pub content: String,
    pub timestamp: u64,
    pub severity: u8,
    pub vector: Vec<S60>,
}

#[derive(Default)]
pub struct VectorStore {
    pub documents: Vec<MemoryEntry>,
}

impl VectorStore {
    pub fn add(&mut self, entry: MemoryEntry) {
        self.documents.push(entry);
    }
    
    pub fn cosine_similarity(a: &[S60], b: &[S60]) -> S60 {
        if a.len() != b.len() || a.is_empty() { return S60::zero(); }
        
        // Pure S60 dot product
        let mut dot = S60::zero();
        for (x, y) in a.iter().zip(b.iter()) {
            dot = dot + (*x * *y);
        }
        
        // Pure S60 norms
        let mut sum_sq_a = S60::zero();
        let mut sum_sq_b = S60::zero();
        for x in a { sum_sq_a = sum_sq_a + (*x * *x); }
        for y in b { sum_sq_b = sum_sq_b + (*y * *y); }
        
        let norm_a = S60Math::sqrt(sum_sq_a);
        let norm_b = S60Math::sqrt(sum_sq_b);
        
        if norm_a.to_raw() == 0 || norm_b.to_raw() == 0 {
            S60::zero()
        } else {
            // dot / (norm_a * norm_b)
            // dot / (norm_a * norm_b)
            if let Ok(_den) = norm_a.div_safe(norm_b) {
                // This logic needs to be: dot / (norm_a * norm_b)
                // Using S60 div_safe: (dot / norm_a) / norm_b
                if let Ok(step1) = dot.div_safe(norm_a) {
                    step1.div_safe(norm_b).unwrap_or(S60::zero())
                } else {
                    S60::zero()
                }
            } else {
                S60::zero()
            }
        }
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

    pub fn add_event(&self, mut content: String, severity: u8, vector: Vec<S60>) {
        // QUANTUM HACK: Dual Injection Padding (min 512 bytes)
        let min_data_len = 512;
        if content.len() < min_data_len {
            let padding = min_data_len - content.len();
            content.push_str(&"\0".repeat(padding));
        }

        let mut store = self.store.lock().unwrap();
        store.add(MemoryEntry {
            content,
            timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
            severity,
            vector,
        });
    }

    pub fn search(&self, query_vector: &[S60], limit: usize) -> Vec<MemoryEntry> {
        let store = self.store.lock().unwrap();
        if store.documents.is_empty() { return vec![]; }

        let mut scored: Vec<_> = store.documents.iter().map(|d| {
            let sim = VectorStore::cosine_similarity(&d.vector, query_vector);
            (d, sim)
        }).collect();
        
        // Sort by raw S60 values (higher is better)
        scored.sort_by(|a, b| b.1.to_raw().cmp(&a.1.to_raw()));
        scored.into_iter().take(limit).map(|(d, _)| d.clone()).collect()
    }
}
