import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, StatCard, SectionHeader } from "@/components/ui-kit/cards";
import { Brain, Star, Search, Trash2, Pencil, BookMarked, Sparkles } from "lucide-react";

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
const memories = [
  { cat: "Preferences", text: "Prefers concise replies, formal but warm tone", when: "Today" },
  { cat: "Personal", text: "Lives in Hyderabad; commutes by metro", when: "Today" },
  { cat: "Projects", text: "Building JARVIS AI — launch targeted for Q3", when: "Yesterday" },
  { cat: "Knowledge", text: "Has read Designing Data-Intensive Applications cover to cover", when: "3d" },
  { cat: "Preferences", text: "Voice: prefers a calm female voice at 1.0x speed", when: "1w" },
  { cat: "Personal", text: "Sister's birthday: April 14", when: "2w" },
];

function MemoryPage() {
  return (
    <AppShell title="Memory Center" subtitle="What JARVIS remembers about you — searchable, editable, yours.">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <StatCard label="Stored memories" value="8,940" icon={<Brain className="h-5 w-5" />} />
        <StatCard label="Preferences" value="142" icon={<Star className="h-5 w-5" />} accent="cyan" delay={0.05} />
        <StatCard label="Projects" value="36" icon={<BookMarked className="h-5 w-5" />} accent="neon" delay={0.1} />
        <StatCard label="New this week" value="312" icon={<Sparkles className="h-5 w-5" />} delay={0.15} />
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
            <button key={c} className={`px-3 py-1.5 rounded-full text-xs ${i === 0 ? "gradient-primary text-primary-foreground" : "glass"}`}>{c}</button>
          ))}
        </div>
        <ul className="space-y-3">
          {memories.map((m, i) => (
            <li key={i} className="glass rounded-xl p-4 flex items-start gap-4">
              <div className="h-9 w-9 rounded-lg gradient-cyan grid place-items-center shrink-0">
                <Brain className="h-4 w-4 text-background" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">{m.text}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{m.cat} · {m.when}</div>
              </div>
              <div className="flex gap-1">
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-sidebar-accent"><Pencil className="h-4 w-4" /></button>
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-destructive/20 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>
    </AppShell>
  );
}
