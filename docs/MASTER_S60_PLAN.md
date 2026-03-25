# 🚀 Plan Maestro de Despliegue: Sentinel Ring-0 (Hackatón CubePath)

Este documento detalla la planificación de desarrollo, implementación y despliegue del nodo soberano en una instancia de Rocky Linux 10 con 4GB de RAM.

---

## 📅 Hoja de Ruta de Hackatón

### 🟢 Fase 1: Cimiento del Nodo (T+0m)
*   **SO**: Rocky Linux 10 (mínimo).
*   **Dependencias Críticas**:
    ```bash
    dnf install -y clang llvm libbpf-devel elfutils-libelf-devel openssl-devel git make cmake
    ```
*   **Instalación de Rust**: 
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

### 🛰️ Fase 2: Ring-0 Intersección (T+20m)
1.  **Montaje de BPF FS**: `mount -t bpf bpf /sys/fs/bpf/`.
2.  **Compilación de Guardianes**:
    ```bash
    cd backend/ebpf && make all
    ```
3.  **Carga LSM**: Cargar `guardian_alpha_lsm`, `lsm_ai_guardian` y `tc_firewall` en el kernel.

### 🛡️ Fase 3: Construcción Segura (T+45m)
*   **Estrategia RAM (OOM Avoidance)**:
    ```bash
    cd backend && cargo build --release -j 2
    ```
*   **Configuración .env**: 
    ```bash
    cp .env.example .env
    # Editar: NEXT_PUBLIC_API_URL=https://api.tu-instancia.cubepath.app
    ```

### 🎨 Fase 4: Despliegue de Dashboard (T+75m)
*   **Compilación Next.js**: 
    ```bash
    cd frontend && npm install && npm run build
    ```
*   **Startup**: Iniciar el API de Rust y el Frontend en paralelo mediante `docker-compose up -d --build`.

### 🔥 Fase 5: Validación de Inhackeabilidad (T+120m)
*   **Drill de Seguridad**:
    1. Ejecutar intento de ataque semántico en la UI.
    2. Simular silencio biométrico (dejar pasar 30s sin pulso).
    3. Verificar que `tc_firewall` bloquee todo tráfico IP entrante.
    4. Confirmar el estado **SEALED** en el dashboard.

---

## 🛠️ Notas de Implementación Post-Hackatón
*   **Escalado SGG**: Migración a los 4 nodos SGG-LATAM (Chile, Brasil, México) usando la red Mycnet.
*   **Endurecimiento WASM**: Integración de `sentinel-sandbox` para ejecutar herramientas agénticas aisladas.
*   **Forense WAL**: Habilitar el canal de auditoría inmutable de 32 bytes para cumplimiento.

---

**Sentinel Ring-0 = Domination de Infraestructura Soberana.** 🛡️⚡
