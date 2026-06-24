import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  delay = 0,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn("glass rounded-2xl p-5", className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  accent = "primary",
  delay = 0,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: ReactNode;
  accent?: "primary" | "neon" | "cyan";
  delay?: number;
}) {
  const accentClass =
    accent === "neon" ? "from-accent to-primary" : accent === "cyan" ? "from-cyan to-primary" : "from-primary to-accent";
  return (
    <GlassCard delay={delay} className="relative overflow-hidden">
      <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${accentClass} opacity-20 blur-2xl`} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
          {delta && <div className="mt-1 text-xs text-emerald-400">{delta}</div>}
        </div>
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accentClass} grid place-items-center text-primary-foreground`}>
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}

export function SectionHeader({ title, action, icon }: { title: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}
