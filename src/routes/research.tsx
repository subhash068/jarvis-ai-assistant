import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Search, FileText, BookOpen, Bookmark } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research · JARVIS AI" },
      { name: "description", content: "Web search, summarization, topic research and reports." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState("");
  const [activeReport, setActiveReport] = useState<any>(null);

  // Fetch reports
  const { data: reports = [], isLoading: isLoadingReports } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/research/reports?user_id=1");
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });

  // Fetch findings
  const { data: findings = [], isLoading: isLoadingFindings } = useQuery({
    queryKey: ["findings"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/research/findings?user_id=1");
      if (!res.ok) throw new Error("Failed to fetch findings");
      return res.json();
    },
  });

  // Generate research report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (topicText: string) => {
      const res = await fetch("http://localhost:8000/research/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicText, user_id: 1 }),
      });
      if (!res.ok) throw new Error("Failed to generate report");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["findings"] });
      setActiveReport(data);
      setTopic("");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || generateReportMutation.isPending) return;
    generateReportMutation.mutate(topic);
  };

  return (
    <AppShell title="Research Hub" subtitle="Ask anything. Get sourced, structured answers.">
      <GlassCard className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-3 glass rounded-xl p-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            placeholder="Research a topic, e.g. 'On-device whisper for Indian languages'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={generateReportMutation.isPending}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button
            type="submit"
            disabled={generateReportMutation.isPending || !topic.trim()}
            className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow disabled:opacity-50"
          >
            {generateReportMutation.isPending ? "Researching..." : "Search"}
          </button>
        </form>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2">
          <SectionHeader title="Saved reports" action={<BookOpen className="h-4 w-4 text-muted-foreground" />} />
          {isLoadingReports ? (
            <div className="text-center text-xs text-muted-foreground py-4">Loading reports...</div>
          ) : (
            <ul className="space-y-3">
              {reports.map((r: any) => (
                <li
                  key={r.id}
                  className="glass rounded-xl p-4 flex flex-col gap-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg gradient-cyan grid place-items-center shrink-0">
                        <FileText className="h-4 w-4 text-background" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{r.title}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {r.sources_count} sources
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveReport(activeReport?.id === r.id ? null : r)}
                      className="text-xs px-3 py-1.5 rounded-full glass"
                    >
                      {activeReport?.id === r.id ? "Close" : "Open"}
                    </button>
                  </div>
                  {activeReport?.id === r.id && (
                    <div className="text-xs text-muted-foreground mt-2 border-t border-border/50 pt-3 leading-relaxed whitespace-pre-wrap">
                      {r.content}
                    </div>
                  )}
                </li>
              ))}
              {reports.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">No reports generated yet</div>
              )}
            </ul>
          )}
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Saved findings" action={<Bookmark className="h-4 w-4 text-muted-foreground" />} />
          {isLoadingFindings ? (
            <div className="text-center text-xs text-muted-foreground py-4">Loading findings...</div>
          ) : (
            <ul className="space-y-3 text-sm">
              {findings.map((f: any) => (
                <li key={f.id} className="glass rounded-lg p-3">
                  {f.text}
                </li>
              ))}
              {findings.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">No findings recorded</div>
              )}
            </ul>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}

