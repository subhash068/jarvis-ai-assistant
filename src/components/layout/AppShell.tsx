import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Mic, MessageSquare, Brain, Bot, Cpu, Code2,
  Eye, Globe, Monitor, Search, CalendarCheck, Sparkles, BarChart3, Settings, PlaySquare, Image
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/voice", label: "Voice", icon: Mic },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/system-events", label: "System Events", icon: Brain },
  { to: "/automation", label: "Automation", icon: Cpu },
  { to: "/browser", label: "Browser", icon: Globe },
  { to: "/pc-automation", label: "PC Control", icon: Monitor },
  { to: "/coding", label: "Coding", icon: Code2 },
  { to: "/vision", label: "Vision", icon: Eye },
  { to: "/research", label: "Research", icon: Search },
  { to: "/productivity", label: "Productivity", icon: CalendarCheck },
  { to: "/image-generation", label: "Image Generation", icon: Image },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/testing-engine", label: "Testing Engine", icon: PlaySquare },
] as const;

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col glass-strong border-r border-border sticky top-0 h-screen">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-border">
          <div className="relative h-10 w-10 rounded-xl gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold tracking-tight text-base">JARVIS AI</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest">v1.0 · Neural</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to as any}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-sidebar-accent text-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r gradient-primary"
                  />
                )}
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full gradient-cyan grid place-items-center text-xs font-bold text-background">JA</div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">Jordan Reyes</div>
              <div className="text-[11px] text-muted-foreground">Premium</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 glass-strong border-b border-border">
          <div className="flex items-center justify-between px-6 lg:px-10 py-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor]" />
                Online · Llama 3.3
              </div>
              <Link to="/voice" className="h-9 w-9 rounded-full gradient-primary grid place-items-center shadow-glow hover:opacity-90 transition-opacity">
                <Mic className="h-4 w-4 text-primary-foreground" />
              </Link>
            </div>
          </div>
        </header>
        <div className="px-6 lg:px-10 py-8">{children}</div>
      </main>
    </div>
  );
}
