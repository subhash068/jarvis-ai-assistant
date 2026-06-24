import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Monitor, Terminal, Play, Loader2, Code2, History, Eraser, Mic, MicOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/pc-automation")({
  head: () => ({
    meta: [
      { title: "PC Control · JARVIS AI" },
      { name: "description", content: "Advanced headless PC Control via Playwright." },
    ],
  }),
  component: PCAutomationPage,
});

function PCAutomationPage() {
  const [instruction, setInstruction] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [logs, setLogs] = useState<{type: "input" | "output" | "error", text: string}[]>([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pc-automation-history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("pc-automation-history", JSON.stringify(history));
    }
  }, [history, isLoaded]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      
      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        setInstruction(transcript);
      };
      
      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setInstruction("");
      recognition.start();
      setIsListening(true);
    }
  };

  const runAutomation = useMutation({
    mutationFn: async (instr: string) => {
      const res = await fetch("http://localhost:8000/automation/pc/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: instr }),
      });
      if (!res.ok) throw new Error("Failed to execute PC Control");
      return res.json();
    },
    onSuccess: (data) => {
      setLogs((prev) => [...prev, { type: "output", text: data.message }]);
      if (data.code) {
        setGeneratedCode(data.code);
      }
    },
    onError: (err: any) => {
      setLogs((prev) => [...prev, { type: "error", text: err.message || "An error occurred." }]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || runAutomation.isPending) return;
    
    setLogs((prev) => [...prev, { type: "input", text: instruction }]);
    if (!history.includes(instruction)) {
      setHistory((prev) => [instruction, ...prev]);
    }
    runAutomation.mutate(instruction);
    setInstruction("");
  };

  return (
    <AppShell title="PC Control" subtitle="Ask JARVIS to interact with your desktop autonomously.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2 flex flex-col h-[800px]">
          <SectionHeader 
            title="Automation Prompt" 
            action={
              <div className="flex items-center gap-1">
                {logs.length > 0 && (
                  <button 
                    onClick={() => setLogs([])}
                    className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors"
                    title="Clear Logs"
                  >
                    <Eraser className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
                <div className="w-px h-4 bg-border mx-1" />
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </div>
            } 
          />
          
          <div className="flex-1 overflow-y-auto bg-background/50 border border-border rounded-xl p-4 mb-4 font-mono text-sm space-y-3">
            {logs.length === 0 && (
              <div className="text-muted-foreground text-center pt-8">
                No automation tasks run yet. Give JARVIS an instruction below!
              </div>
            )}
            {logs.map((log, i) => (
              <div key={i} className={`whitespace-pre-wrap ${
                log.type === "input" ? "text-primary" : 
                log.type === "error" ? "text-destructive" : "text-muted-foreground"
              }`}>
                {log.type === "input" ? `> ${log.text}` : log.text}
              </div>
            ))}
            {runAutomation.isPending && (
              <div className="text-muted-foreground flex items-center gap-2 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" /> Generating & executing Python script...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 sticky bottom-0 bg-background/80 backdrop-blur-md pt-3 pb-1 z-10 border-t border-border/20">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl border transition-colors ${
                isListening 
                  ? "bg-red-500/20 border-red-500/50 text-red-500 animate-pulse" 
                  : "bg-background/50 border-border hover:bg-background/80 text-muted-foreground"
              }`}
              title={isListening ? "Stop listening" : "Start voice control"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., Open notepad, type hello, and save it to the desktop."
              className="flex-1 bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors"
              disabled={runAutomation.isPending}
            />
            <button
              type="submit"
              disabled={runAutomation.isPending || !instruction.trim()}
              className="px-6 rounded-xl gradient-primary text-primary-foreground font-medium shadow-glow flex items-center gap-2 disabled:opacity-50 transition-opacity"
            >
              <Play className="h-4 w-4 fill-current" /> Run
            </button>
          </form>
        </GlassCard>

        <div className="flex flex-col gap-5 lg:h-[800px]">
          <GlassCard className="flex flex-col flex-1 min-h-0">
            <SectionHeader title="Task History" action={<History className="h-4 w-4 text-muted-foreground" />} />
            <div className="text-sm text-muted-foreground space-y-2 flex-1 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground/60 text-xs">No history yet</div>
              ) : (
                <ul className="space-y-2">
                  {history.map((item, idx) => (
                    <li 
                      key={idx} 
                      className="p-3 bg-background/50 border border-border rounded-lg cursor-pointer hover:bg-background/80 transition-colors line-clamp-2 text-xs"
                      onClick={() => setInstruction(item)}
                      title="Click to use this prompt again"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col flex-1 min-h-0">
            <SectionHeader title="How it works" action={<Terminal className="h-4 w-4 text-muted-foreground" />} />
            <div className="text-sm text-muted-foreground space-y-4 flex-1 overflow-y-auto pr-1">
              <p>
                When you submit a prompt, JARVIS uses the <strong className="text-foreground">PyAutoGUI API</strong> to generate a custom Python script that fulfills your request.
              </p>
              <p>
                The script executes mouse movements, keyboard presses, and other OS level commands.
              </p>
              <div className="bg-background/50 rounded-lg p-3 border border-border text-xs font-mono">
                <span className="text-primary">Note:</span> If PyAutoGUI is not installed on the system, it will return an error message reminding you to install it.
              </div>
            </div>
          </GlassCard>

          {generatedCode && (
            <GlassCard className="flex-1 flex flex-col min-h-0">
              <SectionHeader title="Generated Script" action={<Code2 className="h-4 w-4 text-muted-foreground" />} />
              <div className="flex-1 overflow-y-auto bg-background/50 border border-border rounded-xl p-4 font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                {generatedCode}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}

