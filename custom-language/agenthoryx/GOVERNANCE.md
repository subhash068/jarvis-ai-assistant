# Agenthoryx Open Source Governance

Welcome to the Agenthoryx open-source ecosystem. As we transition from Phase 3 (AgenthoryxVM) to Phase 4 (Developer Ecosystem), we are establishing formal governance to manage community contributions, feature requests, and the language specification.

## Core Repositories
The `agenthoryx-lang` GitHub organization maintains the following core repositories:
- `agenthoryx`: The core compiler and language runtime.
- `agenthoryx-vm`: The bytecode virtual machine execution engine.
- `agenthoryx-docs`: Source for the `docs.agenthoryx.dev` portal.
- `agenthoryx-sdk`: Official client SDKs (Python, Node.js).
- `agenthoryx-hub`: Package registry backend and frontend.
- `agenthoryx-vscode`: Official VS Code Language Extension.

## RFC Process (Request for Comments)
Before contributing a major feature (e.g., new syntax, standard library additions, VM changes), you must submit an RFC.
1. Create a discussion in the `agenthoryx/discussions/RFC` category.
2. Draft the proposal following the RFC template.
3. The Core Team and community will review the RFC.
4. Once accepted, the feature can be implemented.

## Code Standards
- All Python code must be formatted using `black` and pass `flake8` linting.
- TypeScript/JavaScript must use `prettier` and pass strict `eslint` rules.
- VM code optimizations must include comparative benchmarks demonstrating no regressions.

## Contribution Guide
1. Fork the respective repository.
2. Create a feature branch (`feat/your-feature`).
3. Include tests for any new features or bug fixes.
4. Submit a Pull Request.
5. A Core Team member will review your PR within 48 hours.

## Roadmap
Our public roadmap is available at `agenthoryx.dev/roadmap`. We prioritize:
1. Stability of the Phase 4 Package Manager.
2. Expanding the AI standard library.
3. Enhanced cloud compilation targets (WebAssembly).
