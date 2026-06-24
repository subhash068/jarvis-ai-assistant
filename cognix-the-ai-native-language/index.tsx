import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, StatCard, SectionHeader } from "@/components/ui-kit/cards";
import { VoiceOrb, Waveform } from "@/components/ui-kit/voice";
import { Activity, MessageSquare, Brain, Bot, Cpu, Mic, Play, Pause, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · JARVIS AI" },
      { name: "description", content: "Mission control for your AI assistant: voice activity, memory, agents and performance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["analytics", 1],
    queryFn: async () => {
      const res = await fetch("/api/analytics/1");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    }
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch("/api/agents/");
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    }
  });

  const { data: commands = [] } = useQuery({
    queryKey: ["agentLogs"],
    queryFn: async () => {
      const res = await fetch("/api/agents/logs");
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    }
  });

  const activityData = analytics?.daily || [];

  return (
    <AppShell title="Mission Control" subtitle="Welcome back, Jordan. Your assistant is online and ready.">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard label="Conversations" value={analytics ? analytics.total_conversations.toString() : "..."} delta="+12.4% this week" icon={<MessageSquare className="h-5 w-5" />} delay={0} />
        <StatCard label="Voice Sessions" value={analytics ? analytics.voice_minutes.toString() : "..."} delta="+5.1% this week" icon={<Mic className="h-5 w-5" />} accent="cyan" delay={0.05} />
        <StatCard label="Stored Memories" value={analytics ? analytics.total_memories.toString() : "..."} delta="+218 today" icon={<Brain className="h-5 w-5" />} accent="neon" delay={0.1} />
        <StatCard label="Agent Runs" value="2,176" delta={analytics ? `${analytics.agent_success} success` : "..."} icon={<Bot className="h-5 w-5" />} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
        <GlassCard className="xl:col-span-1 flex flex-col items-center text-center" delay={0.05}>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Assistant Status</div>
          <div className="font-medium mb-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor]" />
            Listening
          </div>
          <VoiceOrb active />
          <div className="mt-6 flex items-center gap-2">
            <button className="px-4 py-2 rounded-full gradient-primary text-primary-foreground text-sm font-medium shadow-glow flex items-center gap-2">
              <Pause className="h-4 w-4" /> Stop
            </button>
            <button className="px-4 py-2 rounded-full glass text-sm font-medium flex items-center gap-2">
              <Play className="h-4 w-4" /> New session
            </button>
          </div>
          <div className="mt-6 w-full">
            <Waveform active height={56} bars={48} />
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-2" delay={0.1}>
          <SectionHeader
            title="Activity (last 24h)"
            action={<span className="text-xs text-muted-foreground">Updated just now</span>}
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.21 265)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.7 0.21 265)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.25 305)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.65 0.25 305)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="hour" stroke="oklch(0.7 0.03 260)" fontSize={11} tickLine={false} axisLine={false} interval={3} />
                <Tooltip contentStyle={{ background: "oklch(0.16 0.03 270)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="conversations" stroke="oklch(0.7 0.21 265)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="voice" stroke="oklch(0.65 0.25 305)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2" delay={0.05}>
          <SectionHeader title="Recent commands" action={<a className="text-xs text-primary inline-flex items-center gap-1">View all <ArrowUpRight className="h-3 w-3" /></a>} />
          <ul className="divide-y divide-border">
            {commands.slice(0, 5).map((c: any, i: number) => (
              <motion.li
                key={c.id || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg glass grid place-items-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm truncate">{c.task}</div>
                    <div className="text-xs text-muted-foreground">{c.time_ago} ago · {c.agent_name} agent</div>
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${c.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-destructive/15 text-destructive'}`}>
                  {c.ok ? 'Done' : 'Failed'}
                </span>
              </motion.li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard delay={0.1}>
          <SectionHeader title="Agent activity" />
          <ul className="space-y-3">
            {agents.map((a: any, i: number) => (
              <li key={a.id || i} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg gradient-cyan grid place-items-center">
                  <Cpu className="h-4 w-4 text-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{a.success_rate}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full gradient-primary" style={{ width: `${a.success_rate}%` }} />
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${a.status === "Active" ? "bg-emerald-500/15 text-emerald-300" : a.status === "Idle" ? "glass" : "bg-amber-500/15 text-amber-300"}`}>
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </AppShell>
  );
}
