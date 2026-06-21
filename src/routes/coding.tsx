import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Code2, Bug, ClipboardList, Database, Server, Play } from "lucide-react";

export const Route = createFileRoute("/coding")({
  head: () => ({
    meta: [
      { title: "Coding · JARVIS AI" },
      { name: "description", content: "Generate, review and debug code with your AI dev partner." },
    ],
  }),
  component: CodingPage,
});

const tools = [
  { name: "Code Generator", icon: Code2, desc: "Spin up files, components and APIs from a prompt." },
  { name: "Bug Analyzer", icon: Bug, desc: "Paste a stack trace, get a root-cause and a fix." },
  { name: "Code Reviewer", icon: ClipboardList, desc: "Senior-level PR review in seconds." },
  { name: "API Builder", icon: Server, desc: "Design REST/GraphQL endpoints with types." },
  { name: "Database Designer", icon: Database, desc: "Sketch a schema in plain English." },
];

const snippet = `// FastAPI · WebSocket transcript stream
@app.websocket("/voice")
async def voice(ws: WebSocket):
    await ws.accept()
    async for chunk in mic_stream(ws):
        text = await whisper.transcribe(chunk)
        reply = await gpt.chat(text, memory=user.memory)
        await tts.stream(reply, ws)`;

function CodingPage() {
  return (
    <AppShell title="Coding Workspace" subtitle="Your senior pair programmer, on call.">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {tools.map((t, i) => (
          <GlassCard key={t.name} delay={i * 0.05}>
            <div className="h-11 w-11 rounded-xl gradient-primary grid place-items-center shadow-glow mb-3">
              <t.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="font-semibold">{t.name}</div>
            <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
            <button className="mt-4 text-xs px-3 py-1.5 rounded-full glass inline-flex items-center gap-1"><Play className="h-3.5 w-3.5" /> Launch</button>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <SectionHeader title="Generated · jarvis-voice.py" action={<span className="text-[11px] text-muted-foreground">Python · FastAPI</span>} />
          <pre className="rounded-xl bg-background/60 border border-border p-4 text-xs leading-relaxed overflow-x-auto font-mono text-foreground/90">
            {snippet}
          </pre>
        </GlassCard>
        <GlassCard>
          <SectionHeader title="Explanation" />
          <ol className="space-y-3 text-sm">
            {[
              "Accepts a WebSocket and streams audio chunks from the mic.",
              "Each chunk goes through Whisper for transcription.",
              "GPT receives the transcript plus user memory and produces a reply.",
              "ElevenLabs streams the spoken response back through the socket.",
            ].map((s, i) => (
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
