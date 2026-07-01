import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader, StatCard } from "@/components/ui-kit/cards";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Target, Search, CheckCircle2, Bot, ArrowRight, Loader2, Phone, Database, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/lead-gen")({
  head: () => ({
    meta: [
      { title: "Lead Gen Agent · JARVIS AI" },
      { name: "description", content: "Autonomous Lead Generation and Pitching Agent." },
    ],
  }),
  component: LeadGenAgent,
});

function LeadGenAgent() {
  const [mode, setMode] = useState<"reddit" | "url">("reddit");
  const [keyword, setKeyword] = useState("react");
  const [subreddit, setSubreddit] = useState("forhire");
  const [url, setUrl] = useState("");
  const [callingLeadId, setCallingLeadId] = useState<string | null>(null);
  const [emailingLeadId, setEmailingLeadId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [recordings, setRecordings] = useState<Record<string, string>>({});
  const [syncedLeads, setSyncedLeads] = useState<Set<string>>(new Set());
  const [emailedLeads, setEmailedLeads] = useState<Set<string>>(new Set());

  const savedLeadsQuery = useQuery({
    queryKey: ["savedLeads"],
    queryFn: async () => {
      const res = await fetch("/api/lead-gen/leads");
      if (!res.ok) return { leads: [] };
      return res.json();
    }
  });

  const scrapeMutation = useMutation({
    mutationFn: async () => {
      const payload = mode === "reddit" 
        ? { mode, subreddit, keyword } 
        : { mode, url };
        
      const res = await fetch("/api/lead-gen/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    }
  });

  const callMutation = useMutation({
    mutationFn: async (lead: any) => {
      const res = await fetch("/api/lead-gen/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phoneNumber,
          lead_title: lead.title,
          lead_snippet: lead.snippet,
          pitch: lead.drafted_pitch
        })
      });
      if (!res.ok) throw new Error("Failed to initiate call");
      return res.json();
    },
    onSuccess: (data, lead) => {
      setCallingLeadId(null);
      setPhoneNumber("");
      
      if (data.recording_url) {
        setRecordings(prev => ({...prev, [lead.id]: data.recording_url}));
      } else {
        alert("AI Voice Agent dialed the prospect, but no mock recording was generated.");
      }
    }
  });

  const notionSyncMutation = useMutation({
    mutationFn: async (lead: any) => {
      const res = await fetch("/api/crm/export-notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          title: lead.title,
          snippet: lead.snippet,
          pitch: lead.drafted_pitch,
          url: lead.url,
          source: lead.source
        })
      });
      if (!res.ok) throw new Error("Failed to sync to Notion");
      return res.json();
    },
    onSuccess: (data, lead) => {
      setSyncedLeads(prev => new Set(prev).add(lead.id));
    }
  });

  const emailMutation = useMutation({
    mutationFn: async (lead: any) => {
      const res = await fetch("/api/lead-gen/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_email: emailAddress,
          subject: `Re: ${lead.title}`,
          body: lead.drafted_pitch,
          lead_id: lead.id
        })
      });
      if (!res.ok) throw new Error("Failed to send email");
      return res.json();
    },
    onSuccess: (data, lead) => {
      setEmailedLeads(prev => new Set(prev).add(lead.id));
      setEmailingLeadId(null);
      setEmailAddress("");
    }
  });

  // Combine saved leads from background cron and manual scanned leads
  const savedLeads = savedLeadsQuery.data?.leads || [];
  const manualLeads = scrapeMutation.data?.leads || [];
  const leads = [...manualLeads, ...savedLeads.filter((l: any) => !manualLeads.some((ml: any) => ml.id === l.id))];

  return (
    <AppShell title="Lead Gen Agent" subtitle="Autonomous client acquisition and pitching">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <StatCard label="Leads Found" value={leads.length.toString()} icon={<Target className="h-5 w-5" />} delay={0} />
        <StatCard label="Pitches Drafted" value={leads.filter((l: any) => l.status.includes("Drafted")).length.toString()} icon={<Bot className="h-5 w-5" />} accent="cyan" delay={0.05} />
        <StatCard label="Status" value={scrapeMutation.isPending ? "Scanning..." : "Idle"} icon={<Search className="h-5 w-5" />} accent="neon" delay={0.1} />
        <StatCard label="Background Scanner" value="Active (1m)" icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />} accent="neon" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-5">
          <GlassCard delay={0.15}>
            <SectionHeader title="Agent Configuration" />
            <div className="space-y-4 mt-4">
              <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                <button 
                  onClick={() => setMode("reddit")}
                  className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${mode === "reddit" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Reddit Mode
                </button>
                <button 
                  onClick={() => setMode("url")}
                  className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${mode === "url" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Custom URL Mode
                </button>
              </div>

              {mode === "reddit" ? (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Target Keyword</label>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="e.g. react, nextjs, python"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Target Subreddit</label>
                    <input
                      type="text"
                      value={subreddit}
                      onChange={(e) => setSubreddit(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="e.g. forhire"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Website URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="e.g. https://www.upwork.com/..."
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Jarvis will spin up a headless browser, scrape the page, and use Groq LLaMA to extract jobs and draft pitches. This takes 5-15 seconds.
                  </p>
                </div>
              )}

              <button
                onClick={() => scrapeMutation.mutate()}
                disabled={scrapeMutation.isPending}
                className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {scrapeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {scrapeMutation.isPending ? "Scanning Web..." : "Run Lead Scan"}
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <GlassCard delay={0.2} className="min-h-[500px]">
            <SectionHeader title="Discovered Leads & Pitches" />
            
            {scrapeMutation.isPending ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                <p>Jarvis is scanning {mode === "reddit" ? subreddit : "the custom URL"}...</p>
                <p className="text-xs mt-2 text-center max-w-sm">
                  {mode === "reddit" 
                    ? "Drafting personalized pitches using Groq Llama 3..."
                    : "Spinning up headless browser, scraping content, and extracting jobs..."}
                </p>
              </div>
            ) : leads.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                <Target className="h-12 w-12 opacity-20 mb-4" />
                <p>No leads found yet. Run a scan to find prospects.</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {leads.map((lead: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    key={lead.id} 
                    className="p-4 rounded-xl border border-white/5 bg-black/20 relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-foreground pr-20">{lead.title}</h3>
                      <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{lead.snippet}</p>
                    
                    <div className="bg-black/30 p-3 rounded-lg border border-primary/20">
                      <div className="text-[10px] uppercase tracking-widest text-primary mb-1.5 flex items-center gap-1">
                        <Bot className="h-3 w-3" /> Jarvis AI Drafted Pitch
                      </div>
                      <p className="text-sm italic text-foreground/90">{lead.drafted_pitch}</p>
                      
                      <div className="mt-3 flex justify-end gap-2">
                         <a href={lead.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-md glass hover:bg-white/10 transition-colors">
                           View Post
                         </a>
                         
                         <button 
                           onClick={() => notionSyncMutation.mutate(lead)}
                           disabled={syncedLeads.has(lead.id) || notionSyncMutation.isPending}
                           className="text-xs px-3 py-1.5 rounded-md bg-zinc-500/20 text-zinc-300 hover:bg-zinc-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                         >
                           {syncedLeads.has(lead.id) ? (
                             <><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Synced to Notion</>
                           ) : notionSyncMutation.isPending && notionSyncMutation.variables?.id === lead.id ? (
                             <><Loader2 className="h-3 w-3 animate-spin" /> Syncing...</>
                           ) : (
                             <><Database className="h-3 w-3" /> Sync to Notion</>
                           )}
                         </button>

                         <button 
                           onClick={() => setCallingLeadId(callingLeadId === lead.id ? null : lead.id)}
                           className="text-xs px-3 py-1.5 rounded-md bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                         >
                           <Phone className="h-3 w-3" /> Call Prospect
                         </button>
                         <button 
                         onClick={() => setEmailingLeadId(emailingLeadId === lead.id ? null : lead.id)}
                         disabled={emailedLeads.has(lead.id)}
                         className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {emailedLeads.has(lead.id) ? "Email Sent" : "Approve & Send"}
                       </button>
                      </div>

                      {recordings[lead.id] && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-[10px] uppercase tracking-widest text-emerald-400 mb-2">Call Completed - Recording</p>
                          <audio controls className="w-full h-8" src={`http://localhost:8000${recordings[lead.id]}`}>
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}

                      <AnimatePresence>
                         {emailingLeadId === lead.id && !emailedLeads.has(lead.id) && (
                           <motion.div
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: "auto", opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="mt-4 p-3 bg-black/40 rounded-lg border border-white/5 overflow-hidden"
                           >
                             <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Recipient Email Address</label>
                             <div className="flex gap-2">
                               <input 
                                 type="email"
                                 placeholder="client@example.com"
                                 className="flex-1 bg-black/50 border border-white/10 rounded-md px-3 py-1.5 text-sm outline-none focus:border-primary/50"
                                 value={emailAddress}
                                 onChange={(e) => setEmailAddress(e.target.value)}
                               />
                               <button 
                                 onClick={() => emailMutation.mutate(lead)}
                                 disabled={!emailAddress || emailMutation.isPending}
                                 className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                               >
                                 {emailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                 Send Email
                               </button>
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>

                      <AnimatePresence>
                        {callingLeadId === lead.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 pt-3 border-t border-white/10 overflow-hidden"
                          >
                            <div className="flex gap-2 items-end">
                              <div className="flex-1">
                                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Target Phone Number</label>
                                <input 
                                  type="text" 
                                  value={phoneNumber}
                                  onChange={(e) => setPhoneNumber(e.target.value)}
                                  placeholder="+1 (555) 000-0000"
                                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                              </div>
                              <button 
                                onClick={() => callMutation.mutate(lead)}
                                disabled={callMutation.isPending || !phoneNumber}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2 h-[34px]"
                              >
                                {callMutation.isPending && callMutation.variables?.id === lead.id ? (
                                  <><Loader2 className="h-3 w-3 animate-spin" /> Dialing...</>
                                ) : (
                                  <><Phone className="h-3 w-3" /> Dial Now</>
                                )}
                              </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2">
                              Note: This requires a paid telephony provider (like Bland AI or Twilio). For this demo, check the backend server logs to see the mocked AI prompt.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
