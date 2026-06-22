import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Code2, Bug, ClipboardList, Database, Server, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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

function CodingPage() {
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

  return (
    <AppShell title="Coding Workspace" subtitle="Your senior pair programmer, on call.">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {tools.map((t: any, i: number) => {
          const Icon = iconMap[t.icon] || Code2;
          return (
            <GlassCard key={t.name} delay={i * 0.05}>
              <div className="h-11 w-11 rounded-xl gradient-primary grid place-items-center shadow-glow mb-3">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="font-semibold">{t.name}</div>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              <button className="mt-4 text-xs px-3 py-1.5 rounded-full glass inline-flex items-center gap-1"><Play className="h-3.5 w-3.5" /> Launch</button>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <SectionHeader title={snippetData?.title || "Loading..."} action={<span className="text-[11px] text-muted-foreground">{snippetData?.language || ""}</span>} />
          <pre className="rounded-xl bg-background/60 border border-border p-4 text-xs leading-relaxed overflow-x-auto font-mono text-foreground/90">
            {snippetData?.code || "Loading..."}
          </pre>
        </GlassCard>
        <GlassCard>
          <SectionHeader title="Explanation" />
          <ol className="space-y-3 text-sm">
            {(snippetData?.explanation || []).map((s: string, i: number) => (
              <li key={i} className="flex gap-3">
                <span className="h-6 w-6 rounded-full gradient-primary grid place-items-center text-[11px] font-semibold text-primary-foreground shrink-0">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>
    </AppShell>
  );
}
