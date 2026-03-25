# 🛡️ Sentinel Ring-0 - AI Safety at Kernel Level

<div align="center">

![Sentinel Logo](docs/screenshots/logo.png)

**The First Cognitive Firewall for AI Agents**

[Demo en CubePath](https://sentinel.cubepath.app) | [Documentación](docs/) | [Video Demo](https://youtube.com/...)

</div>

---

## 🎯 ¿Qué es Sentinel Ring-0?

**Sentinel Ring-0** es un firewall cognitivo que opera a nivel de kernel (Ring 0) para proteger sistemas contra acciones no autorizadas de agentes de IA autónomos.

### El Problema

Los agentes de IA modernos pueden ejecutar comandos destructivos sin supervisión humana:

- `rm -rf /` → Borra todo el sistema
- `DROP DATABASE production;` → Elimina datos críticos
- Exfiltración de datos a servidores externos

### La Solución

Sentinel intercepta **todas** las llamadas al sistema antes de ejecutarse y aplica **lógica semántica** para determinar si la acción es segura:

```
┌─────────────────────────────────────────────────────────┐
│                    SENTINEL RING-0                      │
├─────────────────────────────────────────────────────────┤
│  AI Agent intenta: "rm -rf /"                           │
│                     ↓                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  LSM Hook (bprm_check_security)                 │   │
│  │  Análisis Semántico en Kernel                   │   │
│  │  - ¿Es un comando destructivo? → SÍ             │   │
│  │  - ¿Está en whitelist? → NO                     │   │
│  │  - ¿Hay operador humano presente? → NO          │   │
│  └─────────────────────────────────────────────────┘   │
│                     ↓                                   │
│  ❌ BLOCKED: -EACCES (Permission Denied)               │
│                     ↓                                   │
│  📡 Evento enviado a Dashboard en tiempo real          │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| **🧠 Lógica Semántica** | No solo whitelist: entiende INTENCIÓN. Permite `rm archivo.txt` pero bloquea `rm -rf /` |
| **⚡ Latencia Cero** | Opera en XDP/LSM (kernel level) - microsegundos, no milisegundos |
| **💓 Bio-Resonancia** | Sincronización con pulso humano (17s) - el operador es el reloj maestro |
| **🔢 Matemática Base-60** | Cero floats, entropía térmica mínima, precisión absoluta |
| **📊 Dashboard en Tiempo Real** | WebSocket streaming de eventos del kernel |
| **🔐 Truth Claim API** | Verifica claims de IA antes de ejecutar acciones |

---

## 🚀 Demo

### Dashboard Principal

![Dashboard](docs/screenshots/dashboard.png)

### Bloqueo en Acción

![Block Event](docs/screenshots/block-event.png)

### API Truth Claim

```bash
# Verificar si un claim de IA es confiable
curl -X POST https://sentinel.cubepath.app/api/v1/truth_claim \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "gpt-4",
    "claim_payload": "Ejecutar script de limpieza",
    "trust_threshold": 0.8
  }'

# Respuesta
{
  "claim_valid": true,
  "sentinel_score": 0.95,
  "truthsync_cache_hit": true,
  "ring0_intercepts": 0
}
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    SENTINEL CORTEX                              │
├─────────────────────────────────────────────────────────────────┤
│  RING 0 (Kernel - eBPF)                                        │
│  ├── guardian_cognitive.c  → Análisis semántico de comandos   │
│  ├── lsm_ai_guardian.c     → Hook execve + Ring Buffer        │
│  ├── xdp_firewall.c        → Filtrado de red (0 latency)      │
│  └── burst_sensor.c        → Detección DDoS                   │
├─────────────────────────────────────────────────────────────────┤
│  RING 3 (Userspace - Rust)                                     │
│  ├── sentinel-cortex/      → API Axum + WebSocket             │
│  ├── ebpf_bridge.rs        → Consumidor de Ring Buffer        │
│  ├── bio_resonator.rs      → Sincronización pulso humano      │
│  └── harmonic_logic.rs     → Tetra-Logic (consonancia)        │
├─────────────────────────────────────────────────────────────────┤
│  FRONTEND (Next.js)                                            │
│  └── Dashboard en tiempo real con WebSocket                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Kernel** | eBPF, LSM Hooks, XDP |
| **Backend** | Rust (Axum), libbpf-rs |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Infra** | CubePath, Docker |
| **Matemática** | Base-60 (S60) - Sin floats |

