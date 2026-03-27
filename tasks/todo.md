# 🛠️ Sentinel Ring-0: Task List (Hackatón Soberana)

Lista de tareas para la ejecución del despliegue en CubePath (Rocky Linux 10, 4GB RAM).

---

## 📅 Hito 0: Preparación Local (Hecho)

- [x] Initializar Git y realizar el primer commit maestro.
- [x] Refactorizar `EbpfBridge` (de Mock a libbpf-rs real).
- [x] Sincronizar axiomas matemáticos S60.
- [x] Copiar código fuente de eBPF (`backend/ebpf/`).
- [x] Crear el `Makefile` para guardianes Ring 0.
- [x] Optimizar `Dockerfile` para Rocky Linux y restringir hilos (`-j 2`).
- [x] Rediseñar la UI para estética Cyber-Dark Premium.
- [x] Crear plan maestro de despliegue (`MASTER_S60_PLAN.md`).

---

## 📅 Hito 1: Infraestructura de Instancia (Completado)

- [x] Crear instancia de Rocky Linux 10 en CubePath (4GB RAM).
- [x] Clonar el repositorio `sentinel-cubepath`.
- [x] Instalar dependencias: `clang`, `llvm`, `libbpf-devel`, `rustup`.
- [x] Habilitar el sistema de archivos BPF: `mount -t bpf bpf /sys/fs/bpf/`.
- [x] Configurar `/etc/ssh/sshd_config` acorde a las necesidades de la hackatón.

---

## 📅 Hito 2: Compilación y Carga (Completado)

- [x] Compilar guardianes: `cd backend/ebpf && make all`.
- [x] Cargar módulos LSM/XDP: `make load`.
- [x] Compilar backend: `cargo build --release -j 2`.
- [x] Compilar frontend: `npm run build`.

---

## 📅 Hito 3: Validación Final (En ejecución)

- [x] Iniciar el API de Sentinel (`./target/release/sentinel-cortex`).
- [x] Iniciar el Dashboard en el puerto 3000 (Verificado en `vps23309.cubepath.net`).
- [/] Probar el **Arco de Reflejo**: Verificar bloqueo de red al llegar la Coherencia Bio a 0.
- [ ] Comprobar el log de RingBuffer del kernel (`bpftool prog list`).

---

**Soberanía Lógica = Estabilidad del Sistema.** 🛡️
