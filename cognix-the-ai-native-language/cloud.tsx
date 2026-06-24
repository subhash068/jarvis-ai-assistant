import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/cloud')({
  component: CloudPlatform,
});

function CloudPlatform() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Cognix Agent Deployment Platform</h1>
        <p className="text-xl text-muted-foreground">The focused runtime environment for deploying Agent-Oriented workloads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Deploy via CLI</h2>
          <p className="text-muted-foreground mb-6">
            Push your compiled agents to the Rust distributed runtime with a single command. The CLI handles state provisioning and workflow DAG execution automatically.
          </p>
          <div className="bg-zinc-950 text-zinc-300 p-4 rounded-lg font-mono text-sm">
            <p><span className="text-green-400">$</span> cognix deploy crop-advisor.axb</p>
            <p className="text-muted-foreground mt-2">Connecting to api.cognix.cloud...</p>
            <p className="text-muted-foreground">Uploading crop-advisor.axb...</p>
            <p className="text-muted-foreground">Provisioning Rust Agent Node...</p>
            <p className="text-green-400 mt-2">Deployment Successful</p>
            <p>URL: https://crop-advisor.cognix.cloud</p>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-8 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Active Deployments</h2>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-bold">crop-advisor</p>
              <p className="text-sm text-muted-foreground">v2.1.0 • Deployed 2h ago</p>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded text-xs font-bold">RUNNING</span>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-bold">financial-analyst</p>
              <p className="text-sm text-muted-foreground">v1.0.4 • Deployed 1d ago</p>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded text-xs font-bold">RUNNING</span>
          </div>
        </div>
      </div>
    </div>
  );
}
