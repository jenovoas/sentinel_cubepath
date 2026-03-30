# 🧠 Lecciones Aprendidas: Protocolo de Ingeniería Sentinel

## 1. Reglas de Despliegue y Nodos (CRÍTICO)

- **Hackatón (Sentinel-CubePath)**: VPS remoto en puerto **4222**. Único target.

## 2. No Deducir / No Simplificar

- **Cero Floats**: La matemática debe ser S60 pura. Se prohíbe el uso de `f64` incluso para semillas iniciales.
- **Ciclo YHWH**: La modulación de entropía debe seguir el patrón 10-5-6-5.
- **Memoria Holográfica**: El lattice requiere difusión de errores y snapping cuántico real.

## 3. Protocolo de Auditoría (Antes de cada comando)

1. Leer el [Manifiesto de Ingeniería](file:///home/jnovoas/Desarrollo/sentinel-cubepath/docs/ENGINEERING_MANIFESTO.md).
2. Consultar las [Memorias Técnicas](file:///home/jnovoas/Desarrollo/sentinel-cubepath/docs/Memorias/).
3. Verificar el estado del servicio en el nodo remoto (`ssh -p 4222`).

## 4. Reglas de Operación del Asistente (Inviolables)
- **Idioma**: Toda comunicación y documentación DEBE ser en español (Chile/España). Prohibido inyectar inglés.
- **Prohibición de RM**: El comando `rm` está terminantemente prohibido. Cualquier limpieza se solicita al usuario o se comenta el código.
- **Pre-lectura Obligatoria**: Antes de proponer cualquier cambio complejo, leer: `PROTOCOLO_YATRA.md`, `ENGINEERING_MANIFESTO.md`, `lessons.md` y `SYSTEM-PROMPT.md`.
- **Soberanía S60**: No proponer ni aceptar ninguna simplificación que use `f32/f64`. El compilador está ahora configurado con `clippy-driver` para rechazarlo.
- **Cero Distracciones**: Si no hay una tarea clara, investigar en silencio y reportar hallazgos de forma concisa.

## 5. Reglas de Despliegue Frontend (CRÍTICO — aprendido 2026-03-29)

- **NO ejecutar `npm run build`**: El servicio usa `npm run dev`. Ejecutar un build de producción interfiere con el dev server y rompe el CSS. Está **prohibido** salvo instrucción explícita del usuario.
- **Cambios en el frontend**: Solo editar el archivo fuente. El dev server (`npm run dev`) recarga automáticamente. No se necesita ningún build ni restart.
- **Si el frontend se cae**: La única acción permitida sin aprobación es `systemctl status`. Para reiniciar, **solicitar aprobación explícita**.
- **`rm` sigue prohibido sin excepción**: Incluso para limpiar artefactos de build que yo mismo creé por error.
- **Múltiples restarts = procesos zombie**: Cada `systemctl restart` sin esperar que el proceso anterior muera puede dejar instancias zombie bloqueando puertos. Diagnóstico obligatorio con `ss -tlnp | grep 300` antes de cualquier restart adicional.

## 6. Somos el Nodo (CRÍTICO — aprendido 2026-03-30)

- **Este entorno YA ES el VPS** `vps23309.cubepath.net`. JAMÁS usar SSH para conectarse a sí mismo.
- **Para verificar procesos**: usar `ps aux`, `systemctl status`, `journalctl` directamente.
- **Para desplegar**: editar el archivo fuente. El `npm run dev` (HMR) recarga automáticamente.
- **Si el usuario ve la versión vieja en el browser**: indicar `Ctrl+Shift+R` (hard refresh). El servidor ya tiene el código actualizado.

---

_Estas lecciones son vinculantes para Antigravity AI en cada turno de esta sesión y futuras._
