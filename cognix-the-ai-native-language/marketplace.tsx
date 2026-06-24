import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/marketplace')({
  component: EnterpriseMarketplace,
});

function EnterpriseMarketplace() {
  const categories = ['Agriculture', 'Healthcare', 'Finance', 'Cybersecurity', 'Education', 'Government'];
  
  const featuredAgents = [
    { name: 'CropAdvisor', category: 'Agriculture', desc: 'Predict crop yield, soil health, and irrigation needs.', installs: '12.4k' },
    { name: 'SOCAnalyst', category: 'Cybersecurity', desc: 'Real-time threat detection and anomaly scanning.', installs: '8.2k' },
    { name: 'FinancialAnalyst', category: 'Finance', desc: 'Risk analysis, portfolio forecasting, and investment intelligence.', installs: '45.1k' },
    { name: 'MediDiag', category: 'Healthcare', desc: 'Symptom analysis and medical record summarization (HIPAA Compliant).', installs: '9.3k' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="text-center py-12 bg-muted/30 rounded-2xl border">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Enterprise Agent Marketplace</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover, install, and deploy industry-specific autonomous agents into your Cognix Cloud environment.
        </p>
        <div className="mt-8 max-w-md mx-auto relative">
          <input 
            type="text" 
            placeholder="Search agents (e.g., 'Risk Analyst')" 
            className="w-full px-4 py-3 rounded-full bg-background border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {categories.map(cat => (
          <button key={cat} className="px-6 py-2 rounded-full border bg-card hover:bg-muted font-medium whitespace-nowrap">
            {cat}
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Trending Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredAgents.map(agent => (
            <div key={agent.name} className="flex flex-col bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 flex-1">
                <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">{agent.category}</div>
                <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                <p className="text-muted-foreground text-sm">{agent.desc}</p>
              </div>
              <div className="p-4 bg-muted/50 border-t flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{agent.installs} installs</span>
                <button className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded">
                  Install
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-950 text-zinc-300 p-6 rounded-xl font-mono text-sm">
        <p className="text-muted-foreground mb-2">// Install directly via CLI</p>
        <p><span className="text-green-400">$</span> cpm install crop-advisor --enterprise</p>
        <p className="mt-2 text-muted-foreground">Fetching from marketplace.cognix.dev...</p>
        <p>✔ Installed crop-advisor v2.1.0</p>
      </div>
    </div>
  );
}
