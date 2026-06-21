import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui-kit/cards";
import { Plus, Paperclip, Mic, Send, Search } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat · JARVIS AI" },
      { name: "description", content: "Multimodal AI chat workspace with memory, files and code." },
    ],
  }),
  component: ChatPage,
});

const threads = [
  { title: "Roadmap brainstorm", time: "Just now", active: true },
  { title: "Q3 investor narrative", time: "2h" },
  { title: "Fix Stripe webhook bug", time: "Yesterday" },
  { title: "Apartment search Hyderabad", time: "2 days" },
  { title: "Recipe ideas for Sunday", time: "Last week" },
];

const messages = [
  { role: "user", text: "Help me draft a one-pager for the JARVIS launch." },
  { role: "ai", text: "Of course. Here's a draft structure:\n\n1. **Vision** — A personal AI OS\n2. **Capabilities** — voice, agents, memory\n3. **Differentiation** — multilingual + multimodal\n4. **Roadmap** — Q3 GA\n\nWant me to write the full copy in your voice?" },
  { role: "user", text: "Yes, formal but warm. Include a quote from me." },
];

function ChatPage() {
  return (
    <AppShell title="Chat Workspace" subtitle="Conversations with memory across every device.">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <GlassCard className="p-3">
          <button className="w-full mb-3 px-3 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 shadow-glow">
            <Plus className="h-4 w-4" /> New conversation
          </button>
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search threads" className="w-full bg-transparent glass rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <ul className="space-y-1">
            {threads.map((t, i) => (
              <li key={i} className={`px-3 py-2.5 rounded-lg cursor-pointer ${t.active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"}`}>
                <div className="text-sm truncate">{t.title}</div>
                <div className="text-[11px] text-muted-foreground">{t.time}</div>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="flex flex-col min-h-[640px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${m.role === "user" ? "gradient-primary text-primary-foreground" : "glass"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 glass rounded-2xl p-2 flex items-end gap-2">
            <button className="h-10 w-10 grid place-items-center rounded-xl hover:bg-sidebar-accent"><Paperclip className="h-4 w-4" /></button>
            <textarea
              rows={1}
              placeholder="Ask JARVIS anything…"
              className="flex-1 bg-transparent outline-none resize-none px-2 py-2 text-sm"
            />
            <button className="h-10 w-10 grid place-items-center rounded-xl hover:bg-sidebar-accent"><Mic className="h-4 w-4" /></button>
            <button className="h-10 w-10 grid place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow"><Send className="h-4 w-4" /></button>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
