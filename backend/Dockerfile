# Stage 1: Build (Rocky Linux based)
FROM rockylinux:9 as builder

# Install system dependencies for eBPF and Rust build
RUN dnf install -y \
    gcc \
    gcc-c++ \
    make \
    cmake \
    clang \
    llvm \
    libbpf-devel \
    elfutils-libelf-devel \
    openssl-devel \
    curl \
    git

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /app
COPY . .

# IMPORTANT: Limited to 2 cores for 4GB RAM safety to avoid OOM
RUN cargo build --release -j 2

# Stage 2: Final (Rocky Linux Minimal)
FROM rockylinux:9-minimal

# Install runtime dependencies
RUN microdnf install -y libbpf openssl iproute && microdnf clean all

WORKDIR /app
COPY --from=builder /app/target/release/sentinel-cortex /app/sentinel-cortex

# ENV
ENV RUST_LOG=info
EXPOSE 8000

# Cap_add: [SYS_ADMIN, BPF] required in the container runner (not dockerfile)
CMD ["./sentinel-cortex"]
