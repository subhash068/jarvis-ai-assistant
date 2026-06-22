import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui-kit/cards";
import { Plus, Paperclip, Mic, Send, Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat · JARVIS AI" },
      { name: "description", content: "Multimodal AI chat workspace with memory, files and code." },
    ],
  }),
  component: ChatPage,
});

const defaultMessage = { id: 0, role: "ai", content: "Hello! I am JARVIS. How can I help you today?", created_at: "" };

function ChatPage() {
  const queryClient = useQueryClient();
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            setInput((prev) => (prev ? prev + " " : "") + event.results[i][0].transcript);
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch all threads for user 1
  const { data: threads = [], isLoading: isLoadingThreads } = useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/chat/threads/1");
      if (!res.ok) throw new Error("Failed to fetch threads");
      return res.json();
    },
  });

  // Select the first thread if activeThreadId is null and threads are loaded
  useEffect(() => {
    if (activeThreadId === null && threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads]);

  // Fetch messages for active thread
  const { data: threadMessages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", activeThreadId],
    queryFn: async () => {
      if (!activeThreadId) return [];
      const res = await fetch(`http://localhost:8000/chat/threads/${activeThreadId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: activeThreadId !== null,
  });

  // Combine default message with thread messages if thread is active but has no messages,
  // or if we are in a new thread state (activeThreadId is null).
  const messagesToShow = activeThreadId === null
    ? [defaultMessage]
    : threadMessages.length === 0
    ? [defaultMessage]
    : threadMessages;

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("http://localhost:8000/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 1,
          thread_id: activeThreadId,
          message: text,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onMutate: async (text) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["messages", activeThreadId] });
      const previousMessages = queryClient.getQueryData(["messages", activeThreadId]);

      if (activeThreadId) {
        queryClient.setQueryData(
          ["messages", activeThreadId],
          (old: any = []) => [
            ...old,
            { id: Date.now(), role: "user", content: text, created_at: new Date().toISOString() },
          ]
        );
      }
      return { previousMessages };
    },
    onError: (err, text, context) => {
      if (activeThreadId && context?.previousMessages) {
        queryClient.setQueryData(["messages", activeThreadId], context.previousMessages);
      }
    },
    onSuccess: (data) => {
      // If a new thread was created, update active thread and refetch threads
      if (!activeThreadId && data.thread_id) {
        setActiveThreadId(data.thread_id);
      }
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({ queryKey: ["messages", data.thread_id] });
    },
  });

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(input);
    setInput("");
    setAttachments([]); // Clear attachments after sending
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter threads
  const filteredThreads = threads.filter((t: any) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell title="Chat Workspace" subtitle="Conversations with memory across every device.">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <GlassCard className="p-3">
          <button
            onClick={() => setActiveThreadId(null)}
            className="w-full mb-3 px-3 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 shadow-glow"
          >
            <Plus className="h-4 w-4" /> New conversation
          </button>
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search threads"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent glass rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {isLoadingThreads ? (
            <div className="text-center text-xs text-muted-foreground py-4">Loading threads...</div>
          ) : (
            <ul className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
              {filteredThreads.map((t: any) => (
                <li
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    activeThreadId === t.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
                  }`}
                >
                  <div className="text-sm truncate font-medium">{t.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </li>
              ))}
              {filteredThreads.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-4">No threads found</div>
              )}
            </ul>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col min-h-[640px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 p-4">
            {isLoadingMessages && activeThreadId !== null ? (
              <div className="py-8 text-center text-muted-foreground">Loading conversation...</div>
            ) : (
              messagesToShow.map((m: any) => (
                <div key={m.id || m.created_at} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      m.role === "user" ? "gradient-primary text-primary-foreground" : "glass"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="max-w-[78%] rounded-2xl px-4 py-3 text-sm glass animate-pulse">
                  JARVIS is thinking...
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 glass rounded-2xl p-2 flex flex-col gap-2">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-2 pt-2">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-sidebar-accent/50 text-xs px-2.5 py-1.5 rounded-md">
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                    <button onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-foreground ml-1">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} multiple />
              <button 
                className="h-10 w-10 shrink-0 grid place-items-center rounded-xl hover:bg-sidebar-accent transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </button>
            <textarea
              rows={1}
              placeholder="Ask JARVIS anything…"
              className="flex-1 bg-transparent outline-none resize-none px-2 py-2 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendMessageMutation.isPending}
            />
            <button 
              className={`h-10 w-10 shrink-0 grid place-items-center rounded-xl transition-colors ${
                isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-sidebar-accent"
              }`}
              onClick={toggleRecording}
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              className="h-10 w-10 shrink-0 grid place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow disabled:opacity-50 transition-opacity"
              onClick={handleSend}
              disabled={sendMessageMutation.isPending || (!input.trim() && attachments.length === 0)}
            >
              <Send className="h-4 w-4" />
            </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

