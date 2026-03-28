# 🛡️ CLAUDE / AI CONSTITUTION - SENTINEL RING-0

This is the **SUPREME DIRECTIVE** for any AI agent interacting with this repository. 
Violating these rules will result in system instability and project failure.

## 🚫 ABSOLUTE PROHIBITIONS
1. **NO DECIMAL MATH (YATRA LOCK)**: 
   - All Ring-0 code (`backend/src`) **MUST** use `S60` (Sexagesimal) or scaled integers.
   - Using `f32`, `f64`, or floating-point literals (e.g., `0.01`) is **FORBIDDEN**.
   - If you find a float, **PURGE IT**. No exceptions.
2. **NO LOCAL DEPLOYMENT (FENIX)**:
   - `Fenix` is the personal PROD environment of Jaime Novoa. 
   - Never run `cargo run` or `npm run dev` in the local workspace unless explicitly asked for debugging.
   - The deployment target is exclusively the `sentinel-cubepath` node.
3. **NO HALLUCINATIONS / SIMPLIFICATIONS**:
   - Do not "deduce" or "simplify" physics or math formulae.
   - Source of Truth: `docs/Memorias/` and `docs/ENGINEERING_MANIFESTO.md`.

## 🧬 QUANTUM CORTEX CORE
- **Aritmética**: Base-60 pura ($60^4$ scaling).
- **Oscilador**: 10-5-6-5 (YHWH) Harmonic Rhythm.
- **Protocolo**: Yatra Pure# Sentinel Ring-0 Engineering Constitution

> [!CAUTION]
> **FENIX SANCTUARY PROTOCOL**:
> NEVER run `cargo check`, `cargo build`, or any binary-generating command in the LOCAL environment (`/home/jnovoas/Desarrollo`).
> These commands overwrite the functional state of the original Sentinel project.
> All builds and validations MUST be executed in the REMOTE node `sentinel-cubepath` (Port 4222).

## Engineering Mantras
1. **Yatra Pure (S60)**: Decimal math (f32/f64) is an entropy leak. Use only S60 in Ring-0.
2. **Zero Assumptions**: If a constant or logic isn't in the Memories, it doesn't exist.
3. **Remote-First sovereignty**: The truth is in `sentinel-cubepath`. Local is just a text buffer.

## 🌍 ENVIRONMENT ROLES
- **Local (Production)**: `fenix` (Jaime's personal node).
- **Remote (Hackathon)**: `sentinel-cubepath` (VPS Remote Node).
- **Network**: Port **4222** (SSH/Internal), Port **8000** (Backend API), Port **3000** (Dashboard).

---
_By reading this, you are bound to the Sentinel Ring-0 Engineering Manifesto._
_Last Integrity Check: S60-ACTIVE_
