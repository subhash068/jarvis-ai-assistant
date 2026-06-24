import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentsTab } from "@/components/system-events/AgentsTab";
import { MemoryTab } from "@/components/system-events/MemoryTab";
import { AnalyticsTab } from "@/components/system-events/AnalyticsTab";

export const Route = createFileRoute("/system-events")({
  head: () => ({
    meta: [
      { title: "System Events · JARVIS AI" },
      { name: "description", content: "System events including agents, memory center, and analytics." },
    ],
  }),
  component: SystemEventsPage,
});

function SystemEventsPage() {
  return (
    <AppShell title="System Events" subtitle="Monitor and manage all system activities, stored intelligence, and analytics.">
      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="agents">Agent Control Center</TabsTrigger>
          <TabsTrigger value="memory">Memory Center</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="agents" className="mt-0">
          <AgentsTab />
        </TabsContent>
        <TabsContent value="memory" className="mt-0">
          <MemoryTab />
        </TabsContent>
        <TabsContent value="analytics" className="mt-0">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
