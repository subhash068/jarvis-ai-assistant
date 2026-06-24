import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Server, Database, Folder, BrainCircuit, CheckCircle2, Plus, Plug, X, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { mcpRegistry } from "@/lib/mcp-registry";
import { motion } from "framer-motion";

export const Route = createFileRoute("/mcp-plugins")({
  head: () => ({
    meta: [
      { title: "MCP Plugins · JARVIS AI" },
      { name: "description", content: "Manage Model Context Protocol servers connected to JARVIS." },
    ],
  }),
  component: MCPPluginsPage,
});

import { XCircle } from "lucide-react";

function PluginCard({ title, description, status, color }: any) {
  // Simple heuristic for icons
  let Icon = Plug;
  if (title.includes("filesystem")) Icon = Folder;
  else if (title.includes("memory")) Icon = Database;
  else if (title.includes("sequential")) Icon = BrainCircuit;

  const isConnected = status === "connected";

  return (
    <GlassCard className="flex flex-col h-full relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 -mr-10 -mt-10 rounded-full ${color}`} />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`h-12 w-12 rounded-xl grid place-items-center ${color} bg-opacity-10 backdrop-blur-md border border-white/10 shadow-glow`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        
        {isConnected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Active
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            <XCircle className="h-3.5 w-3.5" />
            Offline
          </div>
        )}
      </div>
      
      <div className="relative z-10 mt-auto">
        <h3 className="font-semibold text-lg mb-1 capitalize">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      
      <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground relative z-10">
        <span>Local connection</span>
        <span className="font-mono bg-black/20 px-2 py-0.5 rounded">stdio</span>
      </div>
    </GlassCard>
  );
}

