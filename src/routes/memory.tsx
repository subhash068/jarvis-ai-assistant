import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, StatCard, SectionHeader } from "@/components/ui-kit/cards";
import { Brain, Star, Search, Trash2, Pencil, BookMarked, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory · JARVIS AI" },
      { name: "description", content: "Stored memories, preferences and long-term knowledge for your assistant." },
    ],
  }),
  component: MemoryPage,
});

const cats = ["All", "Preferences", "Personal", "Projects", "Knowledge", "Recent"];

function MemoryPage() {
  const [filter, setFilter] = useState("All");
  const queryClient = useQueryClient();

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['memories'],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/memory/?user_id=1");
      if (!res.ok) throw new Error("Failed to fetch memories");
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:8000/memory/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete memory");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    }
  });

  const filteredMemories = memories.filter((m: any) => filter === "All" || m.category === filter);

  // Compute stats
  const totalMemories = memories.length;
  const preferencesCount = memories.filter((m: any) => m.category === "Preferences").length;
  const projectsCount = memories.filter((m: any) => m.category === "Projects").length;
  
  // Just a simple mock for "New this week" for now
  const newThisWeekCount = memories.filter((m: any) => {
    const created = new Date(m.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  }).length;

  return (
    <AppShell title="Memory Center" subtitle="What JARVIS remembers about you — searchable, editable, yours.">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <StatCard label="Stored memories" value={isLoading ? "..." : totalMemories.toString()} icon={<Brain className="h-5 w-5" />} />
        <StatCard label="Preferences" value={isLoading ? "..." : preferencesCount.toString()} icon={<Star className="h-5 w-5" />} accent="cyan" delay={0.05} />
        <StatCard label="Projects" value={isLoading ? "..." : projectsCount.toString()} icon={<BookMarked className="h-5 w-5" />} accent="neon" delay={0.1} />
        <StatCard label="New this week" value={isLoading ? "..." : newThisWeekCount.toString()} icon={<Sparkles className="h-5 w-5" />} delay={0.15} />
      </div>

      <GlassCard>
        <SectionHeader
          title="Memory library"
          action={
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search memories" className="bg-transparent glass rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          }
        />
        <div className="flex flex-wrap gap-2 mb-5">
          {cats.map((c, i) => (
            <button 
              key={c} 
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${filter === c ? "gradient-primary text-primary-foreground" : "glass hover:bg-white/5"}`}
            >
              {c}
            </button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading memories...</div>
        ) : filteredMemories.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No memories found.</div>
        ) : (
          <ul className="space-y-3">
            {filteredMemories.map((m: any) => (
              <li key={m.id} className="glass rounded-xl p-4 flex items-start gap-4">
                <div className="h-9 w-9 rounded-lg gradient-cyan grid place-items-center shrink-0">
                  <Brain className="h-4 w-4 text-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{m.content}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {m.category} · {new Date(m.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-sidebar-accent"><Pencil className="h-4 w-4" /></button>
                  <button 
                    onClick={() => deleteMutation.mutate(m.id)}
                    className="h-8 w-8 grid place-items-center rounded-lg hover:bg-destructive/20 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </AppShell>
  );
}
