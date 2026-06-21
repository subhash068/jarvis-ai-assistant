import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Bot, Compass, Code2, CalendarCheck, Cpu, Play, Pause, History } from "lucide-react";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents · JARVIS AI" },
      { name: "description", content: "Manage your planner, research, coding, productivity and automation agents." },
    ],
  }),
  component: AgentsPage,
});

const agents = [
  { name: "Planner", icon: Compass, status: "Active", tasks: 12, success: 98, color: "primary" },
  { name: "Research", icon: Bot, status: "Active", tasks: 7, success: 94, color: "neon" },
  { name: "Coding", icon: Code2, status: "Idle", tasks: 3, success: 96, color: "cyan" },
  { name: "Productivity", icon: CalendarCheck, status: "Active", tasks: 21, success: 99, color: "primary" },
  { name: "Automation", icon: Cpu, status: "Standby", tasks: 5, success: 91, color: "neon" },
] as const;

const history = [
  { agent: "Planner", task: "Built weekly plan", time: "2m", ok: true },
  { agent: "Research", task: "Summarized 8 sources on edge AI", time: "12m", ok: true },
  { agent: "Coding", task: "Generated FastAPI scaffold", time: "1h", ok: true },
  { agent: "Automation", task: "Opened Notion + arranged windows", time: "3h", ok: false },
];

function AgentsPage() {
  return (
    <AppShell title="Agent Control Center" subtitle="Autonomous specialists working on your behalf, 24/7.">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {agents.map((a, i) => (
          <GlassCard key={a.name} delay={i * 0.05} className="relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl gradient-primary grid place-items-center shadow-glow">
                  <a.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold">{a.name} Agent</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-widest">{a.status}</div>
                </div>
              </div>
              <button className="h-9 w-9 rounded-full glass grid place-items-center">
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
                <div className="text-xl font-semibold mt-1">{a.success}%</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <SectionHeader title="Execution history" action={<History className="h-4 w-4 text-muted-foreground" />} />
        <ul className="divide-y divide-border">
          {history.map((h, i) => (
            <li key={i} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg glass grid place-items-center"><Bot className="h-4 w-4 text-primary" /></div>
                <div>
                  <div className="text-sm">{h.task}</div>
                  <div className="text-[11px] text-muted-foreground">{h.agent} · {h.time} ago</div>
                </div>
              </div>
              <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${h.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-destructive/20 text-destructive"}`}>
                {h.ok ? "Success" : "Failed"}
              </span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </AppShell>
  );
}
