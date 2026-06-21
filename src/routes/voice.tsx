import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { VoiceOrb, Waveform } from "@/components/ui-kit/voice";
import { Mic, MicOff, Volume2, Languages, Square } from "lucide-react";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "Voice · JARVIS AI" },
      { name: "description", content: "Real-time multilingual voice conversation with your AI assistant." },
    ],
  }),
  component: VoicePage,
});

const transcript = [
  { role: "user", text: "Good morning Jarvis. What's on my calendar today?" },
  { role: "ai", text: "Good morning Jordan. You have three meetings: design sync at 10, investor call at 1, and a deep work block at 3 PM. Nothing urgent overnight." },
  { role: "user", text: "Move the design sync to tomorrow and prep talking points for the investor call." },
  { role: "ai", text: "Moved the design sync to tomorrow 10 AM. Drafting investor talking points now — I'll send a summary to your notes in a moment." },
];

function VoicePage() {
  return (
    <AppShell title="Voice Interface" subtitle="Speak naturally. JARVIS listens, reasons, and responds in real time.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-1 flex flex-col items-center text-center" delay={0}>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <Languages className="h-3.5 w-3.5" /> Language
          </div>
          <div className="flex gap-2 mb-6">
            {["English", "Telugu", "Hindi"].map((l, i) => (
              <button key={l} className={`px-3 py-1.5 rounded-full text-xs ${i === 0 ? "gradient-primary text-primary-foreground" : "glass"}`}>{l}</button>
            ))}
          </div>
          <VoiceOrb active size={260} />
          <div className="mt-8 flex items-center gap-3">
            <button className="h-12 w-12 rounded-full gradient-primary grid place-items-center shadow-glow"><Mic className="h-5 w-5 text-primary-foreground" /></button>
            <button className="h-12 w-12 rounded-full glass grid place-items-center"><MicOff className="h-5 w-5" /></button>
            <button className="h-12 w-12 rounded-full glass grid place-items-center"><Volume2 className="h-5 w-5" /></button>
            <button className="h-12 w-12 rounded-full glass grid place-items-center"><Square className="h-5 w-5" /></button>
          </div>
          <div className="mt-6 w-full"><Waveform active /></div>
        </GlassCard>

        <GlassCard className="lg:col-span-2" delay={0.05}>
          <SectionHeader title="Live conversation" action={<span className="text-xs text-muted-foreground">Session · 04:18</span>} />
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
            {transcript.map((t, i) => (
              <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${t.role === "user" ? "gradient-primary text-primary-foreground" : "glass"}`}>
                  {t.text}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 glass rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1"><Waveform active height={36} bars={48} /></div>
            <span className="text-xs text-muted-foreground">Transcribing…</span>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