function MCPPluginsPage() {
  const queryClient = useQueryClient();
  const [newPluginName, setNewPluginName] = useState("");
  const [newPluginPackage, setNewPluginPackage] = useState("");
  const [showDirectory, setShowDirectory] = useState(false);
  const [envVars, setEnvVars] = useState([{ key: "", value: "" }]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["mcp-plugins"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/mcp/");
      if (!res.ok) throw new Error("Failed to fetch plugins");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: { name: string, command: string, args: string[], env: Record<string, string> }) => {
      const res = await fetch("http://localhost:8000/mcp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add plugin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mcp-plugins"] });
      setNewPluginName("");
      setNewPluginPackage("");
      setEnvVars([{ key: "", value: "" }]);
    }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPluginName || !newPluginPackage) return;
    
    const envObj: Record<string, string> = {};
    envVars.forEach(ev => {
      if (ev.key.trim() && ev.value.trim()) {
        envObj[ev.key.trim()] = ev.value.trim();
      }
    });

    addMutation.mutate({
      name: newPluginName,
      command: "npx.cmd",
      args: ["-y", newPluginPackage],
      env: envObj
    });
  };

  const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-rose-500", "bg-cyan-500"];

  const filteredRegistry = mcpRegistry.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.pkg.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AppShell title="MCP Plugins" subtitle="Model Context Protocol servers augmenting JARVIS's capabilities.">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Top Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <GlassCard className="lg:col-span-12 p-8 relative overflow-hidden border-primary/20 bg-primary/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-20" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center shrink-0 shadow-[0_0_40px_rgba(var(--primary),0.4)] border border-white/10">
                <Server className="h-10 w-10 text-white" />
              </div>
              
              <div className="flex-1 w-full space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Multi-MCP Manager</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                    Connect JARVIS to external Model Context Protocol engines. 
                    Dynamically acquire new capabilities like API access, file system reading, or database connections.
                  </p>
                </div>

                <form onSubmit={handleAdd} className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-6 shadow-inner backdrop-blur-md">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground ml-1">Plugin ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g. brave-search" 
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium placeholder:text-white/20"
                        value={newPluginName}
                        onChange={(e) => setNewPluginName(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-6 space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground ml-1">NPM Package</label>
                      <input 
                        type="text" 
                        placeholder="e.g. @modelcontextprotocol/server-brave-search" 
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium placeholder:text-white/20"
                        value={newPluginPackage}
                        onChange={(e) => setNewPluginPackage(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <button disabled={addMutation.isPending} type="submit" className="w-full h-[46px] rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium flex items-center justify-center hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all disabled:opacity-50 group">
                        <Plus className="h-5 w-5 mr-1.5 group-hover:rotate-90 transition-transform duration-300" />
                        {addMutation.isPending ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground ml-1 mb-3 flex items-center gap-2">
                      Environment Variables <span className="text-white/30 font-normal lowercase">(optional keys)</span>
                    </p>
                    <div className="space-y-3">
                      {envVars.map((ev, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input 
                            type="text" 
                            placeholder="KEY" 
                            className="w-1/3 px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono transition-all placeholder:text-white/20"
                            value={ev.key}
                            onChange={(e) => {
                              const newVars = [...envVars];
                              newVars[idx].key = e.target.value;
                              setEnvVars(newVars);
                            }}
                          />
                          <input 
                            type="password" 
                            placeholder="VALUE" 
                            className="flex-1 px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono transition-all placeholder:text-white/20"
                            value={ev.value}
                            onChange={(e) => {
                              const newVars = [...envVars];
                              newVars[idx].value = e.target.value;
                              setEnvVars(newVars);
                            }}
                          />
                          {envVars.length > 1 && (
                            <button 
                              type="button"
                              onClick={() => {
                                const newVars = envVars.filter((_, i) => i !== idx);
                                setEnvVars(newVars);
                              }}
                              className="h-[38px] w-[38px] flex items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400/70 hover:text-rose-400 border border-rose-500/20 transition-all"
                              title="Remove variable"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          {idx === envVars.length - 1 && (
                            <button 
                              type="button"
                              onClick={() => setEnvVars([...envVars, { key: "", value: "" }])}
                              className="h-[38px] w-[38px] flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/10 transition-all hover:text-white"
                              title="Add variable"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </form>

                <div>
                  <button 
                    type="button"
                    onClick={() => setShowDirectory(!showDirectory)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-sm font-medium"
                  >
                    <Database className="h-4 w-4" />
                    {showDirectory ? "Close Plugin Registry" : "Open Plugin Registry"}
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <SectionHeader title="Active Integrations" />
          
          {isLoading ? (
            <div className="text-muted-foreground py-8">Loading plugins...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data?.plugins?.map((plugin: any, index: number) => (
                <PluginCard 
                  key={plugin.name}
                  title={plugin.name} 
                  description={`Running via ${plugin.command} ${plugin.args[1] || ''}`} 
                  status={plugin.status}
                  color={colors[index % colors.length]}
                />
              ))}
              {(!data?.plugins || data.plugins.length === 0) && (
                <div className="col-span-full text-muted-foreground py-8">No plugins active.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay Rendered at Root to escape GlassCard's transform/overflow */}
      {showDirectory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setShowDirectory(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl p-6 rounded-2xl border border-white/10 bg-[#0B0C10] shadow-2xl relative flex flex-col gap-5 max-h-[90vh]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Plugin Registry
                  </h3>
                  <p className="text-sm text-white/50 mt-1">Select an official plugin to auto-fill the form.</p>
                </div>
                <button 
                  onClick={() => setShowDirectory(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative mb-5 shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search verified MCP plugins..." 
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-white/30 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="grid gap-3 md:grid-cols-2 overflow-y-auto pr-2 pb-2 max-h-[60vh] custom-scrollbar">
                {filteredRegistry.length > 0 ? filteredRegistry.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => {
                      setNewPluginName(p.id);
                      setNewPluginPackage(p.pkg);
                      setShowDirectory(false);
                      setSearchQuery("");
                    }}
                    className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-all group hover:border-primary/30 hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10" />
                    
                    <div className="relative z-10 flex items-center justify-between mb-2">
                      <div className="font-semibold text-base text-white group-hover:text-primary transition-colors flex items-center gap-2">
                        <Plug className="h-4 w-4 text-primary" />
                        {p.id}
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {p.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-black/50 text-muted-foreground group-hover:text-white/80">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate mb-2.5 font-mono bg-black/30 px-2.5 py-1 rounded-md inline-block border border-white/5 relative z-10">{p.pkg}</div>
                    <div className="text-sm text-white/60 leading-relaxed relative z-10">{p.desc}</div>
                  </div>
                )) : (
                  <div className="col-span-2 flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Search className="h-10 w-10 mb-4 opacity-20 text-white" />
                    <p className="text-base text-white/50">No plugins found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
