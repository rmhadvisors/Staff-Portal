import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Wrench, Users, ListChecks, ShieldAlert, Receipt, FileText, Star, History, ChevronDown, LayoutGrid } from "lucide-react";
import { WelcomePanel } from "@/components/portal/welcome-panel";
import { StatCard } from "@/components/portal/stat-card";
import { AiInsights } from "@/components/portal/ai-insights";
import { ToolGrid } from "@/components/portal/tool-grid";
import { PortalShell } from "@/components/portal/portal-shell";
import { categories, tools, toolsByCategory, getTool, allToolsSection } from "@/data/tools";
import { usePortal } from "@/lib/portal/portal-store";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Staff Automation Portal" }] }),
  component: DashboardRoute,
});

const stats = [
  { label: "Total Tools", value: tools.length, icon: Wrench, accent: "#4F46E5", delta: 8, series: [30, 32, 31, 35, 38, 40, 42] },
  { label: "Active Clients", value: 142, icon: Users, accent: "#0E9DB5", delta: 12, series: [110, 118, 121, 126, 130, 137, 142] },
  { label: "Pending Tasks", value: 7, icon: ListChecks, accent: "#D97706", delta: -18, series: [14, 13, 11, 12, 9, 8, 7] },
  { label: "Compliance Alerts", value: 4, icon: ShieldAlert, accent: "#DC2626", delta: -25, series: [9, 8, 7, 6, 6, 5, 4] },
  { label: "GST Returns Due", value: 12, icon: Receipt, accent: "#0E9F6E", delta: 5, series: [8, 9, 10, 9, 11, 12, 12] },
  { label: "IT Returns Due", value: 9, icon: FileText, accent: "#7C3AED", delta: 3, series: [6, 7, 7, 8, 8, 9, 9] },
];

function DashboardRoute() {
  return (
    <PortalShell>
      <DashboardContent />
    </PortalShell>
  );
}

function DashboardContent() {
  const { favorites, recent } = usePortal();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, true])),
  );
  const favTools = favorites.map(getTool).filter(Boolean) as NonNullable<ReturnType<typeof getTool>>[];
  const recentTools = recent.map(getTool).filter(Boolean) as NonNullable<ReturnType<typeof getTool>>[];

  return (
    <div className="mx-auto max-w-[1500px] space-y-8">
      <WelcomePanel />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      <AiInsights />

      {favTools.length > 0 && (
        <Section icon={Star} title="Favourite Tools" accent="#F59E0B">
          <ToolGrid items={favTools} />
        </Section>
      )}

      {recentTools.length > 0 && (
        <Section icon={History} title="Recently Used" accent="#22D3EE">
          <ToolGrid items={recentTools} recent />
        </Section>
      )}

      <Section icon={LayoutGrid} title="All Tools" accent="#4F46E5">
        <ToolGrid items={allToolsSection()} />
      </Section>

      <div>
        <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground">Tool Hub</h2>
        <div className="space-y-4">
          {categories.map((c) => {
            const items = toolsByCategory(c.id);
            const isOpen = open[c.id];
            return (
              <div key={c.id} className="gradient-border overflow-hidden rounded-2xl">
                <button
                  onClick={() => setOpen((p) => ({ ...p, [c.id]: !p[c.id] }))}
                  className="flex w-full items-center justify-between px-5 py-4"
                >
                  <span className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.accent, boxShadow: `0 0 12px ${c.accent}` }} />
                    <span className="font-semibold text-foreground">{c.label}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{items.length}</span>
                  </span>
                  <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5">
                    <ToolGrid items={items} />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: typeof Star;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
        <Icon className="h-5 w-5" style={{ color: accent }} />
        {title}
      </h2>
      {children}
    </section>
  );
}