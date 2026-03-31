# 🛡️ Reconexión de Inteligencia (Ring-0)
## Restauración Crítica - "Host Fénix"

Se rehabilitan las funciones autonómicas del eBPF y la orquestación ML / Caché en base al `ENGINEERING_MANIFESTO.md` y `PROTOCOLO_YATRA.md`.

### Fase 1: Autonomía de Defensas (XDP y LSM)
- [ ] Editar `backend/src/main.rs`.
- [ ] Ubicar el bridge eBPF (`ebpf::EbpfBridge`).
- [ ] Enlazar `CortexEvent` crítico (Event_type: `EXEC_BLOCKED` o severidad > 2) hacia `bridge.set_quarantine_mode(true)`. 
- [ ] El Sentinel sellará activamente Fénix sin falsos positivos de estado en UI.

### Fase 2: Memoria Neuronal (Reflejos n8n)
- [ ] Editar `backend/Cargo.toml` sumando `reqwest` (cliente REST MPSC `tokio`).
- [ ] Configurar inyección de Webhook. Cuando la `NeuralMemory` dispare saturación entrópica, mandar el Payload al Webhook del flujo de N8N.
- [ ] Confirmar puerto local para n8n (o ruta default).

### Fase 3: Recuperar TruthSync (Redis + ML)
- [ ] Añadir `redis` en backend para Toki.
- [ ] Adaptar TruthSync (`src/truthsync.rs`) para consultar el Edge de Redis (port 6379 o `REDIS_URL`) antes del oráculo `analyze_claim`, devolviendo el estado en < 1ms si el Claim ya está en caché.
