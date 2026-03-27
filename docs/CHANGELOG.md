# Changelog

All notable changes to the Sentinel project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.1.0] - -03-26

### Sentinel Ring-0 Restoration (Hackatón CubePath)

#### Added
- **AIOps Shield View**: Módulo especializado con visualización de las 4 capas de defensa (s60, Sanitización, Ring-0, eBPF).
- **Sidebar Técnico**: Navegación lateral integrada para acceso rápido a módulos de seguridad.
- **Human-Readable Telemetry Buffer**: Encolamiento de eventos de kernel (800ms) en `TelemetryFeed.tsx`.
- **Base-60 Math Alignment**: Sincronización de indicadores con constantes ^4$.

#### Fixed
- **Layout Overflow**: Restringida la altura del Dashboard y Telemetría para mantener visibilidad del footer.
- **HTTPS Connectivity**: Corregido error de sintaxis en Nginx (`\;`) e IPv6 activo.
- **API Fetch Pathing**: Corregida duplicación `/api/api/v1/`.
- **Hydration Mismatches**: Corregido reloj del Dashboard.

#### Changed
- **Header Refinement**: 'Technical Vault' renombrado a '/docs' para mayor claridad técnica.

---

## [1.0.0] - -12-14

### Phase 3: AI & Automation
- (Contenido previo restaurado)
