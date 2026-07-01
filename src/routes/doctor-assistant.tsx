import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { VoiceOrb, Waveform } from "@/components/ui-kit/voice";
import { Mic, MicOff, Stethoscope, FileText, ClipboardList, History, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
export const Route = createFileRoute("/doctor-assistant")({
  head: () => ({
    meta: [
      { title: "Doctor Assistant · JARVIS AI" },
      { name: "description", content: "Record, transcribe, and summarize doctor-patient consultations." },
    ],
  }),
  component: DoctorAssistantPage,
});

const LANGUAGES = [
  { label: "English", code: "en-US" },
  { label: "Telugu", code: "te-IN" },
  { label: "Hindi", code: "hi-IN" },
];

function DoctorAssistantPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket((window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host + "/api/doctor_assistant/stream");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "status") {
          setStatusMessage(data.message);
        } else if (data.type === "transcription") {
          setTranscription(data.text);
        } else if (data.type === "summary") {
          setSummary(data.text);
          if (data.audio_file) {
            // We could provide a URL to download/play the file if we expose it statically on backend
            // For now just keep the filename
            console.log("Audio saved as:", data.audio_file);
          }
          // Refresh consultations list
          fetch("/api/doctor_assistant/consultations")
            .then(res => res.json())
            .then(data => setConsultations(data))
            .catch(e => console.error(e));
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const fetchConsultations = async () => {
    try {
      const res = await fetch("/api/doctor_assistant/consultations");
      if (res.ok) {
        const data = await res.json();
        setConsultations(data);
      }
    } catch (e) {
      console.error("Failed to fetch consultations", e);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleSelectConsultation = (cons: any) => {
    setSelectedConsultationId(cons.id);
    setTranscription(cons.transcription || "");
    setSummary(cons.summary || "");
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setIsRecording(true);
        setSelectedConsultationId(null);
        setTranscription("");
        setSummary("");
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "start_stream", language: language.code }));
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "end_stream" }));
        }
      };

      // Stream live chunks every 250ms
      mediaRecorder.start(250);
    } catch (e) {
      console.error("Microphone capture failed:", e);
      setStatusMessage("Microphone access denied or not available.");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <AppShell title="Doctor Assistant" subtitle="AI-powered medical scribe. Record consultations to generate automatic transcriptions and structured summaries.">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* History Sidebar */}
          <GlassCard className="lg:col-span-1 flex flex-col h-full" delay={0}>
            <SectionHeader title="History" icon={<History className="h-4 w-4 text-muted-foreground" />} />
            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-2">
              {consultations.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">No saved consultations yet.</div>
              ) : (
                consultations.map((cons) => (
                  <div 
                    key={cons.id}
                    onClick={() => handleSelectConsultation(cons)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConsultationId === cons.id ? 'bg-primary/20 border border-primary/50' : 'glass hover:bg-white/5'}`}
                  >
                    <div className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(cons.created_at).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {cons.summary ? cons.summary.substring(0, 80) + '...' : 'No summary available.'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Recording Interface */}
          <GlassCard className="lg:col-span-1 flex flex-col items-center text-center" delay={0.05}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
              <Stethoscope className="h-3.5 w-3.5" /> Language
            </div>
            <div className="flex gap-2 mb-6">
              {LANGUAGES.map((l) => (
                <button 
                  key={l.code} 
                  onClick={() => !isRecording && setLanguage(l)}
                  disabled={isRecording}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${language.code === l.code ? "gradient-primary text-primary-foreground" : "glass hover:bg-white/10"} ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <VoiceOrb active={isRecording} size={200} />
            <div className="mt-8 flex items-center gap-3">
              <button 
                onClick={startListening}
                disabled={isRecording}
                className={`h-12 w-12 rounded-full grid place-items-center transition-all ${isRecording ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'gradient-primary shadow-glow text-primary-foreground hover:opacity-90'}`}
                title="Start Recording"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button 
                onClick={stopListening}
                disabled={!isRecording}
                className={`h-12 w-12 rounded-full grid place-items-center transition-all ${isRecording ? 'glass hover:bg-white/10' : 'glass opacity-50'}`}
                title="Stop Recording"
              >
                <MicOff className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 w-full"><Waveform active={isRecording} /></div>
            {statusMessage && (
              <div className="mt-4 text-sm text-primary font-medium">
                {statusMessage}
              </div>
            )}
          </GlassCard>

          <div className="lg:col-span-2 flex flex-col gap-5 h-full">
              <GlassCard delay={0.1} className="flex-1 flex flex-col">
                <SectionHeader title="Transcription" icon={<FileText className="h-4 w-4 text-muted-foreground" />} />
                <div className="flex-1 min-h-[150px] overflow-y-auto p-4 rounded-xl glass text-sm leading-relaxed mt-2">
                  {transcription ? transcription : <span className="text-muted-foreground italic">Transcription will appear here after recording ends...</span>}
                </div>
              </GlassCard>

              <GlassCard delay={0.15} className="flex-1 flex flex-col">
                <SectionHeader title="Medical Summary" icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />} />
                <div className="flex-1 min-h-[250px] overflow-y-auto p-4 rounded-xl glass text-sm leading-relaxed mt-2 prose prose-invert max-w-none">
                  {summary ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {summary}
                      </ReactMarkdown>
                  ) : (
                      <span className="text-muted-foreground italic">AI-generated summary will appear here after transcription is complete...</span>
                  )}
                </div>
              </GlassCard>
          </div>
        </div>
    </AppShell>
  );
}
