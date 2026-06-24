import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Camera, Monitor, Upload, ScanText, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/vision")({
  head: () => ({
    meta: [
      { title: "Vision · JARVIS AI" },
      { name: "description", content: "Webcam, screen and image analysis with OCR and object detection." },
    ],
  }),
  component: VisionPage,
});

function VisionPage() {
  const [activeTab, setActiveTab] = useState("Webcam analysis");
  const [liveDetections, setLiveDetections] = useState<any[]>([]);
  const [liveFrame, setLiveFrame] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);

  const { data: status } = useQuery({
    queryKey: ["vision", "status"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/vision/status");
      if (!res.ok) throw new Error("Failed to fetch status");
      return res.json();
    },
  });

  useEffect(() => {
    let ws: WebSocket;
    let timeout: NodeJS.Timeout;
    
    if (activeTab === "Webcam analysis" || activeTab === "Screen analysis") {
      const source = activeTab === "Screen analysis" ? "screen" : "webcam";
      
      // Delay connection to prevent webcam locking during React StrictMode double-renders
      timeout = setTimeout(() => {
        try {
          ws = new WebSocket(`ws://localhost:8000/vision/stream?source=${source}`);
        
          ws.onopen = () => setWsConnected(true);
          
          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (Array.isArray(data)) {
                setLiveDetections(data);
              } else {
                setLiveDetections(data.detections || []);
                if (data.frame) {
                  setLiveFrame(`data:image/jpeg;base64,${data.frame}`);
                }
              }
            } catch (e) {
              console.error("Failed to parse vision data");
            }
          };
          
          ws.onclose = () => setWsConnected(false);
        } catch (e) {
          console.error("Failed to connect to vision stream", e);
        }
      }, 500);
    } else {
      setWsConnected(false);
      setLiveFrame(null);
      setLiveDetections([]);
    }
    
    return () => {
      clearTimeout(timeout);
      if (ws) ws.close();
    };
  }, [activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (activeTab === "Image upload") {
        const res = await fetch("http://localhost:8000/vision/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        setLiveDetections(data.detections || []);
        if (data.frame) {
          setLiveFrame(`data:image/jpeg;base64,${data.frame}`);
        }
      } else if (activeTab === "OCR extraction") {
        const res = await fetch("http://localhost:8000/vision/ocr", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("OCR failed");
        const data = await res.json();
        setOcrText(data.text);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process image. Ensure backend engines are running.");
    } finally {
      setIsUploading(false);
      e.target.value = ''; // reset input
    }
  };

  return (
    <AppShell title="Vision Center" subtitle="See the world through JARVIS — webcam, screen, files.">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {[
          { icon: Camera, label: "Webcam analysis" },
          { icon: Monitor, label: "Screen analysis" },
          { icon: Upload, label: "Image upload" },
          { icon: ScanText, label: "OCR extraction" },
        ].map((c, i) => (
          <GlassCard 
            key={c.label} 
            delay={i * 0.05} 
            className={`text-center cursor-pointer transition-all ${activeTab === c.label ? 'ring-2 ring-primary/50' : ''}`}
            onClick={() => setActiveTab(c.label)}
          >
            <div className={`h-12 w-12 rounded-xl mx-auto grid place-items-center shadow-glow mb-3 ${activeTab === c.label ? 'gradient-primary' : 'glass'}`}>
              <c.icon className={`h-5 w-5 ${activeTab === c.label ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </div>
            <div className="font-medium">{c.label}</div>
            <button className={`mt-3 text-xs px-3 py-1.5 rounded-full ${activeTab === c.label ? 'gradient-primary text-primary-foreground' : 'glass'}`}>
              {activeTab === c.label ? 'Active' : 'Open'}
            </button>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2">
          <SectionHeader title={activeTab} action={<span className="text-[11px] text-muted-foreground">{status?.source || "Webcam"} · {status?.resolution || "1080p"}</span>} />
          <div className="aspect-video rounded-xl border border-border overflow-hidden relative grid-bg grid place-items-center">
            {activeTab === "Webcam analysis" || activeTab === "Screen analysis" || (activeTab === "Image upload" && liveFrame) ? (
              liveFrame ? (
                <img src={liveFrame} alt="Live feed" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-cyan/10" />
                  {activeTab === "Screen analysis" ? <Monitor className="h-16 w-16 text-primary/40 animate-pulse" /> : <Eye className="h-16 w-16 text-primary/40 animate-pulse" />}
                </>
              )
            ) : activeTab === "OCR extraction" && ocrText ? (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm p-6 overflow-y-auto font-mono text-sm">
                <div className="text-primary mb-4 font-bold">EXTRACTED TEXT:</div>
                <div className="whitespace-pre-wrap">{ocrText}</div>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground w-full max-w-sm">
                <div className="inline-flex h-16 w-16 rounded-full glass items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-sm font-medium">Upload Image</div>
                <p className="text-xs mt-2 mx-auto">Select an image file to process with JARVIS.</p>
                <div className="mt-6 relative">
                  <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                  <button disabled={isUploading} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow">
                    {isUploading ? "Processing..." : "Select File"}
                  </button>
                </div>
              </div>
            )}

            {(activeTab === "Webcam analysis" || activeTab === "Screen analysis") && (
              <div className="absolute top-4 left-4 px-2 py-1 rounded-md glass text-[11px] uppercase tracking-widest flex items-center gap-1.5 z-10">
                {wsConnected ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-500">Live</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground">Idle</span>
                  </>
                )}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col">
          <SectionHeader title={activeTab === "OCR extraction" ? "Extracted text" : "Detections"} />
          
          {activeTab === "OCR extraction" ? (
            <div className="flex-1 overflow-y-auto bg-background/50 border border-border rounded-xl p-4 font-mono text-xs text-muted-foreground whitespace-pre-wrap min-h-[250px]">
              {ocrText || "Upload an image containing text to run OCR extraction."}
            </div>
          ) : (
            <ul className="space-y-3 flex-1 overflow-y-auto pr-1">
              {liveDetections.map((d, index) => (
                <li key={index}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{d.label}</span>
                    <span className="text-xs text-muted-foreground">{(d.score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full gradient-primary" style={{ width: `${d.score * 100}%` }} />
                  </div>
                </li>
              ))}
              {liveDetections.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  {wsConnected ? "Waiting for objects to detect..." : "Start streaming or upload an image to detect objects."}
                </div>
              )}
            </ul>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
