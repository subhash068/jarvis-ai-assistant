import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Bot, Compass, Code2, CalendarCheck, Cpu, Play, Pause, History } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents · JARVIS AI" },
      { name: "description", content: "Manage your planner, research, coding, productivity and automation agents." },
    ],
  }),
  component: AgentsPage,
});

const ICON_MAP: Record<string, any> = {
  Planner: Compass,
  Research: Bot,
  Coding: Code2,
  Productivity: CalendarCheck,
  Automation: Cpu,
};

function AgentsPage() {
  const queryClient = useQueryClient();

  // Fetch agents list
  const { data: agents = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/agents/");
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
  });

  // Fetch agent logs
  const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["agentLogs"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/agents/logs");
      if (!res.ok) throw new Error("Failed to fetch agent logs");
      return res.json();
    },
  });

  // Toggle agent status
  const toggleAgentMutation = useMutation({
    mutationFn: async (agentId: number) => {
      const res = await fetch(`http://localhost:8000/agents/${agentId}/toggle`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to toggle agent status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  if (isLoadingAgents || isLoadingLogs) {
    return (
      <AppShell title="Agent Control Center" subtitle="Autonomous specialists working on your behalf, 24/7.">
        <div className="py-8 text-center text-muted-foreground">Loading agents...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Agent Control Center" subtitle="Autonomous specialists working on your behalf, 24/7.">
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
    </AppShell>
  );
}

