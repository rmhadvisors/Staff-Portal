import { motion } from "motion/react";
import { Sparkles, TrendingUp, ShieldAlert, Lightbulb } from "lucide-react";
import { AiCopilot } from "@/components/portal/ai-copilot";

const insights = [
  {
    icon: ShieldAlert,
    accent: "var(--risk)",
    title: "Possible duplicate transactions",
    body: "AURA flagged 3 near-identical debits in Surya Ltd's statement worth ₹2.4L.",
  },
  {
    icon: TrendingUp,
    accent: "var(--emerald)",
    title: "Cash flow trending up",
    body: "Mehta & Co inflows are up 18% QoQ — strong repayment capacity signal.",
  },
  {
    icon: Lightbulb,
    accent: "var(--amber)",
    title: "GSTR-3B reconciliation tip",
    body: "5 invoices are unmatched. Run the reconciliation tool to close the gap.",
  },
];

export function AiInsights() {
  return (
    <section className="gradient-border relative overflow-hidden rounded-2xl p-6">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-cyan/15 blur-3xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4 lg:w-64 lg:shrink-0">
          <AiCopilot size={88} state="thinking" />
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Sparkles className="h-4 w-4 text-cyan" /> AURA Insights
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Live observations from your client data.
            </p>
          </div>
        </div>
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          {insights.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="surface-card group relative overflow-hidden rounded-xl p-4"
              >
                <div className="sheen" />
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110 group-hover:-rotate-6"
                  style={{ background: `color-mix(in oklab, ${it.accent} 14%, transparent)` }}
                >
                  <Icon className="h-4 w-4" style={{ color: it.accent }} />
                </div>
                <p className="relative mt-2.5 text-sm font-semibold text-foreground">{it.title}</p>
                <p className="relative mt-1 text-xs leading-relaxed text-muted-foreground">{it.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}