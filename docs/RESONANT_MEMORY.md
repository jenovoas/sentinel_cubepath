# Resonant Memory — Resonant Memory Matrix (RMM)

The **Resonant Memory** is the core of the **Sentinel Ring-0** cognitive layer. It is a quantum-inspired matrix that uses mathematical harmonics (Plimpton 322) to correlate multiple system events and verify "Shared Truth" across nodes.

## Mathematical Foundation

Sentinel's RMM is based on the **Resonant Matrix** model, where two events are considered related if their combined entropy signals produce a harmonic ratio.

### Plimpton 322 Correlation

The matrix $M$ is defined as a collection of nodes $N_i, N_j$. The resonance $R_{ij}$ between them is updated by interference:

$$R_{ij}(t) = \sum_{k=0}^{t} \text{Signal}_k(N_i, N_j)$$

If the value $R_{ij}$ fulfills the **Plimpton Ratio** (SPA Harmonic), the nodes are in **Sovereign Coherence**.

## Key Features

1. **Shared Truth Verification**: Before an eBPF event is accepted, it must resonate with the global state in the RMM.
2. **Phase Analysis**: Uses base-60 arithmetic (SPA) to prevent truncation errors in high-fidelity security telemetry.
3. **Resonant Shielding**: When a high-dissonance event (attack) is detected, the RMM shifts its phase to "isolate" the affected node until coherence is restored via **TruthSync**.

## Implementation

The **Resonant Memory** is implemented in `resonant.rs` and utilizes the `SPA` (Sentinel Point Arithmetic) module for base-60 fixed-point calculations.
