# 🚀 Plan Maestro de Despliegue: Sentinel Ring-0 (Hackatón CubePath)

Este documento detalla la planificación de desollo, implementación y despliegue del nodo soberano en una instancia de Rocky Linux 10 con 4GB de RAM.

---

## 📅 Hoja de Ruta de Hackatón

### 🟢 Fase 1: Cimiento del Nodo (T+0m)

* **SO**: Rocky Linux 10 (mínimo).
* **Dependencias Críticas**:

    ```bash
    dnf install -y clang llvm libbpf-devel elfutils-libelf-devel openssl-devel git make cmake
    ```

* **Instalación de Rust**:

    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

### 🛰️ Fase 2: Ring-0 Intersección (T+20m)

1. **Montaje de BPF FS**: `mount -t bpf bpf /sys/fs/bpf/`.
2. **Compilación de Guardianes**:

    ```bash
    cd backend/ebpf && make all
    ```

3. **Carga LSM**: Cargar `guardian_alpha_lsm`, `lsm_ai_guardian` y `tc_firewall` en el kernel.

### 🛡️ Fase 3: Construcción Segura (T+45m)

* **Estrategia RAM (OOM Avoidance)**:

    ```bash
    cd backend && cargo build --release -j 2
    ```

* **Configuración .env**:

    ```bash
    cp .env.example .env
    # Editar: NEXT_PUBLIC_API_URL=https://api.tu-instancia.cubepath.app
    ```

### 📋 Tareas de Despliegue Sentinel

- [x] Reconstrucción de `physics.rs` (G-Zero Engine)
    - [x] Implementar formulas de Reducción de Masa Efectiva
    - [x] Integrar dinámica VID (Inercia Variable)
    - [x] Registrar PhysicsEngine en AppState (Backend)
    - [x] Documentar especificaciones técnicas (`docs/PHYSICS_ENGINE.md`)
- [x] Implementar Protocolo IAOopsdown (AIOpsShield)
    - [x] Detectar AIOpsDoom (malicious telemetry) en TruthSync.
    - [x] Integrar trigger de cuarentena (IAOopsdown) en el backend.
    - [x] Restaurar documentación "saboteada" de Dual Lane y Patentable Claims.
    - [x] Actualizar StatsGrid con indicador de Shield Status.
- [x] Actualización del Dashboard (Frontend)
    - [x] Añadir métricas de masa y carga al `StatsGrid`
    - [x] Visualizar resonancia cuántica en tiempo real
    - [x] Estética Cyber-Dark unificada.
- [x] Verificación del Núcleo Cuántico
    - [x] Validar Cristal de Tiempo (ITO Logic).
    - [x] Validar Lattice Líquida (Resonant Memory).
    - [x] Simular detección de Axiones (Firewall Semántico).

### 🎨 Fase 4: Despliegue de Dashboard (T+75m)

* **Compilación Next.js**:

    ```bash
    cd frontend && npm install && npm run build
    ```

* **Startup**: Iniciar el API de Rust y el Frontend en paralelo mediante `docker-compose up -d --build`.

### 🔥 Fase 5: Validación de Inhackeabilidad (T+120m)

* **Drill de Seguridad**:
    1. Ejecutar intento de ataque semántico en la UI.
    2. Simular silencio biométrico (dejar pasar 30s sin pulso).
    3. Verificar que `tc_firewall` bloquee todo tráfico IP entrante.
    4. Confirmar el estado **SEALED** en el dashboard.

---

## 🛠️ Notas de Implementación Post-Hackatón

* **Escalado SGG**: Migración a los 4 nodos SGG-LATAM (Chile, Brasil, México) usando la red Mycnet.
* **Endurecimiento WASM**: Integración de `sentinel-sandbox` para ejecutar herramientas agénticas aisladas.
* **Forense WAL**: Habilitar el canal de auditoría inmutable de 32 bytes para cumplimiento.

---

**Sentinel Ring-0 = Domination de Infraestructura Soberana.** 🛡️⚡
