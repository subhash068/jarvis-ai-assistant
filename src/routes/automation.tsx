import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { FolderOpen, AppWindow, Globe, Terminal, Download, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useRef } from "react";

export const Route = createFileRoute("/automation")({
  head: () => ({
    meta: [
      { title: "Automation · JARVIS AI" },
      { name: "description", content: "Computer automation: files, apps, browser and command execution." },
    ],
  }),
  component: AutomationPage,
});

function AutomationPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: apps = [] } = useQuery({
    queryKey: ["automation", "apps"],
    queryFn: async () => {
      const res = await fetch("/api/automation/apps");
      if (!res.ok) throw new Error("Failed to fetch apps");
      return res.json();
    },
  });

  const { data: files = [] } = useQuery({
    queryKey: ["automation", "files"],
    queryFn: async () => {
      const res = await fetch("/api/automation/files");
      if (!res.ok) throw new Error("Failed to fetch files");
      return res.json();
    },
  });

  const { data: browserActions = [] } = useQuery({
    queryKey: ["automation", "browserActions"],
    queryFn: async () => {
      const res = await fetch("/api/automation/browser/actions");
      if (!res.ok) throw new Error("Failed to fetch browser actions");
      return res.json();
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["automation", "tasks"],
    queryFn: async () => {
      const res = await fetch("/api/automation/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    refetchInterval: 1000,
  });

  const handleDownload = (filename: string) => {
    window.open(`/api/automation/files/${filename}`, "_blank");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/automation/files", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload file");
      queryClient.invalidateQueries({ queryKey: ["automation", "files"] });
    } catch (err) {
      console.error(err);
      alert("Failed to upload file");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAppLaunch = async (appName: string) => {
    try {
      const res = await fetch("/api/automation/app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_name: appName }),
      });
      if (!res.ok) throw new Error("Failed to launch app");
      const data = await res.json();
      // Optional: show a small toast or just let the app open silently
      console.log(data.message);
    } catch (err) {
      console.error(err);
      alert(`Failed to launch ${appName}`);
    }
  };

  const handleBrowserAction = async (action: string) => {
    try {
      const res = await fetch("/api/automation/browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action }),
      });
      if (!res.ok) throw new Error("Failed to execute browser action");
      const data = await res.json();
      if (data.message.includes("requires an extension")) {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to execute ${action}`);
    }
  };

  return (
    <AppShell title="Automation Center" subtitle="Tell JARVIS to act — files, apps, browser and commands.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <GlassCard>
          <SectionHeader title="Application launcher" action={<AppWindow className="h-4 w-4 text-muted-foreground" />} />
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {apps.map((a: string) => (
              <button 
                key={a} 
                onClick={() => handleAppLaunch(a)}
                className="glass rounded-xl p-4 text-center hover:bg-sidebar-accent hover:border-primary/50 transition cursor-pointer"
              >
                <div className="h-10 w-10 rounded-lg gradient-primary mx-auto mb-2 grid place-items-center text-primary-foreground font-bold shadow-glow">
                  {a.charAt(0)}
                </div>
                <div className="text-xs font-medium">{a}</div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Browser controller" action={<Globe className="h-4 w-4 text-muted-foreground" />} />
          <div className="glass rounded-xl p-4 mb-3 text-xs text-muted-foreground">jarvis://browser/active</div>
          <ul className="space-y-2">
            {browserActions.map((s: string) => (
              <li key={s} className="flex items-center justify-between glass rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition-colors">
                <span>{s}</span>
                <button 
                  className="text-xs px-3 py-1 rounded-full gradient-primary text-primary-foreground font-medium shadow-glow hover:opacity-90 transition-opacity"
                  onClick={() => handleBrowserAction(s)}
                >
                  Run
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2">
          <SectionHeader
            title="File manager"
            action={
              <>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                <button 
                  className="text-xs px-3 py-1.5 rounded-full gradient-primary text-primary-foreground inline-flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity shadow-glow"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="h-3.5 w-3.5" /> New
                </button>
              </>
            }
          />
          <ul className="divide-y divide-border">
            {files.map((f: any) => (
              <li key={f.name} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg glass grid place-items-center"><FolderOpen className="h-4 w-4 text-primary" /></div>
                  <div>
                    <div className="text-sm">{f.name}</div>
                    <div className="text-[11px] text-muted-foreground">{f.size} · {f.time}</div>
                  </div>
                </div>
                <button 
                  className="h-8 w-8 grid place-items-center rounded-lg hover:bg-sidebar-accent transition-colors"
                  onClick={() => handleDownload(f.name)}
                >
                  <Download className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Task console" action={<Terminal className="h-4 w-4 text-muted-foreground" />} />
          <div className="rounded-xl bg-background/60 border border-border p-3 font-mono text-xs leading-relaxed max-h-64 overflow-y-auto">
            {tasks.map((t: any, i: number) => (
              <div key={i} className={t.type === "input" ? "mt-2" : "text-muted-foreground"}>
                {t.type === "input" ? (
                  <>
                    <span className="text-primary">jarvis</span>
                    <span className="text-muted-foreground">@local ~</span> $ {t.text}
                  </>
                ) : (
                  t.text
                )}
              </div>
            ))}
            <div className="mt-2"><span className="text-primary">jarvis</span><span className="text-muted-foreground">@local ~</span> $ <span className="animate-pulse">_</span></div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
