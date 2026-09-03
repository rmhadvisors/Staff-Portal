import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type CopilotState = "idle" | "thinking" | "scanning" | "happy";

/**
 * AURA — the RMH.BSA AI financial copilot character.
 * A premium, futuristic robot rendered entirely in SVG so it stays crisp,
 * themeable and lightweight. Use across login, loading and empty states.
 */
export function AiCopilot({
  size = 120,
  state = "idle",
  floating = true,
  className,
}: {
  size?: number;
  state?: CopilotState;
  floating?: boolean;
  className?: string;
}) {
  const blink = state !== "scanning";
  return (
    <motion.div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      animate={floating ? { y: [0, -8, 0] } : undefined}
      transition={floating ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {/* ambient glow */}
      <div className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-2xl animate-pulse-glow" />

      {/* orbiting data node */}
      {state !== "idle" && (
        <motion.span
          className="absolute h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_12px_var(--cyan)]"
          style={{ top: "10%", left: "50%" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}

      <svg viewBox="0 0 120 120" width={size} height={size} className="relative">
        <defs>
          <linearGradient id="auraBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#DCE6F2" />
          </linearGradient>
          <linearGradient id="auraScreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0B1B33" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="auraEar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--blue)" />
            <stop offset="100%" stopColor="var(--cyan)" />
          </linearGradient>
          <radialGradient id="auraEye" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="var(--cyan)" />
          </radialGradient>
        </defs>

        {/* ears */}
        <circle cx="24" cy="52" r="11" fill="url(#auraEar)" />
        <circle cx="96" cy="52" r="11" fill="url(#auraEar)" />
        <circle cx="24" cy="52" r="4.5" fill="#020617" opacity="0.5" />
        <circle cx="96" cy="52" r="4.5" fill="#020617" opacity="0.5" />

        {/* head */}
        <rect x="28" y="24" width="64" height="58" rx="20" fill="url(#auraBody)" stroke="#C7D4E6" strokeWidth="1.5" />
        {/* screen */}
        <rect x="35" y="31" width="50" height="44" rx="15" fill="url(#auraScreen)" />

        {/* eyes */}
        <motion.g
          animate={blink ? { scaleY: [1, 1, 0.1, 1] } : undefined}
          transition={blink ? { duration: 4, repeat: Infinity, times: [0, 0.92, 0.96, 1] } : undefined}
          style={{ transformOrigin: "60px 53px" }}
        >
          <rect x="47" y="44" width="8" height="18" rx="4" fill="url(#auraEye)" />
          <rect x="65" y="44" width="8" height="18" rx="4" fill="url(#auraEye)" />
        </motion.g>

        {/* scanning beam */}
        {state === "scanning" && (
          <motion.rect
            x="35"
            width="50"
            height="3"
            rx="1.5"
            fill="var(--cyan)"
            opacity="0.8"
            animate={{ y: [33, 70, 33] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* thinking dots */}
        {state === "thinking" &&
          [0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={50 + i * 10}
              cy="68"
              r="2.4"
              fill="var(--cyan)"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}

        {/* body */}
        <rect x="44" y="84" width="32" height="28" rx="14" fill="url(#auraBody)" stroke="#C7D4E6" strokeWidth="1.5" />
        <circle cx="38" cy="96" r="5" fill="url(#auraBody)" stroke="#C7D4E6" strokeWidth="1.2" />
        <circle cx="82" cy="96" r="5" fill="url(#auraBody)" stroke="#C7D4E6" strokeWidth="1.2" />
      </svg>
    </motion.div>
  );
}