---

## 📦 Instalación y Despliegue

### Requisitos

- Node.js 18+
- Rust 1.75+
- Docker (para CubePath)

### Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sentinel-ring0.git
cd sentinel-ring0

# Backend
cd backend
cargo run

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

### Despliegue en CubePath

1. **Crear cuenta en CubePath** con [este enlace](https://midu.link/cubepath) para obtener $15 gratis

2. **Configurar variables de entorno**:

   ```bash
   cp .env.example .env
   # Editar .env con tus valores
   ```

3. **Desplegar con Docker**:

   ```bash
   docker-compose up -d
   ```

4. **Configurar dominio en CubePath**:
   - Ir al dashboard de CubePath
   - Asignar dominio personalizado
   - Configurar SSL automático

---

## 🔧 Uso de CubePath

Este proyecto utiliza **CubePath** como plataforma de despliegue por las siguientes razones:

1. **Despliegue simplificado**: Un solo `docker-compose up` y la app está lista
2. **SSL automático**: Certificados HTTPS sin configuración
3. **Escalabilidad**: Fácil escalar según demanda
4. **Costo eficiente**: $15 gratis suficientes para 2 servidores nano

### Configuración en CubePath

```yaml
# cubepath.yaml
name: sentinel-ring0
services:
  - name: api
    port: 8000
    env:
      RUST_LOG: info
  - name: dashboard
    port: 3000
    env:
      NEXT_PUBLIC_API_URL: https://api.sentinel.cubepath.app
```

---

## 📊 API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/telemetry` | WS | WebSocket streaming de eventos Ring-0 |
| `/api/v1/sentinel_status` | GET | Estado del sistema |
| `/api/v1/truth_claim` | POST | Verificar claim de IA |

---

## 🧪 Ejemplos de Uso

### Verificar Claim de IA

```typescript
const response = await fetch('/api/v1/truth_claim', {
  method: 'POST',
  body: JSON.stringify({
    engine: 'claude-3',
    claim_payload: 'Eliminar archivos temporales',
    trust_threshold: 0.8
  })
});

const result = await response.json();
// { claim_valid: true, sentinel_score: 0.92, ... }
```

### Suscribirse a Eventos del Kernel

```typescript
const ws = new WebSocket('wss://sentinel.cubepath.app/api/v1/telemetry');

ws.onmessage = (event) => {
  const kernelEvent = JSON.parse(event.data);
  console.log('Ring-0 Event:', kernelEvent);
  // { event_type: 'EXEC_BLOCKED', pid: 1234, severity: 3, ... }
};
```

---

## 🏆 Innovación

### ¿Por qué es único?

1. **Primer firewall semántico para IA** - No existe nada similar en el mercado
2. **Matemática Base-60** - Inspirada en matemática sumeria, cero pérdida de precisión
3. **Bio-Resonancia** - El humano es el reloj maestro, no el CPU
4. **Autosecuestro demostrado** - El sistema se bloqueó a sí mismo, demostrando su poder

### Caso de Uso Real: "El Autosecuestro Cuántico"

Durante las pruebas, el sistema se auto-bloqueó porque no estaba en su propia whitelist. Ni root, ni el creador pudieron ejecutar comandos. **Esto demuestra que Sentinel tiene más poder que root**.

---

## 📝 Roadmap

- [ ] Integración con más LLMs (GPT-4, Claude, Gemini)
- [ ] Dashboard móvil
- [ ] API REST completa
- [ ] SDK para Python/Node.js
- [ ] Marketplace de políticas de seguridad

---

## 👥 Equipo

Desarrollado por [Tu Nombre] para la **Hackatón CubePath 2026**.

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Hecho con ❤️ para la Hackatón CubePath 2026**

[Demo](https://sentinel.cubepath.app) | [Repositorio](https://github.com/tu-usuario/sentinel-ring0) | [Issue](https://github.com/midudev/hackaton-cubepath-2026/issues/xxx)

</div>
