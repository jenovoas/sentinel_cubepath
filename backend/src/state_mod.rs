//! state_mod.rs - Global System State Modification
//! Orquestación de estados 'Sealed' y 'Open' corregidos para el nodo CubePath.

#[derive(Debug, Clone, PartialEq, Default)]
pub enum SystemSovereignty {
    #[default]
    Sealed,   // Ring-0 protection active
    Open,     // Maintenance mode
    Quarantine, // Cognitive breach detected
}
pub struct StateController {
    current_sovereignty: SystemSovereignty,
    threat_level: u8,
}

impl StateController {
    pub fn new() -> Self {
        Self {
            current_sovereignty: SystemSovereignty::Sealed,
            threat_level: 0,
        }
    }

    pub fn set_sovereignty(&mut self, state: SystemSovereignty) {
        self.current_sovereignty = state;
    }

    pub fn get_sovereignty(&self) -> SystemSovereignty {
        self.current_sovereignty.clone()
    }
}
