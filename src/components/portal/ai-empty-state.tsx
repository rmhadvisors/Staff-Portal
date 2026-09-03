import { motion } from "motion/react";
import { AiCopilot } from "@/components/portal/ai-copilot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Contextual empty state with AURA guiding the user to the next action.
 */
export function AiEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("flex flex-col items-center justify-center gap-4 rounded-2xl py-12 text-center", className)}
    >
      <AiCopilot size={120} state="happy" />
      <div className="max-w-sm">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && (
        <Button onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}