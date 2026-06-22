import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Shield, KeyRound, Volume2, Languages, Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
        <div className="h-9 w-9 rounded-lg gradient-primary grid place-items-center shrink-0">
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
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
  const queryClient = useQueryClient();

  // Fetch settings for user 1
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/settings/1");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedFields: any) => {
      const res = await fetch("http://localhost:8000/settings/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  if (isLoading || !settings) {
    return (
      <AppShell title="Settings" subtitle="Tune JARVIS to your style.">
        <div className="py-8 text-center text-muted-foreground">Loading settings...</div>
      </AppShell>
    );
  }

  const voices = ["Aurora", "Echo", "Onyx", "Nova"];
  const languages = ["English (US)", "Spanish", "French", "German", "Telugu", "Hindi"];

  return (
    <AppShell title="Settings" subtitle="Tune JARVIS to your style.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2">
          <SectionHeader title="Profile" />
          <div className="flex items-center gap-4 mb-5">
            <div className="h-16 w-16 rounded-full gradient-cyan grid place-items-center text-background font-bold text-xl uppercase">
              {settings.username.slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-lg">{settings.username}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {settings.email} · {settings.plan} plan
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            <Row
              icon={Volume2}
              label="Assistant voice"
              desc={`Current: ${settings.assistant_voice}`}
              action={
                <select
                  value={settings.assistant_voice}
                  onChange={(e) => updateSettingsMutation.mutate({ assistant_voice: e.target.value })}
                  className="bg-transparent glass rounded-lg px-2 py-1 text-xs outline-none border-none cursor-pointer focus:ring-1 focus:ring-primary"
                >
                  {voices.map((v) => (
                    <option key={v} value={v} className="bg-neutral-900 text-white">
                      {v}
                    </option>
                  ))}
                </select>
              }
            />
            <Row
              icon={Languages}
              label="Preferred language"
              desc={`Current: ${settings.preferred_language}`}
              action={
                <select
                  value={settings.preferred_language}
                  onChange={(e) => updateSettingsMutation.mutate({ preferred_language: e.target.value })}
                  className="bg-transparent glass rounded-lg px-2 py-1 text-xs outline-none border-none cursor-pointer focus:ring-1 focus:ring-primary"
                >
                  {languages.map((l) => (
                    <option key={l} value={l} className="bg-neutral-900 text-white">
                      {l}
                    </option>
                  ))}
                </select>
              }
            />
            <Row
              icon={Bell}
              label="Notifications"
              desc="Push, email and summary briefings"
              action={
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled === 1}
                  onChange={(e) =>
                    updateSettingsMutation.mutate({ notifications_enabled: e.target.checked ? 1 : 0 })
                  }
                  className="h-4 w-4 accent-primary cursor-pointer"
                />
              }
            />
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Security & Privacy" />
          <div className="grid gap-3">
            <Row
              icon={KeyRound}
              label="Two-factor auth"
              desc="Require code on new devices"
              action={
                <input
                  type="checkbox"
                  checked={settings.two_factor_auth === 1}
                  onChange={(e) =>
                    updateSettingsMutation.mutate({ two_factor_auth: e.target.checked ? 1 : 0 })
                  }
                  className="h-4 w-4 accent-primary cursor-pointer"
                />
              }
            />
            <Row
              icon={Shield}
              label="Memory privacy"
              desc="Encrypt stored memory entries"
              action={
                <input
                  type="checkbox"
                  checked={settings.memory_privacy === 1}
                  onChange={(e) =>
                    updateSettingsMutation.mutate({ memory_privacy: e.target.checked ? 1 : 0 })
                  }
                  className="h-4 w-4 accent-primary cursor-pointer"
                />
              }
            />
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

