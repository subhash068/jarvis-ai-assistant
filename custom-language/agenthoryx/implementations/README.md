# Agenthoryx Reference Implementations

The Agenthoryx Language Specification defines the *what*, while this directory tracks the *how*. 
To ensure Agenthoryx acts as a true standard, it cannot be tied to a single codebase. We encourage and support multiple implementations of the Agenthoryx Runtime.

## Official Implementations

### 1. `agenthoryx-rust` (The Official Reference Runtime)
- **Status**: Stable
- **Description**: A ground-up Rust implementation of the Agenthoryx execution model. Targets high-throughput, low-latency enterprise environments. This replaces the legacy Python VM to provide memory-safe execution of agent workflows.

### 2. `agenthoryx-web` (Browser Runtime)
- **Status**: Beta
- **Description**: Compiles Agenthoryx to WebAssembly (Wasm), enabling Agenthoryx agents to run securely within client-side browsers and edge environments.

### 3. `agenthoryx-python` (Legacy Reference)
- **Status**: Deprecated
- **Description**: The original implementation written in Python. Replaced by the Rust/WASM targets to address performance bottlenecks during multi-agent orchestration.


