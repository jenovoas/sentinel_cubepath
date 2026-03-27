# Sentinel Ring-0 — Claude Code Context

## Proyecto

**Sentinel Ring-0** es un firewall cognitivo que opera a nivel de kernel Linux (Ring-0) via eBPF para proteger servidores contra acciones destructivas de agentes de IA autónomos. Intercepta syscalls antes de ejecutarse y aplica análisis semántico para determinar si la acción es segura.

- **Demo en vivo:** https://vps23309.cubepath.net/
- **Repositorio:** https://github.com/jenovoas/sentinel_cubepath
- **Infraestructura:** Rocky Linux 10 en CubePath (VPS23309), Docker multi-stage, Nginx proxy

## Hackathon

- **Evento:** Hackatón de MiduDev — CubePath 2026
- **Info:** https://github.com/midudev/hackaton-cubepath-2026
- **Inscripción:** https://github.com/midudev/hackaton-cubepath-2026/issues/182
- **Deadline de entrega:** 31 de marzo de 2026 a las 23:59:59 CET
- **Votación final:** 1 de abril de 2026 a las 18:00 CET
- **Criterios (prioridad):** UX → Creatividad → Utilidad → Implementación técnica

## Arquitectura

```
RING 0 — Kernel (eBPF/C)
├── lsm_ai_guardian.c     Hook execve/file_open + RingBuffer
├── xdp_firewall.c        Filtrado de red (<0.1ms)
├── tc_firewall.c         Cuarentena total (kill-switch)
├── burst_sensor.c        Detección DDoS
└── guardian_cognitive.c  Análisis semántico en kernel

RING 3 — Userspace (Rust + Axum + Tokio)
├── ebpf.rs               Bridge libbpf-rs (zero-copy)
├── math/s60.rs           Aritmética S60 Base-60 fixed-point (sin floats)
├── quantum/              Bio-Resonador + Detector de fase
├── harmonic.rs           Lógica Armónica (6 estados)
├── scheduler.rs          Planificador Adaptativo V2 (94.4% eficiencia)
└── memory.rs             Memoria vectorial con embeddings

UI — React + TypeScript (Next.js)
└── Dashboard, Telemetría Ring-0, Consola Truth Claim
```

## Stack

| Capa     | Tecnología                          |
|----------|-------------------------------------|
| Kernel   | eBPF (LSM, XDP, TC), libbpf, clang  |
| Backend  | Rust 1.75+, Axum, Tokio, libbpf-rs  |
| Frontend | Next.js, React, TypeScript          |
| Infra    | CubePath, Docker, Rocky Linux 10    |
| Matemática | S60 Base-60 fixed-point (i64)     |

## API principal

| Endpoint                   | Método | Descripción                              |
|----------------------------|--------|------------------------------------------|
| `/health`                  | GET    | Health check                             |
| `/api/v1/sentinel_status`  | GET    | Estado completo (ring, bio, XDP, LSM)    |
| `/api/v1/truth_claim`      | POST   | Verificar intención de agente IA         |
| `/api/v1/telemetry`        | WS     | Stream de eventos Ring-0 en tiempo real  |

## Despliegue (CubePath)

```bash
# cubepath.yaml define dos servicios:
# - api (puerto 8000): Backend Rust
# - dashboard (puerto 3000): Frontend Next.js
docker compose up --build
```

## Métricas clave

| Métrica              | Valor     |
|----------------------|-----------|
| Latencia XDP         | < 0.04 ms |
| Precisión S60        | ±0.0077 ppm |
| Eficiencia scheduler | 94.4%     |
| Ahorro CPU           | 62.9% vs ptrace |

## Desarrollador

**Jaime Novoa** — janovoas / jaime.novoase@gmail.com
