//! # 🛡️ ZERO-LATENCY RESONANT BUFFER - SENTINEL CORTEX 🛡️
//!
//! High-performance lock-free ring buffer for S60 data streams.
//! Optimized for Ring-0 telemetry and Bio-Resonance alignment.

use crate::math::S60;
use std::cell::UnsafeCell;
use std::sync::atomic::{AtomicUsize, Ordering};

/// Constants aligned to S60 harmonics (60^2 blocks)
pub const BUFFER_SIZE_S60: usize = 3600; 
const CACHE_LINE_SIZE: usize = 64;

/// Zero-Latency Resonant Buffer
pub struct ResonantBuffer {
    data: Box<[UnsafeCell<S60>]>,
    head: AtomicUsize,               // Write index
    tail: AtomicUsize,               // Read index
    _padding: [u8; CACHE_LINE_SIZE], // Reduce false sharing (cache line alignment)
}

unsafe impl Sync for ResonantBuffer {}
unsafe impl Send for ResonantBuffer {}

impl ResonantBuffer {
    /// Create a new resonant buffer with harmonic pre-allocation.
    pub fn new() -> Self {
        let mut vec = Vec::with_capacity(BUFFER_SIZE_S60);
        for _ in 0..BUFFER_SIZE_S60 {
            vec.push(UnsafeCell::new(S60::zero()));
        }

        Self {
            data: vec.into_boxed_slice(),
            head: AtomicUsize::new(0),
            tail: AtomicUsize::new(0),
            _padding: [0; CACHE_LINE_SIZE],
        }
    }

    /// Push an S60 packet into the buffer (Lock-Free).
    pub fn push(&self, value: S60) -> bool {
        let head = self.head.load(Ordering::Relaxed);
        let tail = self.tail.load(Ordering::Acquire);

        let next_head = (head + 1) % BUFFER_SIZE_S60;
        if next_head == tail {
            return false; // Buffer overflow (Pressure too high)
        }

        unsafe {
            *self.data[head].get() = value;
        }

        self.head.store(next_head, Ordering::Release);
        true
    }

    /// Pop an S60 packet from the buffer.
    pub fn pop(&self) -> Option<S60> {
        let tail = self.tail.load(Ordering::Relaxed);
        let head = self.head.load(Ordering::Acquire);

        if tail == head {
            return None; // Empty (Vacuum state)
        }

        let value = unsafe { *self.data[tail].get() };
        let next_tail = (tail + 1) % BUFFER_SIZE_S60;
        self.tail.store(next_tail, Ordering::Release);

        Some(value)
    }

    /// Get current occupancy as a load factor (S60 percentage).
    pub fn load_factor(&self) -> S60 {
        let head = self.head.load(Ordering::Relaxed);
        let tail = self.tail.load(Ordering::Relaxed);

        let count = if head >= tail {
            head - tail
        } else {
            BUFFER_SIZE_S60 - tail + head
        };

        // Harmonic scale: convert to degrees (0-60 in decimals of 60)
        let raw = (count as i64 * S60::SCALE_0) / BUFFER_SIZE_S60 as i64;
        S60::from_raw(raw)
    }
}

impl Default for ResonantBuffer {
    fn default() -> Self {
        Self::new()
    }
}
