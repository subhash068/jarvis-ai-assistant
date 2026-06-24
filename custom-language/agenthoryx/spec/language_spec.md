# Agenthoryx Language Specification (v4.0 Draft)

## 1. Introduction
This document defines the normative specification for the Agenthoryx programming language. It serves as the authoritative reference for implementers building compilers, interpreters, and VMs for Agenthoryx.

> **Note:** The specification defines behavior. Individual implementations may vary in optimization strategies, but must adhere strictly to the semantics described herein.

## 2. Lexical Structure
### 2.1 Identifiers
Identifiers must begin with a letter (a-z, A-Z) or underscore (`_`), followed by any number of letters, digits (0-9), or underscores.

### 2.2 Keywords
The following tokens are reserved keywords:
`let`, `fn`, `if`, `else`, `while`, `return`, `class`, `agent`, `template`, `spawn`, `await`, `workflow`

## 3. Types and Values
Agenthoryx introduces a rigorous static type system to ensure safe execution of agent logic before runtime.
- **Primitives**: `Int`, `Float`, `String`, `Boolean`, `Null`
- **Collections**: `List<T>`, `Map<K, V>`
- **Agent Primitives**: `Agent`, `Task`, `Memory`, `Message`

Example:
```agenthoryx
let age: Int = 22;
let name: String = "Dev";
```

## 4. Execution Model
A Agenthoryx program is a sequence of statements executed synchronously by default.
Asynchronous execution is introduced via the `spawn` keyword or implicitly within a `workflow` block.

## 5. Formal Agent Model
Agenthoryx defines a mathematical foundation for Agent-Oriented Programming (AOP).

### 5.1 Agent Definition
An `agent` block defines a stateful actor encapsulation.

```agenthoryx
agent ResearchAgent {
    memory local
    task search()
    task summarize()
}
```

### 5.2 Tasks and Memory
- **Task**: A bounded execution context for non-deterministic logic.
- **Memory**: The persistent state object bound to the agent, providing vector and scalar retention.

### 5.3 Workflow Composition
The `-&gt;` operator allows for intuitive syntactic composition of multi-agent workflows.

```agenthoryx
workflow BuildSystem {
    ResearchAgent -> PlannerAgent -> ExecutorAgent
}
```
