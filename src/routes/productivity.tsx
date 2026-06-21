import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, StatCard, SectionHeader } from "@/components/ui-kit/cards";
import { CheckCircle2, Circle, CalendarDays, StickyNote, Users, Clock } from "lucide-react";

export const Route = createFileRoute("/productivity")({
  head: () => ({
    meta: [
      { title: "Productivity · JARVIS AI" },
      { name: "description", content: "Tasks, reminders, calendar, notes and meetings — orchestrated by JARVIS." },
    ],
  }),
  component: ProductivityPage,
});

const tasks = [
  { text: "Finalize JARVIS launch one-pager", done: false, due: "Today 5pm" },
  { text: "Review investor deck v3", done: false, due: "Tomorrow" },
  { text: "Ship voice latency fix", done: true, due: "Yesterday" },
  { text: "Book flights to Bengaluru", done: false, due: "Fri" },
];

const meetings = [
  { title: "Design sync", time: "10:00 — 10:30", with: "Priya, Arjun" },
  { title: "Investor call", time: "13:00 — 13:45", with: "Sequoia" },
  { title: "Deep work", time: "15:00 — 17:00", with: "Solo" },
];

function ProductivityPage() {
  return (
    <AppShell title="Productivity Hub" subtitle="Plan less, do more. Your day, choreographed.">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <StatCard label="Tasks today" value="12" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Meetings" value="3" icon={<CalendarDays className="h-5 w-5" />} accent="cyan" delay={0.05} />
        <StatCard label="Notes this week" value="48" icon={<StickyNote className="h-5 w-5" />} accent="neon" delay={0.1} />
        <StatCard label="Focus hours" value="6.4h" delta="+1.2h vs last week" icon={<Clock className="h-5 w-5" />} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2">
          <SectionHeader title="Upcoming tasks" />
          <ul className="space-y-2">
            {tasks.map((t, i) => (
              <li key={i} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                {t.done ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                <div className="flex-1">
                  <div className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.text}</div>
                  <div className="text-[11px] text-muted-foreground">{t.due}</div>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Today's meetings" action={<Users className="h-4 w-4 text-muted-foreground" />} />
          <ul className="space-y-3">
            {meetings.map((m) => (
              <li key={m.title} className="glass rounded-xl p-3">
                <div className="text-sm font-medium">{m.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{m.time}</div>
                <div className="text-[11px] text-muted-foreground">with {m.with}</div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </AppShell>
  );
}
