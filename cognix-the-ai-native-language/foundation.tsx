import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/foundation')({
  component: CognixFoundation,
});

function CognixFoundation() {
  const committees = [
    { name: "Language Committee", desc: "Oversees syntax evolution and the standard library." },
    { name: "Research Committee", desc: "Partners with universities for academic AGI research." },
    { name: "Security Committee", desc: "Manages CVEs, enterprise RBAC, and vault standards." },
    { name: "Education Committee", desc: "Handles certification tracks (CAD, CPD, CAE, CAA)." },
    { name: "Ecosystem Committee", desc: "Maintains package managers and IDE tooling." }
  ];

  const ceps = [
    { id: "CEP-001", title: "Standardize AI Runtime Hooks", status: "Accepted" },
    { id: "CEP-002", title: "Introduce Quantum Computing Stdlib", status: "Draft" },
    { id: "CEP-003", title: "Deprecate Synchronous Agent Messaging", status: "Under Review" },
    { id: "CEP-004", title: "Rust VM Optimization Pass", status: "Accepted" }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="text-center py-12 border-b">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
          <span className="text-4xl">🏛️</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">The Cognix Foundation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The non-profit organization ensuring Cognix remains an open, accessible, and globally recognized standard for intelligent software development.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Committees */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Governance Committees</h2>
          <div className="space-y-4">
            {committees.map((com, i) => (
              <div key={i} className="p-4 border rounded-xl bg-card hover:border-primary transition-colors">
                <h3 className="text-lg font-bold text-foreground">{com.name}</h3>
                <p className="text-sm text-muted-foreground">{com.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CEPs */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Cognix Enhancement Proposals</h2>
          <p className="text-muted-foreground mb-4">
            The CEP process is the primary mechanism for proposing major new features, collecting community input, and documenting design decisions.
          </p>
          <div className="border rounded-xl overflow-hidden bg-card">
            {ceps.map((cep, i) => (
              <div key={i} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-muted/50">
                <div>
                  <span className="font-mono text-primary font-bold mr-3">{cep.id}</span>
                  <span className="font-medium">{cep.title}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded ${
                  cep.status === 'Accepted' ? 'bg-green-500/20 text-green-500' :
                  cep.status === 'Draft' ? 'bg-zinc-500/20 text-zinc-400' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {cep.status}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-6 px-4 py-2 border rounded hover:bg-muted text-sm font-medium w-full">
            View All CEPs →
          </button>
        </div>
      </div>
    </div>
  );
}
