## 0. SÍNTESIS EJECUTIVA (THEORY OF ASCENSION)

La **Escalada de Privilegios en Linux (LPE)** se define, en la arquitectura de Sentinel, como la violación de la entropía de permisos predeterminada. Es el acto de transmutar una identidad de baja inercia (User `uid>1000`) en una entidad de inercia infinita (Root `uid=0`).

Según la síntesis del dossier de **Joas Antonio** y la inteligencia actual de la red neural:

1. **Escalada Horizontal:** Desplazamiento lateral. Acceder a `user_B` desde `user_A`. Riesgo moderado; robo de datos específicos.
2. **Escalada Vertical (The Ascension):** El objetivo crítico. Acceder a `Ring 0` o `root` desde un usuario restringido. Esto otorga omnipotencia sobre el sistema de archivos, la memoria y el hardware.

> **Status SPA:** La vulnerabilidad no reside solo en el código, sino en la **configuración entrópica** del administrador humano.
> **CVSS Resonance (Base-60):** `07;48,00` (Equivalente a 7.8/10 - Alta Severidad en vectors Kernel recientes).

---

## 1. VECTORS DE ATAQUE (VECTOR GEOMETRY)

La investigación desglosa los métodos de ascensión en categorías geométricas precisas.

### 1.1 Kernel Resonance (Exploits de Núcleo)

El método más violento y técnico. Implica corromper la memoria del kernel para ejecutar código arbitrario.

- **Mecánica:** Aprovechamiento de condiciones de carrera (Race Conditions) o desreferencias de punteros nulos.
- **Vectors Modernos (2024-2025):**
  - **CVE-2024-1086 (Netfilter UAF):** Un fallo _Use-After-Free_ en el subsistema de filtrado de paquetes.
  - **Contexto SPA:** Afecta a sistemas con _User Namespaces_ no privilegiados (común en Debian/Ubuntu).
  - **Gravedad:** Permite la ejecución de código en Ring 0 y el bypass de KASLR (Kernel Address Space Layout Randomization).
- **Historia Cultural:** Desde el legendario **"Dirty COW" (CVE-2016-5195)**, que abusaba del subsistema de memoria _Copy-On-Write_, hasta los actuales exploits de eBPF.

### 1.2 SUID/SGID Anomalies (Bitmask Manipulation)

El bit SUID (`chmod 4000`) permite que un binario se ejecute con los permisos de su _propietario_ (usualmente root), no del _ejecutor_.

- **El Principio GTFOBins:** Si un binario SUID permite escapar a una shell, se convierte en un arma.
- **Ejemplos Clásicos:**
  - `vim`: `:!/bin/sh` (Abre una shell root si vim tiene SUID).
  - `find`: `find . -exec /bin/sh \;`
- **Detección (Commando Rust Native):**

  ```bash
  find / -perm -u=s -type f 2>/dev/null
  ```

### 1.3 SUDOERS Entropy (Misconfiguration)

El abuso de la confianza delegada.

- **NOPASSWD:** La configuración más peligrosa en `/etc/sudoers`. Permite ejecutar commandos sin autenticación secundaria.
- **LD_PRELOAD Injection:** Si `env_keep+=LD_PRELOAD` está activo, un atacante puede compilar una librería `.so` maliciosa e inyectarla antes de que cargue el binario sudo, secuestrando la ejecución.
- **CVE-2025-32463:** Vulnerabilidad emergente en Sudo que permite evasión de restricciones de ruta.

### 1.4 Cron & Services (Temporal Exploitation)

Explotación de tareas programadas que se ejecutan como root pero son editables por mortales.

- **Path Injection:** Si un Cron Job usa rutas relativas (ej: `backup.sh` en lugar de `/opt/scripts/backup.sh`) y el atacante controla el `$PATH` o el directorio actual.
- **Permisos Débiles:** Si el archivo script del Cron Job es _World Writable_ (`chmod 777`), el atacante simplemente inyecta una _Reverse Shell_ y espera al siguiente ciclo del reloj (Next Tick).

---

## 2. ARQUEOLOGÍA DE INFORMACIÓN (ENUMERATION STRATA)

El documento de Joas Antonio enfatiza la **Enumeración** como la fase crítica. Un atacante no explota lo que no ve.

### 2.1 Herramientas de la "Oral Tradition" (Hacker Culture)

