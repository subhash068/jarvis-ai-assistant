import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/workflows')({
  component: WorkflowEngineUI,
});

function WorkflowEngineUI() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Workflow Engine</h1>
        <p className="text-xl text-muted-foreground">Orchestrate complex multi-agent execution graphs.</p>
      </div>

      <div className="bg-card border rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-4">CropAdvisory Workflow</h2>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-8">
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center font-bold text-xl border-2 border-blue-500">
              1
            </div>
            <p className="mt-2 font-medium">FetchWeather</p>
            <p className="text-xs text-muted-foreground">WeatherAgent</p>
          </div>
          
          <div className="h-1 w-16 bg-border hidden md:block"></div>
          <div className="w-1 h-8 bg-border md:hidden"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center font-bold text-xl border-2 border-purple-500">
              2
            </div>
            <p className="mt-2 font-medium">AnalyzeSoil</p>
            <p className="text-xs text-muted-foreground">SoilAgent</p>
          </div>
          
          <div className="h-1 w-16 bg-border hidden md:block"></div>
          <div className="w-1 h-8 bg-border md:hidden"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center font-bold text-xl border-2 border-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]">
              3
            </div>
            <p className="mt-2 font-medium">RecommendCrop</p>
            <p className="text-xs text-muted-foreground">AdvisorAgent</p>
            <span className="mt-1 text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Running</span>
          </div>

        </div>
        
        <div className="mt-8 bg-zinc-950 p-6 rounded-xl font-mono text-sm text-zinc-300">
          <pre>
{`workflow CropAdvisory {
    FetchWeather
    AnalyzeSoil
    RecommendCrop
}

// Execution Logs:
[Workflow] Executing task: FetchWeather
[Node 0] Executing task: FetchWeather
[Node 0] Task FetchWeather completed
[Workflow] Executing task: AnalyzeSoil
[Node 1] Executing task: AnalyzeSoil
[Node 1] Task AnalyzeSoil completed
[Workflow] Executing task: RecommendCrop
[Node 2] Executing task: RecommendCrop...`}
          </pre>
        </div>
      </div>
    </div>
  );
}
