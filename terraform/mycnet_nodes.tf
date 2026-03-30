# terraform/mycnet_nodes.tf
# MyCNet Batman-adv — 6 nodos hexagonales adicionales  
# Basado en ARCHITECTURE.md: topología hexagonal, batctl, S60, Mycelium Sync
# Hackaton CubePath 2026 — Jaime Novoa

terraform {
  required_providers {
    cubepath = {
      source  = "cubepath/cubepath"
      version = "~> 1.0"
    }
  }
}

# ─── Variables ────────────────────────────────────────────────────────────────

variable "primary_node_ip" {
  description = "IP del nodo primario vps23309 (ya desplegado)"
  default     = "vps23309.cubepath.net"
}

variable "sentinel_image" {
  description = "Imagen base Rocky Linux 10"
  default     = "rocky-linux-10"
}

variable "ssh_public_key" {
  description = "Tu clave publica SSH"
}

variable "cubepath_api_token" {
  description = "CubePath API Token"
  sensitive   = true
}

provider "cubepath" {
  api_token = var.cubepath_api_token
}

# ─── Nodos hexagonales S60 ────────────────────────────────────────────────────
# Topologia: 1 nodo primario central + 6 nodos en anillo hexagonal
# Frecuencias S60 regulares (5-smooth) para maxima coherencia de enlace
# Subred 10.60.0.x — tributo Base-60

locals {
  # Angulos hexagonales: 0, 60, 120, 180, 240, 300 grados
  mycnet_nodes = {
    "node-01" = { angle = 0,   s60_freq = 60, role = "gateway",  ip_suffix = 2 }
    "node-02" = { angle = 60,  s60_freq = 30, role = "storage",  ip_suffix = 3 }
    "node-03" = { angle = 120, s60_freq = 20, role = "storage",  ip_suffix = 4 }
    "node-04" = { angle = 180, s60_freq = 15, role = "compute",  ip_suffix = 5 }
    "node-05" = { angle = 240, s60_freq = 12, role = "storage",  ip_suffix = 6 }
    "node-06" = { angle = 300, s60_freq = 10, role = "storage",  ip_suffix = 7 }
  }
}

# ─── Provision de VPS en CubePath ─────────────────────────────────────────────

resource "cubepath_server" "mycnet_node" {
  for_each = local.mycnet_nodes

  name         = "sentinel-${each.key}"
  image        = var.sentinel_image
  server_type  = "cpx11"  # 2 vCPU, 2GB RAM, NVMe
  location     = "eu-central"
  ssh_keys     = [var.ssh_public_key]

  labels = {
    project  = "sentinel-ring0"
    hackaton = "cubepath-2026"
    role     = each.value.role
    s60_freq = tostring(each.value.s60_freq)
    angle    = tostring(each.value.angle)
  }
}

# ─── Configuracion batman-adv + Sentinel en cada nodo ─────────────────────────

resource "null_resource" "configure_node" {
  for_each = local.mycnet_nodes

  depends_on = [cubepath_server.mycnet_node]

  connection {
    type        = "ssh"
    host        = cubepath_server.mycnet_node[each.key].ipv4_address
    user        = "root"
    private_key = file("~/.ssh/id_ed25519")
  }

  provisioner "remote-exec" {
    inline = [
      # ── 1. batman-adv ──────────────────────────────────────────────────────
      "modprobe batman-adv",
      "ip link add bat0 type batadv",
      "batctl routing_algo BATMAN_IV",
      "batctl orig_interval 1000",
      "batctl gw_mode client",

      # Interfaz mesh
      "ip link set eth1 down",
      "batctl if add eth1",
      "ip link set eth1 up",
      "ip link set bat0 up",

      # Subred 10.60.0.x — Base-60 tribute
      "ip addr add 10.60.0.${each.value.ip_suffix}/24 dev bat0",

      # ── 2. fq_codel — control de congestion armonico ──────────────────────
      "tc qdisc add dev bat0 root fq_codel target 5ms interval 100ms",

      # ── 3. MinIO distributed storage (nodos storage) ──────────────────────
      "if [ '${each.value.role}' = 'storage' ]; then docker run -d --name minio-sentinel -e MINIO_ROOT_USER=sentinel -e MINIO_ROOT_PASSWORD=s60resonant -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ':9001'; fi",

      # ── 4. Sentinel Ring-0 agent ──────────────────────────────────────────
      "curl -s https://raw.githubusercontent.com/jenovoas/sentinel_cubepath/master/scripts/install_agent.sh | bash",
      "systemctl enable --now sentinel-agent",

      # ── 5. Registrar nodo en el primario ─────────────────────────────────
      "curl -s -X POST https://${var.primary_node_ip}/api/v1/mycnet/register -H 'Content-Type: application/json' -d '{\"node_id\": \"${each.key}\", \"s60_freq\": ${each.value.s60_freq}, \"role\": \"${each.value.role}\", \"angle_deg\": ${each.value.angle}, \"bat0_ip\": \"10.60.0.${each.value.ip_suffix}\"}'",
    ]
  }
}

# ─── Outputs ─────────────────────────────────────────────────────────────────

output "mycnet_topology" {
  description = "IPs y roles de los 6 nodos MyCNet desplegados"
  value = {
    for k, v in cubepath_server.mycnet_node :
    k => {
      ip       = v.ipv4_address
      bat0_ip  = "10.60.0.${local.mycnet_nodes[k].ip_suffix}"
      role     = local.mycnet_nodes[k].role
      s60_freq = local.mycnet_nodes[k].s60_freq
      angle    = local.mycnet_nodes[k].angle
    }
  }
}

output "batctl_verify_command" {
  description = "Comando para verificar TQ de todos los nodos desde el primario"
  value       = "ssh root@vps23309.cubepath.net 'batctl o && batctl tg'"
}

output "total_nodes" {
  value = "1 primario (vps23309) + 6 nodos hexagonales = 7 nodos MyCNet activos"
}
