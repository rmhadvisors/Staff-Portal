import { motion } from "motion/react";
import type { Tool } from "@/data/tools";
import { ToolCard } from "@/components/portal/tool-card";

export function ToolGrid({ items, recent }: { items: Tool[]; recent?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {items.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35 }}
        >
          <ToolCard tool={t} recent={recent} />
        </motion.div>
      ))}
    </div>
  );
}