import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard, SectionHeader } from "@/components/ui-kit/cards";
import { Image as ImageIcon, Sparkles, Wand2, Download } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/image-generation")({
  head: () => ({
    meta: [
      { title: "Image Generation · JARVIS AI" },
      { name: "description", content: "Generate images using AI directly from your browser." },
    ],
  }),
  component: ImageGenerationPage,
});

import puter from "@heyputer/puter.js";

function ImageGenerationPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;



    setIsGenerating(true);
    setError(null);

    try {
      // Ensure the user is signed in to Puter to avoid 401 Unauthorized errors
      if (!puter.auth.isSignedIn()) {
        await puter.auth.signIn();
      }

      // puter.ai.txt2img returns an HTMLImageElement
      const imageElement = await puter.ai.txt2img(prompt);
      
      // We extract the src to use it in our own React img tag
      if (imageElement && imageElement.src) {
        setGeneratedImages(prev => [imageElement.src, ...prev]);
      } else {
        setError("Received an invalid response from the image generator.");
      }
    } catch (err: any) {
      console.error("Image generation failed:", err);
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell title="Image Generation" subtitle="Visualize your ideas with Puter AI.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 flex flex-col gap-5">
          <GlassCard>
            <SectionHeader title="Prompt" action={<Wand2 className="h-4 w-4 text-muted-foreground" />} />
            <form onSubmit={handleGenerate} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">What do you want to see?</label>
                <textarea
                  placeholder="A futuristic city at sunset, highly detailed, cyberpunk style..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary/50 transition-colors resize-none h-32"
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4" />
                    Generate Image
                  </>
                )}
              </button>
            </form>
          </GlassCard>

          <GlassCard>
            <SectionHeader title="Tips" action={<Sparkles className="h-4 w-4 text-emerald-400" />} />
            <ul className="text-xs text-muted-foreground space-y-2 mt-4">
              <li className="flex gap-2">
                <span className="text-primary">•</span> Be descriptive: Mention lighting, style, and camera angles.
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span> Add styles like "oil painting", "digital art", or "photorealistic".
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span> This uses Puter.js, no API keys required!
              </li>
            </ul>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard className="h-full min-h-[500px] flex flex-col">
            <SectionHeader title="Gallery" action={<ImageIcon className="h-4 w-4 text-muted-foreground" />} />
            
            <div className="flex-1 mt-4">
              {generatedImages.length === 0 && !isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 min-h-[300px]">
                  <ImageIcon className="h-12 w-12 mb-3" />
                  <p className="text-sm">No images generated yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isGenerating && (
                    <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                      <Sparkles className="h-8 w-8 text-primary animate-spin opacity-50" />
                    </div>
                  )}
                  {generatedImages.map((src, idx) => (
                    <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/50">
                      <img 
                        src={src} 
                        alt="Generated via Puter AI" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                        <a 
                          href={src} 
                          download={`jarvis-generation-${idx}.png`}
                          className="p-2 rounded-full glass hover:bg-white/20 transition-colors text-white"
                          title="Download Image"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
