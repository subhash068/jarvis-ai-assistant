import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { FolderOpen, AppWindow, Globe, Terminal, Download, Plus } from "lucide-react";

export const Route = createFileRoute("/automation")({
  head: () => ({
    meta: [
      { title: "Automation · JARVIS AI" },
      { name: "description", content: "Computer automation: files, apps, browser and command execution." },
    ],
  }),
  component: AutomationPage,
});

const apps = ["VS Code", "Notion", "Spotify", "Slack", "Figma", "Chrome", "Terminal", "Calendar"];
const files = [
  { name: "investor-deck.pdf", size: "4.2 MB", time: "Today" },
  { name: "jarvis-architecture.excalidraw", size: "812 KB", time: "Today" },
  { name: "Q3-plan.md", size: "12 KB", time: "Yesterday" },
  { name: "voice-samples.zip", size: "84 MB", time: "2d" },
];

function AutomationPage() {
  return (
    <AppShell title="Automation Center" subtitle="Tell JARVIS to act — files, apps, browser and commands.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <GlassCard>
          <SectionHeader title="Application launcher" action={<AppWindow className="h-4 w-4 text-muted-foreground" />} />
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {apps.map((a) => (
              <button key={a} className="glass rounded-xl p-4 text-center hover:bg-sidebar-accent transition">
                <div className="h-10 w-10 rounded-lg gradient-primary mx-auto mb-2 grid place-items-center text-primary-foreground font-bold">
                  {a.charAt(0)}
                </div>
                <div className="text-xs">{a}</div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Browser controller" action={<Globe className="h-4 w-4 text-muted-foreground" />} />
          <div className="glass rounded-xl p-4 mb-3 text-xs text-muted-foreground">jarvis://browser/active</div>
          <ul className="space-y-2">
            {["Open new tab", "Search 'edge LLM benchmarks 2025'", "Bookmark current page", "Summarize this article"].map((s) => (
              <li key={s} className="flex items-center justify-between glass rounded-lg px-3 py-2 text-sm">
                <span>{s}</span>
                <button className="text-xs text-primary">Run</button>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2">
          <SectionHeader
            title="File manager"
            action={<button className="text-xs px-3 py-1.5 rounded-full gradient-primary text-primary-foreground inline-flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> New</button>}
          />
          <ul className="divide-y divide-border">
            {files.map((f) => (
              <li key={f.name} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg glass grid place-items-center"><FolderOpen className="h-4 w-4 text-primary" /></div>
                  <div>
                    <div className="text-sm">{f.name}</div>
                    <div className="text-[11px] text-muted-foreground">{f.size} · {f.time}</div>
                  </div>
                </div>
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-sidebar-accent"><Download className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Task console" action={<Terminal className="h-4 w-4 text-muted-foreground" />} />
          <div className="rounded-xl bg-background/60 border border-border p-3 font-mono text-xs leading-relaxed">
            <div><span className="text-primary">jarvis</span><span className="text-muted-foreground">@local ~</span> $ open spotify</div>
            <div className="text-muted-foreground">→ launched Spotify · focus playlist</div>
            <div className="mt-2"><span className="text-primary">jarvis</span><span className="text-muted-foreground">@local ~</span> $ download invoice_aug.pdf</div>
            <div className="text-muted-foreground">→ saved to ~/Downloads</div>
            <div className="mt-2"><span className="text-primary">jarvis</span><span className="text-muted-foreground">@local ~</span> $ <span className="animate-pulse">_</span></div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
