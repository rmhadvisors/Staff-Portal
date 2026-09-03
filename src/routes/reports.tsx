import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { TrendingUp, FileText, Receipt, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/portal/stat-card";
import { PortalShell } from "@/components/portal/portal-shell";
import { categories, toolsByCategory } from "@/data/tools";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Analytics — Staff Automation Portal" }] }),
  component: ReportsRoute,
});

const kpis = [
  { label: "Filings This Month", value: 218, icon: FileText, accent: "#2563EB" },
  { label: "GST Returns Filed", value: 96, icon: Receipt, accent: "#22D3EE" },
  { label: "Compliance Score", value: 98, suffix: "%", icon: ShieldCheck, accent: "#10B981" },
  { label: "Productivity", value: 87, suffix: "%", icon: TrendingUp, accent: "#F59E0B" },
];

function ReportsRoute() {
  return (
    <PortalShell>
      <ReportsContent />
    </PortalShell>
  );
}

function ReportsContent() {
  const max = Math.max(...categories.map((c) => toolsByCategory(c.id).length));
  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gradient">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Firm-wide automation &amp; compliance overview.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <StatCard key={k.label} {...k} index={i} />
        ))}
      </div>
      <div className="gradient-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-foreground">Tools by category</h2>
        <div className="mt-5 space-y-3">
          {categories.map((c, i) => {
            const n = toolsByCategory(c.id).length;
            return (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-sm text-muted-foreground">{c.label}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(n / max) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.7 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${c.accent}, ${c.accent}88)` }}
                  />
                </div>
                <span className="w-6 text-right text-sm font-semibold text-foreground">{n}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}