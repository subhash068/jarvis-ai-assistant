import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui-kit/cards";
import { Activity, Play, TerminalSquare, AlertCircle, Video, Trash2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/testing-engine")({
  head: () => ({
    meta: [
      { title: "Testing Engine · JARVIS AI" },
      { name: "description", content: "Run automated Playwright E2E tests directly from the dashboard." },
    ],
  }),
  component: TestingEngine,
});

function TestingEngine() {
  const [url, setUrl] = useState("");
  const [browser, setBrowser] = useState("chromium");
  const [headed, setHeaded] = useState(false);
  const [prompt, setPrompt] = useState("");
  
  const testMutation = useMutation({
    mutationFn: async (data: { url?: string; browser?: string; headed?: boolean }) => {
      const response = await fetch("http://localhost:8000/testing/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to execute tests");
      }
      return response.json();
    },
  });

  const codegenMutation = useMutation({
    mutationFn: async (data: { url?: string }) => {
      const response = await fetch("http://localhost:8000/testing/codegen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to launch codegen");
      }
      return response.json();
    },
  });

  const aiGenerateMutation = useMutation({
    mutationFn: async (data: { url: string; prompt: string }) => {
      const response = await fetch("http://localhost:8000/testing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to generate test with AI");
      }
      return response.json();
    },
  });

  const handleRunTests = () => {
    testMutation.mutate({ url: url || undefined, browser, headed });
  };

  const handleCodegen = () => {
    codegenMutation.mutate({ url: url || undefined });
  };

  const handleAIGenerate = () => {
    if (!url) {
      alert("Please provide a Target URL for AI Generation.");
      return;
    }
    if (!prompt) {
      alert("Please provide a prompt for AI Generation.");
      return;
    }
    aiGenerateMutation.mutate({ url, prompt });
  };

  return (
    <AppShell 
      title="Testing Engine" 
      subtitle="Execute end-to-end Playwright tests on any website or localhost."
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-1 lg:col-span-1">
            <GlassCard className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-medium text-foreground mb-4">Configuration</h3>
              
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Target URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="e.g. http://localhost:5173"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Leave blank to test the default Jarvis AI URL.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Browser</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={browser}
                    onChange={(e) => setBrowser(e.target.value)}
                  >
                    <option value="chromium">Chromium (Chrome/Edge)</option>
                    <option value="firefox">Firefox</option>
                    <option value="webkit">WebKit (Safari)</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2 pb-2">
                  <input
                    type="checkbox"
                    className="rounded border-input bg-background text-primary focus:ring-primary"
                    checked={headed}
                    onChange={(e) => setHeaded(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-foreground">Show Browser (Headed Mode)</span>
                </label>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Test Requirements (AI Prompt)
                  </label>
                  <textarea
                    placeholder="e.g. Verify the login form rejects empty passwords"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px] resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleRunTests}
                  disabled={testMutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testMutation.isPending ? (
                    <Activity className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {testMutation.isPending ? "Running Tests..." : "Run Playwright Tests"}
                </button>

                <button
                  onClick={handleCodegen}
                  disabled={codegenMutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video className="h-4 w-4" />
                  Record New Test
                </button>
                {codegenMutation.isSuccess && (
                  <p className="text-xs text-green-500 text-center">Test recorder launched on desktop!</p>
                )}

                <button
                  onClick={handleAIGenerate}
                  disabled={aiGenerateMutation.isPending || !url || !prompt}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiGenerateMutation.isPending ? (
                    <Activity className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {aiGenerateMutation.isPending ? "Generating..." : "Generate Test with AI"}
                </button>
                {aiGenerateMutation.isSuccess && (
                  <p className="text-xs text-green-500 text-center">AI generated the test! Click Run to execute.</p>
                )}
              </div>
            </GlassCard>
          </div>

          <div className="md:col-span-1 lg:col-span-2">
            <GlassCard className="p-0 h-full overflow-hidden flex flex-col min-h-[400px]">
              <div className="bg-muted/50 border-b border-border/50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TerminalSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Console Output</span>
                  {testMutation.data && (
                    <button 
                      onClick={() => testMutation.reset()}
                      className="ml-2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                      title="Clear console"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {testMutation.data && (
                  <div className="flex items-center gap-3">
                    <a
                      href="http://localhost:8000/testing/report/index.html"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      View HTML Report
                    </a>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${testMutation.data.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {testMutation.data.success ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 bg-black/90 p-4 overflow-y-auto font-mono text-sm">
                {testMutation.isPending ? (
                  <div className="text-blue-400 flex items-center gap-2 animate-pulse">
                    <Activity className="h-4 w-4" />
                    Executing Playwright spec files...
                  </div>
                ) : testMutation.isError ? (
                  <div className="text-red-400 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>Error connecting to the backend test runner.</span>
                  </div>
                ) : testMutation.data ? (
                  <pre className={`whitespace-pre-wrap ${testMutation.data.success ? 'text-green-400' : 'text-red-400'}`}>
                    {testMutation.data.output.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')}
                  </pre>
                ) : (
                  <div className="text-muted-foreground">Ready. Configure settings and click "Run" to start.</div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
