import { GlassCard, StatCard, SectionHeader } from "@/components/ui-kit/cards";
import { MessageSquare, Mic, Brain, Bot, TrendingUp, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["oklch(0.7 0.21 265)", "oklch(0.65 0.25 305)", "oklch(0.82 0.16 210)", "oklch(0.75 0.18 160)", "oklch(0.78 0.18 50)"];

export function AnalyticsTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/1");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  if (isLoading || !stats) {
    return (
      <div className="py-8 text-center text-muted-foreground">Loading analytics...</div>
    );
  }

  const breakdown = stats.breakdown || [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total conversations" value={stats.total_conversations.toLocaleString()} delta="+9.2%" icon={<MessageSquare className="h-5 w-5" />} />
        <StatCard label="Voice minutes" value={stats.voice_minutes.toLocaleString()} delta="+14.1%" icon={<Mic className="h-5 w-5" />} accent="cyan" delay={0.05} />
        <StatCard label="Memory entries" value={stats.total_memories.toLocaleString()} delta="+3.7%" icon={<Brain className="h-5 w-5" />} accent="neon" delay={0.1} />
        <StatCard label="Agent success" value={stats.agent_success} delta="+0.4 pts" icon={<Target className="h-5 w-5" />} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <GlassCard className="xl:col-span-2">
          <SectionHeader title="Daily activity" action={<span className="text-xs text-muted-foreground">Last 14 days</span>} />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="day" stroke="oklch(0.7 0.03 260)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.16 0.03 270)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                <Bar dataKey="convos" fill="oklch(0.7 0.21 265)" radius={[6,6,0,0]} />
                <Bar dataKey="voice" fill="oklch(0.65 0.25 305)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Agent mix" action={<Bot className="h-4 w-4 text-muted-foreground" />} />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {breakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i]} stroke="transparent" />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <SectionHeader title="Monthly trend" action={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="month" stroke="oklch(0.7 0.03 260)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.03 270)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="value" stroke="oklch(0.7 0.21 265)" strokeWidth={2.5} dot={{ r: 3, fill: "oklch(0.65 0.25 305)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </>
  );
}