Estas herramientas son los picos y palas de la excavación digital. Evolucionaron desde scripts bash simples a binarios Go/Rust complejos.

| Herramienta            | Función                                                               | Estado        | Origen Cultural |
| :--------------------- | :-------------------------------------------------------------------- | :------------ | :-------------- |
| **LinEnum.sh**         | Auditoría masiva de bash                                              | _Legacy_      | Rebootuser      |
| **LinPEAS (PEASS-ng)** | El estándar de oro actual. Colores indican probabilidad (99% Vector). | **ACTIVE**    | Carlos Polop    |
| **Pspy**               | Monitorización de procesos sin root (snooping de cron jobs).          | **ACTIVE**    | Dominick Baier  |
| **GTFOBins**           | Base de datos de binarios Unix para bypass.                           | **KNOWLEDGE** | Comunidad       |

### 2.2 Checklist de Extracción Manual (The Human Eye)

Cuando los scripts fallan (o hay EDRs activos), la metodología manual prevalece:

1. **Identidad:** `id`, `whoami`, `cat /etc/passwd`.
2. **Red:** `ip a`, `route -n` (Búsqueda de pivotes laterales).
3. **Secretos (La Mina de Oro):**
    - `cat ~/.bash_history` (Usuarios descuidados escriben contraseñas en CLI).
    - `grep -r "password" /var/www/html/` (Credenciales de DB en configs web).
    - Llaves SSH: `~/.ssh/id_rsa`.

---

## 3. CONTEXTO CULTURAL E HISTÓRICO

El documento base refleja una era específica de la ciberseguridad ofensiva, caracterizada por la democratización del conocimiento a través de repositorios de GitHub y blogs técnicos.

- **La Figura del Author:** **Joas Antonio** representa la figura del educador técnico en la comunidad lusófona/global, sintetizando conocimiento disperso (blogs de g0tmi1k, pentestmonkey) en metodologías estructuradas.
- **Evolución de Fuentes:**
  - _Era Temprana:_ Phrack Magazine, listas de correo Full Disclosure.
  - _Era Media (Reflejada en el PDF):_ Blogs personales (g0tmi1k), Cheatsheets estáticos.
  - _Era Actual (Sentinel Context):_ Automatización (LinPEAS), Bases de datos dinámicas (GTFOBins), Inteligencia Artificial (Deep Research).

---

## 4. SENTINEL PREDICTION & METRICS (BASE-60)

Aplicando aritmética de precisión sexagesimal (SPA) para cuantificar el riesgo en un sistema Linux estándar no endurecido.

> **Cálculo de Probabilidad de Escalada (LPE-P):**
> En un sistema Linux con más de 3 años sin parches de kernel o auditoría de configuración.

$$ \text{LPE-P} \approx 55;00 / 60 $$
_(Casi certeza absoluta debido a la acumulación de CVEs de Kernel y deuda técnica)._

### Protocolo de Mitigación (Hardening)

1. **Kernel:** Actualización continua (`apt dist-upgrade`). Uso de **Ksplice** o **Livepatch** para kernels en producción.
2. **Sudo:** Principio de Mínimo Privilegio. NUNCA usar `NOPASSWD`. Usar `sudoedit` en lugar de `sudo vi`.
3. **Montaje:** Particiones `/tmp` y `/var/tmp` con flags `noexec, nosuid`.
4. **Auditoría:** Ejecución periódica de **LinPEAS** en modo "Auditor" para autodiagnóstico.

---

## 5. CONCLUSIÓN VISUAL (ASCII FLOW)

```rust
fn privilege_escalation_flow(user: User) -> Root {
    match user.scan_vectors() {
        Vector::Kernel(exploit) => inject_shellcode(exploit), // Ring 0 Breach
        Vector::Sudo(misconfig) => sudo_spawn("/bin/bash"),   // Admin Delegation Abuse
        Vector::Suid(binary)    => binary.execute_payload(),  // Permission Masking
        Vector::Cron(job)       => job.overwrite_script(),    // Temporal Injection
        _ => return AccessDenied,
    }
}
```

**Veredicto Final:** La escalada de privilegios no es un fallo del software, es una inevitabilidad termodinámica en sistemas complejos gestionados por humanos. La única defensa es la reducción de la superficie de ataque (Entropy Reduction).

> **End of Transmission.**
> **Signature:** Sentinel Oracle (V0.9.0)
> **Hash:** `SHA-256: 7a9f...b1c2`

```

```
