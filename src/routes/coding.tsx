import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Code2, Bug, ClipboardList, Database, Server, Play, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export const Route = createFileRoute("/coding")({
  head: () => ({
    meta: [
      { title: "Coding · JARVIS AI" },
      { name: "description", content: "Generate, review and debug code with your AI dev partner." },
    ],
  }),
  component: CodingPage,
});

const iconMap: Record<string, any> = {
  Code2,
  Bug,
  ClipboardList,
  Server,
  Database,
};

const getPrismLanguage = (lang?: string) => {
  if (!lang) return "javascript";
  const l = lang.toLowerCase();
  if (l === "c++") return "cpp";
  if (l === "c#") return "csharp";
  if (l === "html" || l === "xml") return "markup";
  if (l === "react") return "jsx";
  return l;
};

function CodingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const queryClient = useQueryClient();

  const { data: tools = [] } = useQuery({
    queryKey: ["coding", "tools"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/coding/tools");
      if (!res.ok) throw new Error("Failed to fetch tools");
      return res.json();
    },
  });

  const { data: snippetData } = useQuery({
    queryKey: ["coding", "snippet"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/coding/snippet");
      if (!res.ok) throw new Error("Failed to fetch snippet");
      return res.json();
    },
  });

  const handleLaunchClick = (tool: any) => {
    setSelectedTool(tool);
    setPrompt("");
    setIsModalOpen(true);
  };

  const handleLaunchSubmit = async () => {
    if (!prompt.trim() || !selectedTool) return;
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/coding/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool_name: selectedTool.name, prompt }),
      });
      if (!res.ok) throw new Error("Launch failed");
      const data = await res.json();
      
      queryClient.setQueryData(["coding", "snippet"], data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate code.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tools.length > 0 && !selectedTool) {
      setSelectedTool(tools[0]);
    }
  }, [tools, selectedTool]);

  return (
    <AppShell title="Coding Workspace" subtitle="Your senior pair programmer, on call.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDEBAR: TOOLS LIST */}
        <div className={`${isSidebarCollapsed ? "lg:col-span-1" : "lg:col-span-3"} space-y-3 lg:sticky lg:top-24 self-start transition-all duration-300`}>
          <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between px-2"} mb-4`}>
            {!isSidebarCollapsed && (
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Engine Tools</span>
            )}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
          
          {tools.map((t: any) => {
            const Icon = iconMap[t.icon] || Code2;
            const isActive = selectedTool?.name === t.name;
            return (
              <button
                key={t.name}
                onClick={() => setSelectedTool(t)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 border flex ${isSidebarCollapsed ? "justify-center" : "items-start gap-3"} ${
                  isActive 
                    ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.1)]" 
                    : "glass border-transparent hover:border-primary/20 hover:bg-white/5"
                }`}
                title={isSidebarCollapsed ? t.name : undefined}
              >
                <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 transition-colors ${isActive ? "gradient-primary text-primary-foreground shadow-glow" : "bg-white/5 text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="overflow-hidden">
                    <div className={`font-semibold text-sm ${isActive ? "text-primary" : "text-foreground"} truncate`}>{t.name}</div>
                    <div className="text-[12px] text-muted-foreground line-clamp-1 leading-relaxed">{t.desc}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* MAIN WORKSPACE */}
        <div className={`${isSidebarCollapsed ? "lg:col-span-11" : "lg:col-span-9"} flex flex-col gap-6 transition-all duration-300`}>
          
          {/* Prompt Area */}
          <GlassCard className="p-0 overflow-hidden border-primary/20">
            <div className="p-4 border-b border-white/5 bg-background/30">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full gradient-primary grid place-items-center shadow-glow shrink-0">
                  {selectedTool && React.createElement(iconMap[selectedTool.icon] || Code2, { className: "h-4 w-4 text-primary-foreground" })}
                </div>
                <div>
                  <div className="text-sm font-semibold">{selectedTool?.name || "Select a tool"}</div>
                  <div className="text-xs text-muted-foreground">Type your prompt below to launch this engine.</div>
                </div>
              </div>
            </div>
            <div className="p-4 relative">
              <textarea
                className="w-full h-32 bg-transparent border-0 text-sm resize-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50 leading-relaxed font-mono"
                placeholder={selectedTool ? `E.g. Use the ${selectedTool.name} to...` : "Select a tool first..."}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={!selectedTool || isLoading}
              />
              <div className="absolute bottom-4 right-4">
                <button 
                  className="px-5 py-2.5 rounded-full gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={handleLaunchSubmit}
                  disabled={!prompt.trim() || isLoading || !selectedTool}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                  {isLoading ? "Running Engine..." : "Launch"}
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Results Area */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <GlassCard>
              <SectionHeader title={isLoading ? "Generating..." : snippetData?.title || "Loading..."} action={<span className="text-[11px] text-muted-foreground">{snippetData?.language || ""}</span>} />
              <div className="rounded-xl overflow-hidden border border-border min-h-[300px] relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-background/60 z-10">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                    <span>Jarvis is writing code...</span>
                  </div>
                ) : snippetData?.code ? (
                  <SyntaxHighlighter
                    language={getPrismLanguage(snippetData.language)}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      background: "rgba(0,0,0,0.3)",
                      fontSize: "0.75rem",
                      minHeight: "300px",
                    }}
                  >
                    {snippetData.code}
                  </SyntaxHighlighter>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs bg-background/60">
                    No code generated yet.
                  </div>
                )}
              </div>
            </GlassCard>
            <GlassCard>
              <SectionHeader title="Explanation" />
              {isLoading ? (
                <div className="h-48 grid place-items-center">
                  <div className="flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary/40 animate-pulse delay-75" />
                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-150" />
                    <div className="h-2 w-2 rounded-full bg-primary/80 animate-pulse delay-300" />
                  </div>
                </div>
              ) : (
                <ol className="space-y-3 text-sm mt-2">
                  {(snippetData?.explanation || []).map((s: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <span className="h-6 w-6 rounded-full gradient-primary grid place-items-center text-[11px] font-semibold text-primary-foreground shrink-0">{i + 1}</span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
