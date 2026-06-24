import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';

export const Route = createFileRoute('/cognix-vm')({
  component: CognixVM,
});

function CognixVM() {
  const [sourceCode, setSourceCode] = useState('print("Hello")');
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">CognixVM Dashboard</h1>
      <p className="text-xl text-muted-foreground">
        Phase 3: The transition from AST interpreter to Bytecode VM.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* VM Architecture */}
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h2 className="text-2xl font-semibold mb-4">VM Architecture</h2>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <p>Source Code &rarr; Lexer &rarr; Parser &rarr; AST</p>
            <p className="pl-4">&darr;</p>
            <p>AST &rarr; Semantic Analysis &rarr; IR Builder &rarr; IR</p>
            <p className="pl-4">&darr;</p>
            <p>IR &rarr; Optimizer &rarr; Bytecode Emitter &rarr; .axb File</p>
            <p className="pl-4">&darr;</p>
            <p>CognixVM (Stack, Registers, Memory, Scheduler)</p>
          </div>
        </div>

        {/* Performance Benchmarks */}
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h2 className="text-2xl font-semibold mb-4">Performance Benchmarks</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Workload</th>
                <th className="py-2">Interpreter (v2)</th>
                <th className="py-2">CognixVM (v3)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Arithmetic</td>
                <td className="py-2">1x</td>
                <td className="py-2 text-green-500 font-bold">4x Faster</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Loops</td>
                <td className="py-2">1x</td>
                <td className="py-2 text-green-500 font-bold">6x Faster</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Functions</td>
                <td className="py-2">1x</td>
                <td className="py-2 text-green-500 font-bold">5x Faster</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Interactive Bytecode Viewer */}
        <div className="p-6 border rounded-xl shadow-sm bg-card md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Interactive Bytecode Viewer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cognix Source</label>
              <textarea 
                className="w-full h-48 p-4 font-mono text-sm bg-background border rounded-lg"
                value={sourceCode}
                onChange={e => setSourceCode(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Compiled Bytecode (Simulated)</label>
              <div className="w-full h-48 p-4 font-mono text-sm bg-zinc-900 text-zinc-100 rounded-lg overflow-auto">
                <p>PUSH_STRING "Hello"</p>
                <p>CALL_NATIVE print</p>
                <p>HALT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Runtime Metrics */}
        <div className="p-6 border rounded-xl shadow-sm bg-card md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Runtime Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">1.2 MB</p>
              <p className="text-sm text-muted-foreground">Heap Size</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">24</p>
              <p className="text-sm text-muted-foreground">Live Agents</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">450</p>
              <p className="text-sm text-muted-foreground">GC Sweeps</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">2.4ms</p>
              <p className="text-sm text-muted-foreground">Avg Execution Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
