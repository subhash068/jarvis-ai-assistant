import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Search, FileText, BookOpen, Bookmark } from "lucide-react";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research · JARVIS AI" },
      { name: "description", content: "Web search, summarization, topic research and reports." },
    ],
  }),
  component: ResearchPage,
});

const reports = [
  { title: "State of small language models in 2026", sources: 14, time: "Today" },
  { title: "Voice agent latency benchmarks", sources: 9, time: "Yesterday" },
  { title: "ElevenLabs vs Cartesia TTS comparison", sources: 7, time: "2d" },
  { title: "Enterprise memory architectures", sources: 11, time: "1w" },
];

function ResearchPage() {
  return (
    <AppShell title="Research Hub" subtitle="Ask anything. Get sourced, structured answers.">
      <GlassCard className="mb-6">
        <div className="flex items-center gap-3 glass rounded-xl p-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            placeholder="Research a topic, e.g. 'On-device whisper for Indian languages'"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow">Search</button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2">
          <SectionHeader title="Saved reports" action={<BookOpen className="h-4 w-4 text-muted-foreground" />} />
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.title} className="glass rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg gradient-cyan grid place-items-center"><FileText className="h-4 w-4 text-background" /></div>
                  <div className="min-w-0">
                    <div className="text-sm truncate">{r.title}</div>
                    <div className="text-[11px] text-muted-foreground">{r.sources} sources · {r.time}</div>
                  </div>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-full glass">Open</button>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Saved findings" action={<Bookmark className="h-4 w-4 text-muted-foreground" />} />
          <ul className="space-y-3 text-sm">
            {[
              "Whisper-large v3 is 38% faster on Apple Silicon than v2.",
              "Median voice-to-voice latency target: <800ms end-to-end.",
              "pgvector + HNSW outperforms IVF for <1M embeddings.",
              "Telugu ASR benefits from phoneme-level finetuning.",
            ].map((f, i) => (
              <li key={i} className="glass rounded-lg p-3">{f}</li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </AppShell>
  );
}
