import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Bot, Compass, Code2, CalendarCheck, Cpu, Play, Pause, History, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const ICON_MAP: Record<string, any> = {
  Planner: Compass,
  Research: Bot,
  Coding: Code2,
  Productivity: CalendarCheck,
  Automation: Cpu,
};

export function AgentsTab() {
  const queryClient = useQueryClient();
  const [taskInput, setTaskInput] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<number | "">("");

  // Fetch agents list
  const { data: agents = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch("/api/agents/");
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
  });

  // Automatically select the first agent when data loads
  useEffect(() => {
    if (agents.length > 0 && selectedAgentId === "") {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents, selectedAgentId]);

  // Fetch agent logs
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["agentLogs"],
    queryFn: async () => {
      const res = await fetch("/api/agents/logs");
      if (!res.ok) throw new Error("Failed to fetch agent logs");
      return res.json();
    },
  });

  // Toggle agent status
  const toggleAgentMutation = useMutation({
    mutationFn: async (agentId: number) => {
      const res = await fetch(`/api/agents/${agentId}/toggle`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to toggle agent status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  // Run agent task
  const runAgentMutation = useMutation({
    mutationFn: async (data: { agent_id: number; task: string }) => {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to run agent");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agentLogs"] });
      setTaskInput("");
    },
  });

  const handleRunTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim() || selectedAgentId === "") return;
    runAgentMutation.mutate({ agent_id: selectedAgentId as number, task: taskInput });
  };

  if (isLoadingAgents || isLoadingLogs) {
    return (
      <div className="py-8 text-center text-muted-foreground">Loading agents...</div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {agents.map((a: any, i: number) => {
          const Icon = ICON_MAP[a.name] || Bot;
          return (
            <GlassCard key={a.id} delay={i * 0.05} className="relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 blur-2xl" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl gradient-primary grid place-items-center shadow-glow">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">{a.name} Agent</div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-widest">{a.status}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleAgentMutation.mutate(a.id)}
                  disabled={toggleAgentMutation.isPending}
                  className="h-9 w-9 rounded-full glass grid place-items-center hover:bg-white/10 transition-colors"
                >
                  {a.status === "Active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="glass rounded-lg p-3">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-widest">Active jobs</div>
                  <div className="text-xl font-semibold mt-1">{a.tasks}</div>
                </div>
                <div className="glass rounded-lg p-3">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-widest">Success</div>
                  <div className="text-xl font-semibold mt-1">{a.success_rate}%</div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="mb-8">
        <SectionHeader title="Assign Task" action={<Bot className="h-4 w-4 text-muted-foreground" />} />
        <form onSubmit={handleRunTask} className="flex gap-3">
          <select
            value={selectedAgentId || ""}
            onChange={(e) => setSelectedAgentId(Number(e.target.value))}
            className="bg-transparent glass rounded-xl px-4 py-3 text-sm outline-none border border-border cursor-pointer text-foreground focus:ring-2 focus:ring-primary/40 min-w-[150px]"
          >
            {selectedAgentId === "" && (
              <option value="" disabled className="bg-background text-foreground">
                Select agent...
              </option>
            )}
            {agents.map((a: any) => (
              <option key={a.id} value={a.id} className="bg-background text-foreground">
                {a.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="e.g. Research the latest advancements in quantum computing..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            disabled={runAgentMutation.isPending}
            className="flex-1 bg-transparent glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={runAgentMutation.isPending || !taskInput.trim()}
            className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {runAgentMutation.isPending ? "Running..." : "Run Agent"}
            <Send className="h-4 w-4" />
          </button>
        </form>
      </GlassCard>

      <GlassCard>
        <SectionHeader title="Execution history" action={<History className="h-4 w-4 text-muted-foreground" />} />
        <ul className="divide-y divide-border">
          {logs.map((h: any) => (
            <li key={h.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg glass grid place-items-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm">{h.task}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {h.agent_name} · {h.time_ago} ago
                  </div>
                </div>
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
                  h.ok === 1
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-destructive/20 text-destructive"
                }`}
              >
                {h.ok === 1 ? "Success" : "Failed"}
              </span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </>
  );
}
