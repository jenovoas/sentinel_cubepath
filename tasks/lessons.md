# 🧠 Lessons & Project Context: Sentinel Ring-0

## 🏆 Event Context: MiduDev Hackatón 2026

- **Project:** Sentinel Cubepath (Bio-Integrated Defense System).
- **Environment:** Production Node "Sentinel Ring-0" (`sentinel-cubepath`).
- **Deadline:** March 31, 2026.

## 🚫 Critical Deployment Rules

- **LOCAL DEPLOYMENT FORBIDDEN:** Do not run `docker-compose`, `npm start`, or eBPF loaders locally.
- **Reason:** Avoiding resource duplication in Ring-0 and protecting the **Node Fenix** services.
- **Remote Target:** VPS `vps23309.cubepath.net` (handled via host alias `sentinel-cubepath`).

## 🚀 Remote Deployment Workflow (Standard Instructions)

For any module (eBPF, Backend, Frontend):

1. **Sync Code:**

    ```bash
    scp -r ./path/to/module sentinel-cubepath:~/sentinel-cubepath/path/to/module
    ```

2. **Remote Execution (eBPF Example):**

    ```bash
    ssh sentinel-cubepath "cd ~/sentinel-cubepath/backend/ebpf && make all && make load"
    ```

3. **Logs & Verification:**
    Use `bpftool prog list` or check the dashboard on port 3000 of the remote node.

## 🛡️ SSH Migration Knowledge

- **SELinux Check:** Always update `semanage port` when changing SSH ports on Rocky Linux/RHEL nodes.
- **Dual Whitelisting:** Update BOTH `xdp_firewall` and `tc_firewall` to ensure traffic passes the early XDP layer and the late TC layer.
