# Hardening de Seguridad VPS — Hackathon CubePath 2026

Este documento registra la planificación y ejecución del endurecimiento de seguridad realizado sobre el nodo `vps23309.cubepath.net` durante el directo de evaluación de la hackathon.

## 📋 Planificación (Estrategia de Ciberdefensa)

### Objetivos
- **Cerrar exposición de puertos administrativos:** Prometheus (9090) y Node Exporter (9100) estaban accesibles públicamente.
- **Aislamiento de servicios Backend:** Asegurar que solo Nginx pueda comunicarse con los servicios de backend.
- **Verificación de Integridad Ring-0:** Confirmar que los ganchos de eBPF están cargados y protegiendo el sistema.
- **Mantenimiento de Disponibilidad:** Realizar cambios con el mínimo impacto en el Dashboard vivo.

### Tareas Planificadas
1. **Docker Network Isolation:** Modificar `docker-compose.yml` para vincular puertos sensibles a `127.0.0.1`.
2. **Firewall (L3/L4):** Aplicar reglas de `nftables` para bloquear accesos directos por IP.
3. **Auditoría de Secretos:** Asegurar permisos `600` en archivos `.env`.
4. **Verificación eBPF:** Diagnóstico de carga de hooks LSM/XDP.

---

## 🚀 Ejecución (Log de Actividades)

### Sesión: 2026-04-01T14:45Z
- [x] **Auditoría Inicial**: Identificación de puertos `9090` y `9100` expuestos en `[::]`.
- [x] **Plan de Hardening**: Aprobado por el usuario.
- [x] **F1: Aislamiento en Docker-Compose**: Ejecutado. Se corrigieron conflictos de nombres de contenedores (`sentinel-node-exporter`, `sentinel-promtail`) mediante un ciclo de `docker compose down && up -d`.
- [ ] **F2: Cortafuegos**: (Pendiente)

---

## 🔍 Hallazgos de Auditoría (Estado Previo)
- **SSHD**: Corriendo en puerto no estándar `4222` (Buena práctica de obscuridad).
- **Public Exposure**: Prometheus accesible sin autenticación por puerto directo.
- **eBPF Guardian**: No se detectaron hooks de LSM en `bpftool prog list`. Se requiere investigación.

---
*Este documento se actualiza dinámicamente durante la intervención.*
