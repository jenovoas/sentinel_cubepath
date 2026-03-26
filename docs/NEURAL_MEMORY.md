# Neural Memory — Ring-0 Spiking Neural Network (SNN)

The **Neural Memory** in Sentinel Cognitive Firewall is a bio-inspired pattern recognition layer running at Ring-0. Unlike traditional deep learning, it uses **Spiking Neural Networks (SNN)** to detect anomalies with extremely low latency and power consumption.

## Architecture

Sentinel uses a **Leaky Integrate-and-Fire (LIF)** model to process entropy signals from the eBPF guardians.

### LIF Mathematical Model

The membrane potential $V(t)$ of a neuron follows the differential equation:

$$\tau_m \frac{dV}{dt} = -(V - V_{rest}) + R_m I(t)$$

In our discrete Rust implementation:
- **Integration**: $V_n = (V_{n-1} \cdot \text{Decay}) + \text{Amplitude}$
- **Firing**: If $V_n \geq V_{threshold}$, then $Fire! \text{ and } V_n = 0$

## Role in Sentinel

1. **Signal Filtering**: Filters "noise" from the eBPF ring buffer, only triggering alerts on "bursts" of suspicious activity.
2. **Phase Alignment**: SNN spikes are synchronized with the **TruthSync** harmonic signal to ensure legitimate node behavior.
3. **Entropy Guard**: Monitor the `entropy_signal` from the **Burst Sensor** (XDP) to prevent DDoS floods from reaching the application layer.

## Implementation Details

The module is implemented in `neural.rs`. It manages a matrix of `NeuralMembrane` structures, each tracking the spiking history of a specific system component.
