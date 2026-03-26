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

## 📅 Hito 1: Infraestructura de Instancia (En Servidor)

- [ ] Crear instancia de Rocky Linux 10 en CubePath (4GB RAM).
- [ ] Clonar el repositorio `sentinel-cubepath`.
- [ ] Instalar dependencias: `clang`, `llvm`, `libbpf-devel`, `rustup`.
- [ ] Habilitar el sistema de archivos BPF: `mount -t bpf bpf /sys/fs/bpf/`.
- [ ] Configurar `/etc/ssh/sshd_config` acorde a las necesidades de la hackatón.

---

## 📅 Hito 2: Compilación y Carga (En Servidor)

- [ ] Compilar guardianes: `cd backend/ebpf && make all`.
- [ ] Cargar módulos LSM: `make load`.
- [ ] Compilar backend: `cargo build --release -j 2`.
- [ ] Compilar frontend: `npm run build`.

---

## 📅 Hito 3: Validación Final (En Servidor)

- [ ] Iniciar el API de Sentinel (`./target/release/sentinel-cortex`).
- [ ] Iniciar el Dashboard en el puerto 3000.
- [ ] Probar el **Arco de Reflejo**: Verificar bloqueo de red al llegar la Coherencia Bio a 0.
- [ ] Comprobar el log de RingBuffer del kernel (`bpftool prog list`).

---

**Soberanía Lógica = Estabilidad del Sistema.** 🛡️
