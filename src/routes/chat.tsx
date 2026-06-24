import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui-kit/cards";
import { Plus, Paperclip, Mic, Send, Search, X, Trash2, Globe, FileText } from "lucide-react";
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
  const [isWebScrapingMode, setIsWebScrapingMode] = useState(false);
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
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 0);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch all threads for user 1
  const { data: threads = [], isLoading: isLoadingThreads } = useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const res = await fetch("/api/chat/threads/1");
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
      const res = await fetch(`/api/chat/threads/${activeThreadId}/messages`);
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
    mutationFn: async ({ text, webSearch }: { text: string; webSearch: boolean }) => {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 1,
          thread_id: activeThreadId,
          message: text,
          web_search: webSearch,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onMutate: async ({ text }) => {
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
    onError: (err, variables, context) => {
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

  const deleteThreadMutation = useMutation({
    mutationFn: async (threadId: number) => {
      const res = await fetch(`/api/chat/threads/${threadId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete thread");
      return res.json();
    },
    onSuccess: (_, threadId) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
      }
    },
  });

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || sendMessageMutation.isPending) return;
    
    let finalMessage = input;
    
    if (attachments.length > 0) {
      try {
        const fileContents = await Promise.all(
          attachments.map(async (file) => {
            // Check for binary types that we can't read as plain text
            if (file.type.startsWith("image/") || file.type.startsWith("video/") || file.type.startsWith("audio/")) {
              return `\n\n<attachment name="${file.name}">\n[Media file uploaded - parsing not fully supported yet]\n</attachment>`;
            }
            if (file.type === "application/pdf") {
              try {
                const pdfjsLib = await import('pdfjs-dist');
                const Worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?worker')).default;
                pdfjsLib.GlobalWorkerOptions.workerPort = new Worker();
                
                const arrayBuffer = await file.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                const pdf = await pdfjsLib.getDocument({ 
                  data: uint8Array,
                  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
                }).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const textContent = await page.getTextContent();
                  const pageText = textContent.items.map((item: any) => item.str).join(' ');
                  text += pageText + '\n';
                }
                
                if (text.length > 50000) {
                  text = text.substring(0, 50000) + "\n...[Content truncated due to size limit]";
                }
                return `\n\n<attachment name="${file.name}">\n${text}\n</attachment>`;
              } catch (err: any) {
                console.error("Error parsing PDF:", err);
                return `\n\n<attachment name="${file.name}">\n[Error extracting text from PDF: ${err?.message || err}]\n</attachment>`;
              }
            }
            
            try {
              let text = await file.text();
              // Strip null bytes to prevent database/JSON crashes
              text = text.replace(/\0/g, "");
              // Truncate to prevent token limit errors (approx 50k chars)
              if (text.length > 50000) {
                text = text.substring(0, 50000) + "\n...[Content truncated due to size limit]";
              }
              return `\n\n<attachment name="${file.name}">\n${text}\n</attachment>`;
            } catch (err) {
              return `\n\n<attachment name="${file.name}">\n[Error reading file contents]\n</attachment>`;
            }
          })
        );
        finalMessage += fileContents.join("");
      } catch (err) {
        console.error("Error reading file attachments:", err);
      }
    }
    
    sendMessageMutation.mutate({ text: finalMessage, webSearch: isWebScrapingMode });
    setInput("");
    setAttachments([]);
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
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
        <GlassCard className="p-3 sticky top-28 flex flex-col h-[calc(100vh-160px)]">
          <div className="shrink-0">
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
          </div>
          {isLoadingThreads ? (
            <div className="text-center text-xs text-muted-foreground py-4">Loading threads...</div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <ul className="space-y-1">
              {filteredThreads.map((t: any) => (
                <li
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    activeThreadId === t.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate font-medium">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(t.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThreadMutation.mutate(t.id);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-500/10"
                    title="Delete thread"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {filteredThreads.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-4">No threads found</div>
              )}
            </ul>
            </div>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col h-[calc(100vh-160px)] sticky top-28">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {isLoadingMessages && activeThreadId !== null ? (
                <div className="py-8 text-center text-muted-foreground">Loading conversation...</div>
              ) : (
                messagesToShow.map((m: any) => {
                  const isUser = m.role === "user";
                  return isUser ? (
                    <div key={m.id || m.created_at} className="flex justify-end items-start gap-4 w-full">
                      <div className="bg-muted/40 hover:bg-muted/50 text-foreground rounded-2xl px-4 py-2.5 max-w-[75%] text-sm border border-border/30 shadow-sm transition-colors flex flex-col gap-1.5">
                        {m.content.includes('<attachment') 
                          ? m.content.split(/(<attachment name=".*?">[\s\S]*?<\/attachment>)/g).map((part: string, i: number) => {
                              const match = part.match(/<attachment name="(.*?)">/);
                              if (match) {
                                return (
                                  <div key={i} className="flex items-center gap-3 bg-background/80 border border-border/60 px-3 py-2.5 rounded-xl min-w-[200px] max-w-xs shadow-sm my-1">
                                    <div className="h-10 w-10 shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                      <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <div className="text-sm font-medium text-foreground truncate">{match[1]}</div>
                                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">Document</div>
                                    </div>
                                  </div>
                                );
                              }
                              return part.trim() ? <div key={i} className="whitespace-pre-wrap leading-relaxed">{part.trim()}</div> : null;
                            })
                          : <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>}
                      </div>
                      {/* User Avatar */}
                      <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold select-none border border-border/50 bg-secondary text-secondary-foreground shadow-sm">
                        U
                      </div>
                    </div>
                  ) : (
                    <div key={m.id || m.created_at} className="flex gap-4 items-start w-full">
                      {/* Avatar */}
                      <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold select-none gradient-primary text-primary-foreground shadow-glow">
                        J
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-1 min-w-0 pt-0.5">
                        <div className="text-xs font-medium text-muted-foreground mb-1 select-none">
                          JARVIS
                        </div>
                        <Markdown content={m.content} />
                      </div>
                    </div>
                  );
                })
              )}
              {sendMessageMutation.isPending && (
                <div className="flex gap-4 items-start w-full">
                  <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold gradient-primary text-primary-foreground shadow-glow animate-pulse">
                    J
                  </div>
                  <div className="flex-1 space-y-1 min-w-0 pt-0.5">
                    <div className="text-xs font-medium text-muted-foreground mb-1 select-none">
                      JARVIS
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground animate-pulse">
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4">
                {attachments.map((file, i) => (
                  <div key={i} className="relative shrink-0 flex items-center gap-3 bg-[#2a2a2a] border border-white/5 px-2.5 py-1.5 rounded-2xl w-[180px] shadow-sm">
                    <div className="h-9 w-9 shrink-0 bg-white/10 rounded-xl flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white/90" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center pr-5">
                      <div className="text-xs font-bold text-white truncate">{file.name}</div>
                      <div className="text-[10px] text-white/50 mt-0.5">File</div>
                    </div>
                    <button 
                      onClick={() => removeAttachment(i)} 
                      className="absolute top-1.5 right-1.5 bg-white text-black rounded-full p-[3px] hover:bg-gray-200 transition-colors z-10"
                    >
                      <X className="h-3 w-3" strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="bg-[#212121] border border-white/5 rounded-[28px] p-2 flex items-center shadow-sm">
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} multiple />
              <div className="flex items-center gap-1 px-1">
                <button 
                  className="h-10 w-10 shrink-0 grid place-items-center rounded-full hover:bg-white/10 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach Files"
                >
                  <Paperclip className="h-4 w-4 text-white/70" />
                </button>
                <button 
                  className={`h-10 w-10 shrink-0 grid place-items-center rounded-full transition-colors ${
                    isWebScrapingMode ? "bg-primary/20 text-primary" : "hover:bg-white/10 text-white/70"
                  }`}
                  onClick={() => setIsWebScrapingMode(!isWebScrapingMode)}
                  title="Web Scraping Mode"
                >
                  <Globe className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-1 min-w-0 items-center gap-2 overflow-x-auto no-scrollbar pl-2 py-1">
                <textarea
                  rows={1}
                  placeholder={isWebScrapingMode ? "Search the web and scrape results..." : "Ask JARVIS anything…"}
                  className="flex-1 bg-transparent outline-none resize-none px-2 py-2 text-sm min-w-[150px] text-white"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sendMessageMutation.isPending}
                />
              </div>

              <div className="flex items-center gap-2 px-1">
                <button 
                  className={`h-10 w-10 shrink-0 grid place-items-center rounded-full transition-colors ${
                    isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-white/10 text-white/70"
                  }`}
                  onClick={toggleRecording}
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  className="h-10 w-10 shrink-0 grid place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow disabled:opacity-50 transition-opacity"
                  onClick={handleSend}
                  disabled={sendMessageMutation.isPending || (!input.trim() && attachments.length === 0)}
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

// Markdown parser components
function Markdown({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 leading-relaxed break-words text-foreground text-sm">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.split("\n");
          const firstLine = lines[0].replace("```", "").trim();
          const language = firstLine || "plaintext";
          const code = lines.slice(1, -1).join("\n");

          return <CodeBlock key={index} language={language} code={code} />;
        } else {
          return <MarkdownParagraphs key={index} text={part} />;
        }
      })}
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border/50 bg-[#1e1e2e]/90 shadow-md">
      <div className="flex items-center justify-between bg-[#11111b] px-4 py-1.5 text-xs text-muted-foreground font-mono select-none">
        <span>{language}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 hover:text-foreground transition-colors py-1 px-2 rounded hover:bg-white/5"
        >
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs text-[#cdd6f4] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MarkdownParagraphs({ text }: { text: string }) {
  if (!text.trim()) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ol" | "ul"; items: string[] } | null = null;

  const pushCurrentList = (key: number) => {
    if (currentList) {
      if (currentList.type === "ul") {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-6 space-y-1 my-2 animate-fadeIn">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed text-foreground/90">{renderInline(item)}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${key}`} className="list-decimal pl-6 space-y-1 my-2 animate-fadeIn">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed text-foreground/90">{renderInline(item)}</li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if next line is a Setext header underline (e.g. === or ---)
    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
    const isSetextH1 = nextLine.length >= 3 && /^=+$/.test(nextLine);
    const isSetextH2 = nextLine.length >= 3 && /^-+$/.test(nextLine);

    if (isSetextH1) {
      pushCurrentList(i);
      elements.push(
        <h1 key={i} className="text-xl font-bold tracking-tight mt-5 mb-2 border-b border-border/30 pb-1 text-foreground">
          {renderInline(line)}
        </h1>
      );
      i++; // Skip underline line
      continue;
    }

    if (isSetextH2) {
      pushCurrentList(i);
      elements.push(
        <h2 key={i} className="text-lg font-semibold tracking-tight mt-4 mb-2 text-foreground">
          {renderInline(line)}
        </h2>
      );
      i++; // Skip underline line
      continue;
    }

    // Check for standard ATX headers
    if (trimmed.startsWith("# ")) {
      pushCurrentList(i);
      elements.push(<h1 key={i} className="text-xl font-bold tracking-tight mt-5 mb-2 border-b border-border/30 pb-1 text-foreground">{renderInline(trimmed.substring(2))}</h1>);
    } else if (trimmed.startsWith("## ")) {
      pushCurrentList(i);
      elements.push(<h2 key={i} className="text-lg font-semibold tracking-tight mt-4 mb-2 text-foreground">{renderInline(trimmed.substring(3))}</h2>);
    } else if (trimmed.startsWith("### ")) {
      pushCurrentList(i);
      elements.push(<h3 key={i} className="text-base font-semibold mt-3 mb-2 text-foreground">{renderInline(trimmed.substring(4))}</h3>);
    } else if (trimmed.startsWith("#### ")) {
      pushCurrentList(i);
      elements.push(<h4 key={i} className="text-sm font-semibold mt-3 mb-2 text-foreground">{renderInline(trimmed.substring(5))}</h4>);
    } 
    // Check for standalone horizontal divider lines (e.g., ---, ===, ***)
    else if (trimmed.length >= 3 && (/^[-=*]+$/.test(trimmed))) {
      pushCurrentList(i);
      elements.push(<hr key={i} className="my-6 border-t border-border/20" />);
    } 
    // Check for bullet list item
    else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      if (!currentList || currentList.type !== "ul") {
        pushCurrentList(i);
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(trimmed.substring(2));
    } 
    // Check for ordered list item
    else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      if (match) {
        if (!currentList || currentList.type !== "ol") {
          pushCurrentList(i);
          currentList = { type: "ol", items: [] };
        }
        currentList.items.push(match[2]);
      }
    } 
    // Empty line
    else if (!trimmed) {
      pushCurrentList(i);
    } 
    // Regular paragraph
    else {
      if (currentList) {
        pushCurrentList(i);
      }
      elements.push(<p key={i} className="my-1.5 leading-relaxed text-foreground/90">{renderInline(line)}</p>);
    }
  }

  pushCurrentList(lines.length);

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|__.*?__|`.*?`|\*.*?\*|_.*?_)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="px-1.5 py-0.5 rounded bg-muted/60 font-mono text-xs text-primary font-medium">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}


