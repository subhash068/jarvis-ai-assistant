import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Camera, Monitor, Upload, ScanText, Eye } from "lucide-react";

export const Route = createFileRoute("/vision")({
  head: () => ({
    meta: [
      { title: "Vision · JARVIS AI" },
      { name: "description", content: "Webcam, screen and image analysis with OCR and object detection." },
    ],
  }),
  component: VisionPage,
});

const detections = [
  { label: "Person", score: 0.98 },
  { label: "Laptop", score: 0.94 },
  { label: "Coffee mug", score: 0.87 },
  { label: "Notebook", score: 0.81 },
  { label: "Window", score: 0.76 },
];

function VisionPage() {
  return (
    <AppShell title="Vision Center" subtitle="See the world through JARVIS — webcam, screen, files.">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {[
          { icon: Camera, label: "Webcam analysis" },
          { icon: Monitor, label: "Screen analysis" },
          { icon: Upload, label: "Image upload" },
          { icon: ScanText, label: "OCR extraction" },
        ].map((c, i) => (
          <GlassCard key={c.label} delay={i * 0.05} className="text-center">
            <div className="h-12 w-12 rounded-xl gradient-primary mx-auto grid place-items-center shadow-glow mb-3">
              <c.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="font-medium">{c.label}</div>
            <button className="mt-3 text-xs px-3 py-1.5 rounded-full glass">Open</button>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2">
          <SectionHeader title="Live view" action={<span className="text-[11px] text-muted-foreground">Webcam · 1080p</span>} />
          <div className="aspect-video rounded-xl border border-border overflow-hidden relative grid-bg grid place-items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-cyan/10" />
            <Eye className="h-16 w-16 text-primary/40" />
            <div className="absolute top-4 left-4 px-2 py-1 rounded-md glass text-[11px] uppercase tracking-widest">● Recording</div>
            <div className="absolute bottom-3 right-3 left-3 flex gap-2">
              <div className="flex-1 glass rounded-lg p-2 text-xs">Scene: home office, daylight, single subject</div>
              <div className="glass rounded-lg p-2 text-xs">12 fps</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Detections" />
          <ul className="space-y-3">
            {detections.map((d) => (
              <li key={d.label}>
                <div className="flex items-center justify-between text-sm">
                  <span>{d.label}</span>
                  <span className="text-xs text-muted-foreground">{(d.score * 100).toFixed(0)}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full gradient-primary" style={{ width: `${d.score * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </AppShell>
  );
}
