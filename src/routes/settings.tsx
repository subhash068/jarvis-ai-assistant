import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Shield, KeyRound, Volume2, Languages, Bell } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · JARVIS AI" },
      { name: "description", content: "Account, voice, language, notifications and security preferences." },
    ],
  }),
  component: SettingsPage,
});

function Row({ icon: Icon, label, desc, action }: any) {
  return (
    <div className="flex items-center justify-between glass rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg gradient-primary grid place-items-center"><Icon className="h-4 w-4 text-primary-foreground" /></div>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-[11px] text-muted-foreground">{desc}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Tune JARVIS to your style.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2">
          <SectionHeader title="Profile" />
          <div className="flex items-center gap-4 mb-5">
            <div className="h-16 w-16 rounded-full gradient-cyan grid place-items-center text-background font-bold text-xl">JA</div>
            <div>
              <div className="font-semibold">Jordan Reyes</div>
              <div className="text-xs text-muted-foreground">jordan@jarvis.ai · Premium plan</div>
            </div>
            <button className="ml-auto px-3 py-1.5 rounded-lg glass text-xs">Edit</button>
          </div>
          <div className="grid gap-3">
            <Row icon={Volume2} label="Assistant voice" desc="Aurora · 1.0x speed" action={<button className="text-xs text-primary">Change</button>} />
            <Row icon={Languages} label="Preferred language" desc="English (US) · auto-switch to Telugu / Hindi" action={<button className="text-xs text-primary">Change</button>} />
            <Row icon={Bell} label="Notifications" desc="Push, email and summary briefings" action={<input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />} />
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Security" />
          <div className="grid gap-3">
            <Row icon={KeyRound} label="Two-factor auth" desc="Enabled · Authenticator app" action={<span className="text-xs text-emerald-400">On</span>} />
            <Row icon={Shield} label="Memory privacy" desc="Encrypted at rest with your key" action={<span className="text-xs text-emerald-400">On</span>} />
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
