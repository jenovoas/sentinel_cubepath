use crate::math::{SPA, SPAMath};
use crate::models::{CortexEvent, Severity};
use crate::quantum::buffer_system::ResonantBuffer;
use crate::security::soul_verifier::SoulVerifier;
use regex::RegexSet;
use sha3::{Digest, Sha3_512};
use std::collections::HashMap;

/// Firewall Semántico: Filtrado de patrones por palabras clave
pub struct SemanticFirewall {
    allowed_patterns: RegexSet,
    blocked_patterns: RegexSet,
}

impl SemanticFirewall {
    pub fn new() -> Self {
        let allowed = RegexSet::new(&[
            r"ME-60OS", r"Resonance", r"Truth", r"Physics", r"System Stable",
            r"Yatra Pure", r"S60", r"Sentinel", r"Ring-0", r"MiduDev",
        ]).unwrap();

        let blocked = RegexSet::new(&[
            r"Error", r"Failure", r"Corruption", r"Panic", r"Attack", 
            r"Sabotage", r"Exploit", r"Overflow", r"Breach",
        ]).unwrap();

        Self { allowed_patterns: allowed, blocked_patterns: blocked }
    }

    pub fn verify(&self, text: &str) -> bool {
        !self.blocked_patterns.is_match(text)
    }

    pub fn has_truth_keywords(&self, text: &str) -> bool {
        self.allowed_patterns.is_match(text)
    }
}

/// Firewall Entrópico: Validación de densidad de información
pub struct EntropicFirewall;

impl EntropicFirewall {
    pub fn calculate_entropy(text: &str) -> SPA {
        if text.is_empty() { return SPA::zero(); }
        let mut counts = [0usize; 256];
        let mut total = 0usize;
        for b in text.bytes() { counts[b as usize] += 1; total += 1; }
        let mut entropy_sum = SPA::zero();
        for &count in &counts {
            if count == 0 { continue; }
            let p_raw = (count as i64 * SPA::SCALE_0) / total as i64;
            let p = SPA::from_raw(p_raw);
            let ln_p = SPAMath::ln(p);
            entropy_sum = entropy_sum - (p * ln_p);
        }
        let inv_ln2 = SPA::from_raw(SPAMath::INV_LN2);
        entropy_sum * inv_ln2
    }

    pub fn verify_text(text: &str) -> bool {
        let entropy = Self::calculate_entropy(text);
        let min_e = SPA::new(2, 30, 0, 0, 0); // 2.5
        let max_e = SPA::new(5, 30, 0, 0, 0); // 5.5
        entropy > min_e && entropy < max_e
    }
}

/// Estructura de certificación Plimpton 322
#[derive(serde::Serialize)]
pub struct CertificationSeal {
    pub row: u32,
    pub lyapunov: SPA,
    pub entropy: SPA,
    pub seal_hash: String,
    pub certified: bool,
}

/// Motor TruthSync (Sentinel Claim Verifier)
pub struct TruthSync {
    pub semantic: SemanticFirewall,
    ratios: HashMap<u32, SPA>,
    tolerance: i64,
}

impl TruthSync {
    pub fn new() -> Self {
        let mut ratios = HashMap::new();
        // Ratios de la Tablilla Plimpton 322 (Base-60)
        ratios.insert(1,  SPA::from_raw(21923999));
        ratios.insert(2,  SPA::from_raw(23971127));
        ratios.insert(3,  SPA::from_raw(26211235));
        ratios.insert(4,  SPA::from_raw(28686741));
        ratios.insert(5,  SPA::from_raw(31437623));
        ratios.insert(6,  SPA::from_raw(34513043));
        ratios.insert(7,  SPA::from_raw(37959344));
        ratios.insert(8,  SPA::from_raw(41806451));
        ratios.insert(9,  SPA::from_raw(46095154));
        ratios.insert(10, SPA::from_raw(50879629));
        ratios.insert(11, SPA::from_raw(56214000));
        ratios.insert(12, SPA::from_raw(62159999));
        ratios.insert(13, SPA::from_raw(68787692));
        ratios.insert(14, SPA::from_raw(76159176));
        ratios.insert(15, SPA::from_raw(84357818));

        Self {
            semantic: SemanticFirewall::new(),
            ratios,
            tolerance: 1000,
        }
    }

    /// Analiza una proclama semántica
    pub fn analyze_claim(&self, claim: &str) -> (bool, SPA, SPA) {
        if claim.trim().is_empty() { return (false, SPA::zero(), SPA::zero()); }
        let is_semantic_valid = self.semantic.verify(claim);
        let entropy = EntropicFirewall::calculate_entropy(claim);
        let has_keywords = self.semantic.has_truth_keywords(claim);
        let mut score = SPA::new(0, 30, 0, 0, 0); 
        if has_keywords { score = score + SPA::new(0, 15, 0, 0, 0); }
        if EntropicFirewall::verify_text(claim) { score = score + SPA::new(0, 15, 0, 0, 0); }
        if !is_semantic_valid { score = SPA::new(0, 6, 0, 0, 0); }
        (is_semantic_valid && score > SPA::new(0, 30, 0, 0, 0), score, entropy)
    }

    /// Certifica señales físicas eBPF
    pub fn certify_content(&self, row: u32, signal: &[SPA]) -> CertificationSeal {
        let metrics = SoulVerifier::analyze(signal);
        let lyapunov = metrics.lyapunov;
        let entropy = metrics.entropy;
        let mut certified = false;
        if let Some(target) = self.ratios.get(&row) {
            let diff = (target.to_raw() as i128 - lyapunov.to_raw() as i128).abs();
            if diff < self.tolerance as i128 * 10 { certified = true; }
        }
        let mut hasher = Sha3_512::new();
        hasher.update(lyapunov.to_raw().to_le_bytes());
        hasher.update(entropy.to_raw().to_le_bytes());
        hasher.update(row.to_le_bytes());
        let seal_hash = hex::encode(hasher.finalize());
        CertificationSeal { row, lyapunov, entropy, seal_hash, certified }
    }

    /// Detecta firmas anómalas (AIOps Doom Detector)
    pub fn detect_aiops_doom(&self, entropy_raw: i64) -> bool {
        if entropy_raw < 0 || entropy_raw > SPA::SCALE_0 { return true; }
        let claimed = SPA::from_raw(entropy_raw);
        for ratio in self.ratios.values() {
            let diff = (ratio.to_raw() as i128 - claimed.to_raw() as i128).abs();
            if diff < (ratio.to_raw() / 60) as i128 { return false; }
        }
        true
    }

    pub fn verify_infrastructure(&self, buffer: &ResonantBuffer, bio_state: SPA) -> bool {
        let load = buffer.load_factor();
        load < SPA::new(0, 45, 0, 0, 0) || bio_state > SPA::new(0, 30, 0, 0, 0)
    }

    pub fn verify_text(&self, text: &str) -> bool {
        self.semantic.verify(text)
    }
}

impl Default for TruthSync { fn default() -> Self { Self::new() } }
