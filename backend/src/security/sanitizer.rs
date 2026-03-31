use regex::Regex;
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SanitizationResult {
    pub is_safe: bool,
    pub confidence: f64,
    pub blocked_patterns: Vec<String>,
    pub original_payload: String,
}

/// DANGEROUS PATTERNS FOR AIOpsDoom & INJECTION ATTACKS
static DANGEROUS_PATTERNS: OnceLock<Vec<(Regex, &'static str)>> = OnceLock::new();

fn get_patterns() -> &'static Vec<(Regex, &'static str)> {
    DANGEROUS_PATTERNS.get_or_init(|| {
        vec![
            // SQL Injection
            (Regex::new(r"(?i)DROP\s+TABLE").unwrap(), "DROP TABLE"),
            (Regex::new(r"(?i)DELETE\s+FROM").unwrap(), "DELETE FROM"),
            (Regex::new(r"(?i)TRUNCATE\s+TABLE").unwrap(), "TRUNCATE TABLE"),
            (Regex::new(r"(?i)INSERT\s+INTO").unwrap(), "INSERT INTO"),
            (Regex::new(r"(?i)UPDATE\s+\w+\s+SET").unwrap(), "UPDATE SET"),
            (Regex::new(r"(?i)ALTER\s+TABLE").unwrap(), "ALTER TABLE"),
            (Regex::new(r"(?i)'\s*OR\s+'1'\s*=\s*'1").unwrap(), "SQL OR injection"),

            // Command Injection
            (Regex::new(r"(?i)rm\s+-rf").unwrap(), "rm -rf"),
            (Regex::new(r"(?i)sudo\s+").unwrap(), "sudo"),
            (Regex::new(r"(?i)chmod\s+777").unwrap(), "chmod 777"),
            (Regex::new(r"(?i)eval\s*\(").unwrap(), "eval()"),
            (Regex::new(r"(?i)\$\(.*\)").unwrap(), "command substitution"),
            (Regex::new(r"(?i)>\s*/dev/null").unwrap(), "output redirection"),
            (Regex::new(r"(?i)\|\s*bash").unwrap(), "pipe to bash"),

            // Path Traversal & OS Access
            (Regex::new(r"(?i)\.\./\.\./").unwrap(), "path traversal"),
            (Regex::new(r"(?i)/etc/passwd").unwrap(), "/etc/passwd access"),
            (Regex::new(r"(?i)os\.system\s*\(").unwrap(), "os.system()"),
            (Regex::new(r"(?i)subprocess\.").unwrap(), "subprocess module"),
            
            // Domain Specific
            (Regex::new(r"(?i)aiopsdoom").unwrap(), "AIOPSDOOM_SIGNATURE"),
            (Regex::new(r"(?i)ptrace").unwrap(), "INTROSPECTION_PROBE"),
            (Regex::new(r"(?i)rootkit").unwrap(), "KERNEL_TAMPERING"),
        ]
    })
}

/// 🧬 TELEMETRY SANITIZER
/// Replaces the fake mock with real regex-based payload validation.
pub struct TelemetrySanitizer;

impl TelemetrySanitizer {
    pub fn new() -> Self {
        Self
    }

    /// Analiza el prompt contra vectores de ataque conocidos.
    pub fn sanitize_prompt(&self, prompt: &str) -> SanitizationResult {
        if prompt.trim().is_empty() {
            return SanitizationResult {
                is_safe: false,
                confidence: 0.0,
                blocked_patterns: vec!["empty_prompt".to_string()],
                original_payload: prompt.to_string(),
            };
        }

        if prompt.len() > 10_000 {
            return SanitizationResult {
                is_safe: false,
                confidence: 0.1,
                blocked_patterns: vec!["excessive_length".to_string()],
                original_payload: prompt.chars().take(100).collect(),
            };
        }

        let mut blocked_patterns = Vec::new();
        let patterns = get_patterns();

        for (regex, name) in patterns {
            if regex.is_match(prompt) {
                blocked_patterns.push(name.to_string());
            }
        }

        if !blocked_patterns.is_empty() {
            let confidence = (1.0 - (blocked_patterns.len() as f64 * 0.3)).max(0.0);
            return SanitizationResult {
                is_safe: false,
                confidence,
                blocked_patterns,
                original_payload: prompt.to_string(),
            };
        }

        SanitizationResult {
            is_safe: true,
            // 0.95 confidence means nominal safe prompt under current heuristics
            confidence: 0.95,
            blocked_patterns: vec![],
            original_payload: prompt.to_string(),
        }
    }
}
