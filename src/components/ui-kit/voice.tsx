import { motion } from "framer-motion";

export function VoiceOrb({ active = true, size = 240 }: { active?: boolean; size?: number }) {
  const bars = Array.from({ length: 36 });
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {active && (
        <>
          <span className="absolute inset-0 rounded-full gradient-primary opacity-40 blur-2xl animate-pulse-ring" />
          <span className="absolute inset-4 rounded-full bg-accent/30 blur-xl animate-pulse-ring" style={{ animationDelay: "0.6s" }} />
        </>
      )}
      <motion.div
        animate={active ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-full gradient-primary shadow-glow grid place-items-center"
        style={{ width: size * 0.7, height: size * 0.7 }}
      >
        <div className="absolute inset-3 rounded-full glass-strong grid place-items-center overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="flex items-end gap-[3px] h-12">
            {bars.map((_, i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-gradient-to-t from-primary to-accent"
                animate={active ? { height: [6, 14 + Math.random() * 28, 6] } : { height: 6 }}
                transition={{ duration: 0.6 + Math.random() * 0.6, repeat: Infinity, delay: i * 0.04 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Waveform({ active = true, bars = 64, height = 72 }: { active?: boolean; bars?: number; height?: number }) {
  return (
    <div className="flex items-center justify-center gap-[3px]" style={{ height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-primary via-accent to-cyan"
          animate={active ? { height: [8, 8 + Math.random() * (height - 12), 8] } : { height: 6 }}
          transition={{ duration: 0.5 + Math.random() * 0.7, repeat: Infinity, delay: i * 0.02 }}
        />
      ))}
    </div>
  );
}
