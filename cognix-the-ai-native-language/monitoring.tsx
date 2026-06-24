import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/monitoring')({
  component: ObservabilityDashboard,
});

function ObservabilityDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Cognix Observability</h1>
          <p className="text-xl text-muted-foreground">Monitor cluster health, agent performance, and API costs.</p>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span> Cluster Online
          </span>
        </div>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-card border rounded-xl p-6">
          <p className="text-muted-foreground text-sm font-medium mb-1">Active Agents</p>
          <p className="text-4xl font-bold">142</p>
          <p className="text-xs text-green-500 mt-2">+12 from last hour</p>
        </div>
        <div className="bg-card border rounded-xl p-6">
          <p className="text-muted-foreground text-sm font-medium mb-1">Avg Execution Time</p>
          <p className="text-4xl font-bold">1.4s</p>
          <p className="text-xs text-green-500 mt-2">-0.2s from last hour</p>
        </div>
        <div className="bg-card border rounded-xl p-6">
          <p className="text-muted-foreground text-sm font-medium mb-1">Total Token Usage</p>
          <p className="text-4xl font-bold">4.2M</p>
          <p className="text-xs text-muted-foreground mt-2">Past 24 hours</p>
        </div>
        <div className="bg-card border rounded-xl p-6">
          <p className="text-muted-foreground text-sm font-medium mb-1">Est. LLM Costs</p>
          <p className="text-4xl font-bold">$12.45</p>
          <p className="text-xs text-red-500 mt-2">+$2.10 from yesterday</p>
        </div>
      </div>

      {/* Cluster Node Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Cluster Node Health</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">Node-alpha-01</p>
                <p className="text-sm text-muted-foreground">US-East (N. Virginia)</p>
              </div>
              <div className="text-right">
                <p className="text-sm">CPU: 45% | RAM: 2.1GB</p>
                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Healthy</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">Node-beta-02</p>
                <p className="text-sm text-muted-foreground">EU-West (Ireland)</p>
              </div>
              <div className="text-right">
                <p className="text-sm">CPU: 89% | RAM: 6.4GB</p>
                <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">High Load</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">Node-gamma-03</p>
                <p className="text-sm text-muted-foreground">AP-South (Mumbai)</p>
              </div>
              <div className="text-right">
                <p className="text-sm">CPU: 12% | RAM: 1.1GB</p>
                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Healthy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Status */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Active Workflows</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border-l-4 border-blue-500 bg-muted/50 rounded-r-lg">
              <div>
                <p className="font-semibold">CropAdvisory_DailyRun</p>
                <p className="text-sm text-muted-foreground">3/5 Agents Completed</p>
              </div>
              <span className="text-sm font-mono text-blue-500">In Progress</span>
            </div>
            <div className="flex justify-between items-center p-3 border-l-4 border-green-500 bg-muted/50 rounded-r-lg">
              <div>
                <p className="font-semibold">MarketAnalysis_Q3</p>
                <p className="text-sm text-muted-foreground">Distributed aggregation</p>
              </div>
              <span className="text-sm font-mono text-green-500">Completed</span>
            </div>
            <div className="flex justify-between items-center p-3 border-l-4 border-red-500 bg-muted/50 rounded-r-lg">
              <div>
                <p className="font-semibold">SOC_ThreatDetect_RT</p>
                <p className="text-sm text-muted-foreground">Failed at AnomalyAgent</p>
              </div>
              <span className="text-sm font-mono text-red-500">Failed (Retrying 2/3)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
