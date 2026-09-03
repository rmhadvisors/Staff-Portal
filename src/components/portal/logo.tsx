import { motion } from "motion/react";

export function Logo({ size = 40, floating = false }: { size?: number; floating?: boolean }) {
  return (
    <motion.div
      className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60"
      style={{ width: size, height: size }}
      animate={floating ? { y: [0, -6, 0] } : undefined}
      transition={floating ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <div className="absolute inset-0 -z-10 rounded-lg bg-primary/15 blur-lg animate-pulse-glow" />
      <span className="relative text-xs font-bold text-white">RMH</span>
    </motion.div>
  );
}

export function LogoWord({ size = 40, floating = false }: { size?: number; floating?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Logo size={size} floating={floating} />
      <div className="leading-tight">
        <p className="text-sm font-extrabold tracking-tight text-foreground">
          RMH <span className="text-accent">Advisors</span>
        </p>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Pvt Ltd
        </p>
      </div>
    </div>
  );
}
