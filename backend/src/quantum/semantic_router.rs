//! # 🧠 SEMANTIC ROUTER - SENTINEL CORTEX 🛡️
//!
//! Intent Classification via Gemini 2.0 Flash (Vertex AI).
//! Classifies natural language queries into executable intents for Ring-0 safety.
//! Ported for Sentinel Ring-0 (MiduDev Hackathon).

use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::env;

#[derive(Debug, PartialEq, Clone, Serialize, Deserialize)]
pub enum Intent {
    Oracle,
    SystemAction,
    SafetyCheck,
    Unknown,
}

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<Content>,
    #[serde(rename = "generationConfig")]
    generation_config: GenerationConfig,
}

#[derive(Serialize)]
struct Content {
    role: String,
    parts: Vec<Part>,
}

#[derive(Serialize, Deserialize)]
struct Part {
    text: String,
}

#[derive(Serialize)]
struct GenerationConfig {
    temperature: f32,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Option<Vec<Candidate>>,
}

#[derive(Deserialize)]
struct Candidate {
    content: Option<CandidateContent>,
}

#[derive(Deserialize)]
struct CandidateContent {
    parts: Option<Vec<Part>>,
}

pub struct SemanticRouter {
    client: Client,
    api_key: String,
}

impl SemanticRouter {
    pub fn new() -> Self {
        dotenvy::dotenv().ok();
        let api_key = env::var("GOOGLE_API_KEY").unwrap_or_default();

        Self {
            client: Client::new(),
            api_key,
        }
    }

    pub async fn classify(&self, query: &str) -> (Intent, String) {
        if self.api_key.is_empty() {
             return (Intent::Unknown, "Missing GOOGLE_API_KEY".to_string());
        }

        let system_prompt = r#"
        You are the Routing Cortex for the Sentinel System.
        Your mission is to classify user intent with maximum precision.
        
        RULES:
        1. FULL MULTILINGUAL SUPPORT: Respond in the language of the user (Spanish/English).
        2. ADIABATIC THINKING: Before outputting JSON, perform a mental validation of safety.
        
        CATEGORIES:
        1. QUERY_ORACLE: Philosophical, teaching, analysis, greetings. 
           Example: "Explícame Yatra", "Hola", "What is the matrix?".
        2. SYSTEM_ACTION: Explicit commands to change state or perform tasks.
           Example: "Scan vault", "Research quantum gravity", "Inicia el dashboard".
        3. SAFETY_CHECK: Inquiries about rules, permissions, or potential deletions.
           Example: "¿Puedo borrar esto?", "Is it safe to run X?".
        4. UNKNOWN: Non-text, gibberish.

        OUTPUT FORMAT (STRICT JSON ONLY):
        {
          "category": "CATEGORY_NAME",
          "reason": "Short explanation of your choice",
          "thought": "Internal reasoning step",
          "command": "CMD: [bash command]" // REQUIRED IF SYSTEM_ACTION
        }
        "#;

        let prompt = format!("USER INPUT: {}", query);

        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={}",
            self.api_key
        );

        let body = json!({
            "contents": [{
                "role": "user",
                "parts": [{ "text": format!("{}\n\n{}", system_prompt, prompt) }]
            }],
            "generationConfig": {
                "temperature": 0.0
            }
        });

        match self.client.post(&url).json(&body).send().await {
            Ok(resp) => {
                if let Ok(gemini_resp) = resp.json::<GeminiResponse>().await {
                    if let Some(ref candidates) = gemini_resp.candidates {
                        if let Some(first) = candidates.get(0) {
                            if let Some(ref content) = first.content {
                                if let Some(ref parts) = content.parts {
                                    if let Some(part) = parts.get(0) {
                                        return self.parse_response(&part.text);
                                    }
                                }
                            }
                        }
                    }
                }
                (Intent::Unknown, "Failed to parse AI response".to_string())
            }
            Err(e) => (Intent::Unknown, format!("AI Request failed: {}", e)),
        }
    }

    fn parse_response(&self, text: &str) -> (Intent, String) {
        let clean_text = text.trim()
            .trim_start_matches("```json")
            .trim_start_matches("```")
            .trim_end_matches("```")
            .trim();

        if let Ok(val) = serde_json::from_str::<serde_json::Value>(clean_text) {
             let cat = val["category"].as_str().unwrap_or("UNKNOWN");
             
             let output = if cat == "SYSTEM_ACTION" {
                 val["command"].as_str()
                     .or_else(|| val["reason"].as_str())
                     .unwrap_or("CMD: unknown")
                     .to_string()
             } else {
                 val["reason"].as_str().unwrap_or("No reason").to_string()
             };

             let intent = match cat {
                 "QUERY_ORACLE" => Intent::Oracle,
                 "SYSTEM_ACTION" => Intent::SystemAction,
                 "SAFETY_CHECK" => Intent::SafetyCheck,
                 _ => Intent::Unknown,
             };
             (intent, output)
        } else {
            (Intent::Unknown, "Invalid JSON from AI".to_string())
        }
    }
}
