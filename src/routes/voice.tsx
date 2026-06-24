import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { VoiceOrb, Waveform } from "@/components/ui-kit/voice";
import { Mic, MicOff, Volume2, Languages, Square, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "Voice · JARVIS AI" },
      { name: "description", content: "Real-time multilingual voice conversation with your AI assistant." },
    ],
  }),
  component: VoicePage,
});

// Polyfill for SpeechRecognition (with SSR safety check)
const SpeechRecognition = typeof window !== "undefined" ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;

const LANGUAGES = [
  { label: "English", code: "en-US" },
  { label: "Telugu", code: "te-IN" },
  { label: "Hindi", code: "hi-IN" },
];

function VoicePage() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const ws = new WebSocket((window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host + "/api/voice/stream");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "status") {
          setInterimText(data.message);
        } else if (data.type === "transcription") {
          setMessages((prev) => [...prev, { role: "user", text: data.text }]);
          setInterimText("");
        } else if (data.type === "speech_response") {
          setMessages((prev) => [...prev, { role: "ai", text: data.text }]);
          setInterimText("");
          
          if (data.audio && !isMuted) {
            const audioBytes = atob(data.audio);
            const arrayBuffer = new ArrayBuffer(audioBytes.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < audioBytes.length; i++) {
              uint8Array[i] = audioBytes.charCodeAt(i);
            }
            const blob = new Blob([arrayBuffer], { type: "audio/mp3" });
            const url = URL.createObjectURL(blob);
            
            if (audioRef.current) {
              audioRef.current.pause();
            }
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => setIsSpeaking(false);
            audio.play().catch(err => console.error("Audio playback failed", err));
          }
        }
      } catch (e) {
        console.error("Failed to parse Voice WebSocket message:", e);
      }
    };

    return () => {
      if (ws) ws.close();
    };
  }, [language]);

  const startListening = async () => {
    if (audioRef.current) audioRef.current.pause();
    setIsSpeaking(false);
    
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
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  const stopAll = () => {
    stopListening();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsSpeaking(false);
  };

  return (
    <AppShell title="Voice Interface" subtitle="Speak naturally. JARVIS listens, reasons, and responds in real time.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-1 flex flex-col items-center text-center" delay={0}>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <Languages className="h-3.5 w-3.5" /> Language
          </div>
          <div className="flex gap-2 mb-6">
            {LANGUAGES.map((l) => (
              <button 
                key={l.code} 
                onClick={() => setLanguage(l)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${language.code === l.code ? "gradient-primary text-primary-foreground" : "glass hover:bg-white/10"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <VoiceOrb active={isRecording || isSpeaking} size={260} />
          <div className="mt-8 flex items-center gap-3">
            <button 
              onClick={startListening}
              disabled={isRecording}
              className={`h-12 w-12 rounded-full grid place-items-center transition-all ${isRecording ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'gradient-primary shadow-glow text-primary-foreground'}`}
            >
              <Mic className="h-5 w-5" />
            </button>
            <button 
              onClick={stopListening}
              disabled={!isRecording}
              className={`h-12 w-12 rounded-full grid place-items-center transition-all ${isRecording ? 'glass hover:bg-white/10' : 'glass opacity-50'}`}
            >
              <MicOff className="h-5 w-5" />
            </button>
            <button 
              onClick={toggleMute}
              className={`h-12 w-12 rounded-full grid place-items-center transition-all ${isMuted ? 'bg-orange-500/20 text-orange-400' : 'glass hover:bg-white/10'}`}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button 
              onClick={stopAll}
              className="h-12 w-12 rounded-full glass hover:bg-white/10 grid place-items-center transition-all"
            >
              <Square className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6 w-full"><Waveform active={isRecording || isSpeaking} /></div>
        </GlassCard>

        <GlassCard className="lg:col-span-2" delay={0.05}>
          <SectionHeader title="Live conversation" action={<span className="text-xs text-muted-foreground">Session Active</span>} />
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
            {messages.length === 0 && !interimText && (
              <div className="text-center text-sm text-muted-foreground py-10">
                Click the microphone icon and start speaking...
              </div>
            )}
            
            {messages.map((t, i) => (
              <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${t.role === "user" ? "gradient-primary text-primary-foreground" : "glass"}`}>
                  {t.text}
                </div>
              </div>
            ))}
            
            {interimText && (
              <div className="flex justify-end">
                 <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm gradient-primary text-primary-foreground opacity-70 italic">
                  {interimText}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-5 glass rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1"><Waveform active={isRecording} height={36} bars={48} /></div>
            <span className="text-xs text-muted-foreground">
              {isRecording ? "Listening…" : isSpeaking ? "Speaking..." : "Idle"}
            </span>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
