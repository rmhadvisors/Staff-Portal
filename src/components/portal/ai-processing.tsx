import { motion } from "motion/react";
import { AiCopilot } from "@/components/portal/ai-copilot";
import { cn } from "@/lib/utils";

/**
 * Premium AI-driven loading state. Use anywhere the user waits — OCR
 * extraction, transaction processing, report generation, underwriting.
 */
export function AiProcessing({
  title = "AURA is analysing your data",
  steps = ["Reading documents", "Extracting transactions", "Detecting anomalies", "Compiling insights"],
  className,
}: {
  title?: string;
  steps?: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 py-10 text-center", className)}>
      <AiCopilot size={130} state="scanning" />
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">This usually takes a few seconds…</p>
      </div>

      {/* flowing data stream */}
      <div className="relative h-1.5 w-64 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-primary to-cyan"
          animate={{ x: ["-120%", "320%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <ul className="space-y-2 text-left">
        {steps.map((s, i) => (
          <motion.li
            key={s}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            {s}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}