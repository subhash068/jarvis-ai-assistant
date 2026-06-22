import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, StatCard, SectionHeader } from "@/components/ui-kit/cards";
import { CheckCircle2, Circle, CalendarDays, StickyNote, Users, Clock, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/productivity")({
  head: () => ({
    meta: [
      { title: "Productivity · JARVIS AI" },
      { name: "description", content: "Tasks, reminders, calendar, notes and meetings — orchestrated by JARVIS." },
    ],
  }),
  component: ProductivityPage,
});

function ProductivityPage() {
  const queryClient = useQueryClient();
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("Today");

  // Fetch tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/productivity/tasks?user_id=1");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  // Fetch meetings
  const { data: meetings = [], isLoading: isLoadingMeetings } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/productivity/meetings?user_id=1");
      if (!res.ok) throw new Error("Failed to fetch meetings");
      return res.json();
    },
  });

  // Toggle task done status
  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await fetch(`http://localhost:8000/productivity/tasks/${taskId}/toggle`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to toggle task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: { text: string; due: string }) => {
      const res = await fetch("http://localhost:8000/productivity/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, text: taskData.text, due: taskData.due }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNewTaskText("");
    },
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTaskMutation.mutate({ text: newTaskText, due: newTaskDue });
  };

  const tasksToday = tasks.filter((t: any) => t.due.toLowerCase().includes("today") && t.done === 0).length;

  if (isLoadingTasks || isLoadingMeetings) {
    return (
      <AppShell title="Productivity Hub" subtitle="Plan less, do more. Your day, choreographed.">
        <div className="py-8 text-center text-muted-foreground">Loading productivity data...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Productivity Hub" subtitle="Plan less, do more. Your day, choreographed.">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <StatCard label="Tasks today" value={tasksToday.toString()} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Meetings" value={meetings.length.toString()} icon={<CalendarDays className="h-5 w-5" />} accent="cyan" delay={0.05} />
        <StatCard label="Notes this week" value="48" icon={<StickyNote className="h-5 w-5" />} accent="neon" delay={0.1} />
        <StatCard label="Focus hours" value="6.4h" delta="+1.2h vs last week" icon={<Clock className="h-5 w-5" />} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2">
          <SectionHeader title="Upcoming tasks" />
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1 bg-transparent glass rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <select
              value={newTaskDue}
              onChange={(e) => setNewTaskDue(e.target.value)}
              className="bg-transparent glass rounded-xl px-3 py-2 text-xs outline-none border-none cursor-pointer text-white"
            >
              <option value="Today" className="bg-neutral-900">Today</option>
              <option value="Tomorrow" className="bg-neutral-900">Tomorrow</option>
              <option value="This Friday" className="bg-neutral-900">Friday</option>
              <option value="Next Week" className="bg-neutral-900">Next Week</option>
            </select>
            <button
              type="submit"
              className="px-3 py-2 rounded-xl gradient-primary text-primary-foreground font-medium text-xs flex items-center justify-center gap-1 shadow-glow"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>
          <ul className="space-y-2">
            {tasks.map((t: any) => (
              <li
                key={t.id}
                onClick={() => toggleTaskMutation.mutate(t.id)}
                className="glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-sidebar-accent/30 transition-colors"
              >
                {t.done === 1 ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1">
                  <div className={`text-sm ${t.done === 1 ? "line-through text-muted-foreground" : ""}`}>
                    {t.text}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{t.due}</div>
                </div>
              </li>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-foreground">No tasks scheduled</div>
            )}
          </ul>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Today's meetings" action={<Users className="h-4 w-4 text-muted-foreground" />} />
          <ul className="space-y-3">
            {meetings.map((m: any) => (
              <li key={m.id} className="glass rounded-xl p-3">
                <div className="text-sm font-medium">{m.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{m.time_span}</div>
                <div className="text-[11px] text-muted-foreground">with {m.attendees}</div>
              </li>
            ))}
            {meetings.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-foreground">No meetings scheduled</div>
            )}
          </ul>
        </GlassCard>
      </div>
    </AppShell>
  );
}

