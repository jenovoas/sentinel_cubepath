#![allow(dead_code)]
//! # 🐚 SEMANTIC SHELL - SENTINEL CORTEX 🛡️
//!
//! Interactive REPL for Sentinel.
//! Provides the "Human in the Loop" interface for Oracle, Action, and Safety modes.
//! Ported for Sentinel Ring-0 (MiduDev Hackathon).

use std::io::{self, Write};
use std::process::Command;
use crate::quantum::semantic_router::{Intent, SemanticRouter};
use rustyline::completion::{Completer, FilenameCompleter, Pair};
use rustyline::error::ReadlineError;
use rustyline::highlight::Highlighter;
use rustyline::hint::Hinter;
use rustyline::validate::Validator;
use rustyline::{Config, Editor, Helper, Context};
use rustyline_derive::{Completer, Helper, Highlighter, Hinter, Validator};
use tokio::runtime::Builder;

#[derive(Helper, Completer, Highlighter, Hinter, Validator)]
struct ShellHelper {
    #[rustyline(Completer)]
    completer: FilenameCompleter,
}

pub struct SemanticShell {
    router: SemanticRouter,
    runtime: tokio::runtime::Runtime,
}

impl SemanticShell {
    pub fn new() -> Self {
        let runtime = Builder::new_current_thread()
            .enable_all()
            .build()
            .expect("Failed to create Tokio runtime for Shell");

        Self {
            router: SemanticRouter::new(),
            runtime,
        }
    }

    pub fn run(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.print_banner();

        let config = Config::builder()
            .history_ignore_space(true)
            .completion_type(rustyline::CompletionType::List)
            .build();

        let h = ShellHelper {
            completer: FilenameCompleter::new(),
        };

        let mut rl = Editor::with_config(config)?;
        rl.set_helper(Some(h));

        let history_path = "/tmp/.sentinel_shell_history";
        let _ = rl.load_history(history_path);

        loop {
            let prompt = "\x1b[1;32mSentinel > \x1b[0m";
            match rl.readline(prompt) {
                Ok(line) => {
                    let input = line.trim();
                    if input.is_empty() {
                        continue;
                    }

                    let _ = rl.add_history_entry(input);

                    if input.eq_ignore_ascii_case("exit") || input.eq_ignore_ascii_case("q") {
                        println!("\n\x1b[1;35m🔌 Desconectando enlace neural...\x1b[0m");
                        break;
                    }

                    self.process_command(input);
                }
                Err(ReadlineError::Interrupted) => break,
                Err(ReadlineError::Eof) => break,
                Err(err) => {
                    println!("Error: {:?}", err);
                    break;
                }
            }
        }

        let _ = rl.save_history(history_path);
        Ok(())
    }

    fn fuzzy_cd(&self, target: &str) -> Option<std::path::PathBuf> {
        let exact = std::path::PathBuf::from(target);
        if exact.is_dir() {
            return Some(exact);
        }

        if let Ok(entries) = std::fs::read_dir(".") {
            for entry in entries.flatten() {
                if entry.file_type().map(|t| t.is_dir()).unwrap_or(false) {
                    let name = entry.file_name().to_string_lossy().to_lowercase();
                    let target_lower = target.to_lowercase();
                    if name == target_lower || name.starts_with(&target_lower) {
                        return Some(entry.path());
                    }
                }
            }
        }
        None
    }

    fn process_command(&mut self, input: &str) {
        let args: Vec<&str> = input.split_whitespace().collect();
        if let Some(cmd) = args.first() {
            match *cmd {
                "cd" => {
                    let path_raw = input.strip_prefix("cd").unwrap_or("").trim();
                    let target_path_buf = if path_raw.is_empty() || path_raw == "~" {
                        Some(std::path::PathBuf::from(
                            std::env::var("HOME").unwrap_or_else(|_| "/root".to_string()),
                        ))
                    } else {
                        self.fuzzy_cd(path_raw)
                    };

                    match target_path_buf {
                        Some(path) => {
                            if let Err(e) = std::env::set_current_dir(&path) {
                                println!("   \x1b[31mFailed to change directory: {}\x1b[0m", e);
                            } else {
                                let cwd = std::env::current_dir().unwrap_or_default();
                                println!("   📂 \x1b[33m{}\x1b[0m", cwd.display());
                            }
                        }
                        None => {
                            println!("   \x1b[31mNo se encontró el directorio: {}\x1b[0m", path_raw);
                        }
                    }
                    return;
                }
                "ls" | "pwd" | "clear" | "echo" | "cat" | "grep" | "git" | "cargo" | "mkdir"
                | "rm" | "touch" => {
                    match Command::new("sh").arg("-c").arg(input).status() {
                        Ok(_) => {}
                        Err(e) => println!("   \x1b[31mFailed to execute: {}\x1b[0m", e),
                    }
                    return;
                }
                _ => {}
            }
        }

        print!("\x1b[1;30mAnalizando intención...\x1b[0m\r");
        io::stdout().flush().unwrap();

        let (intent, result) = self.runtime.block_on(self.router.classify(input));

        print!("                         \r");

        match intent {
            Intent::Oracle => {
                println!("\n\x1b[1;36m🔮 ORACLE MODE (RUST NATIVE)\x1b[0m");
                println!("   \x1b[3m{}\x1b[0m", result);
                println!("\n\x1b[1;32m✅ Resonancia: ESTABLE (S60 Coherente)\x1b[0m");
            }
            Intent::SystemAction => {
                println!("\n\x1b[1;33m⚙️ ACCIÓN DE SISTEMA DETECTADA\x1b[0m");
                if result.starts_with("CMD: ") {
                    let cmd_str = result.trim_start_matches("CMD: ").trim();
                    println!("   \x1b[1;30mEjecutando: {}\x1b[0m", cmd_str);
                    
                    let parts: Vec<&str> = cmd_str.split_whitespace().collect();
                    if let Some(cmd_name) = parts.first() {
                         match *cmd_name {
                             "cd" => self.process_command(cmd_str),
                             _ => {
                                 let _ = Command::new("sh").arg("-c").arg(cmd_str).status();
                             }
                         }
                    }
                } else {
                    println!("   Intención: {}", result);
                }
            }
            Intent::SafetyCheck => {
                println!("\n\x1b[1;31m🛡️ CONTROL DE SEGURIDAD (RING-0)\x1b[0m");
                println!("   Análisis: {}", result);
            }
            Intent::Unknown => {
                println!("\n\x1b[1;30m❓ INTENCIÓN NO IDENTIFICADA\x1b[0m");
                println!("   Razonamiento: {}", result);
            }
        }
    }

    fn print_banner(&self) {
        println!("\x1b[1;35m============================================================\x1b[0m");
        println!("\x1b[1;35m  🧠  SENTINEL SEMANTIC SHELL v2.2 (RUST CORE)  🧠\x1b[0m");
        println!("\x1b[1;35m  [MODO MAESTRO / OPERACIÓN RING-0 ACTIVADA]\x1b[0m");
        println!("\x1b[1;35m============================================================\x1b[0m");
        println!("Escribe 'exit' o 'q' para volver. TAB para completar archivos.");
    }
}
