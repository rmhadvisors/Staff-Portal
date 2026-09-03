import { motion } from "motion/react";
import { CalendarClock, FileWarning, Receipt, FileText, Activity } from "lucide-react";
import { usePortal } from "@/lib/portal/portal-store";

const items = [
  { icon: CalendarClock, label: "Pending tasks", value: "7 today", accent: "#2563EB" },
  { icon: FileWarning, label: "Notices", value: "2 new", accent: "#EF4444" },
  { icon: Receipt, label: "GST deadline", value: "GSTR-3B · 20 Jun", accent: "#22D3EE" },
  { icon: FileText, label: "Income tax", value: "Adv tax · 15 Jun", accent: "#10B981" },
];

const activity = [
  "Generated Bank Converter output for Mehta & Co",
  "Filed GSTR-1 reconciliation — Surya Ltd",
  "Ran AIS extraction for 3 clients",
];

export function WelcomePanel() {
  const { user } = usePortal();
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="gradient-border relative overflow-hidden rounded-2xl p-6 sm:p-8"
    >
      <div className="aurora" />
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-sm text-muted-foreground">{greet},</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gradient sm:text-3xl">
            Welcome back, {user?.name?.split(" ")[0] ?? "Staff"}
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Your unified workspace for GST, Income Tax, Audit &amp; Compliance. Here's what needs your attention today.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map((it, i) => {
              const Icon = it.icon;
              return (
                <motion.div
                  key={it.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  className="surface-card group relative overflow-hidden rounded-xl p-3"
                >
                  <div className="sheen" />
                  <div
                    className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                    style={{ background: `${it.accent}1f` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: it.accent }} />
                  </div>
                  <p className="relative mt-2 text-[11px] text-muted-foreground">{it.label}</p>
                  <p className="relative text-sm font-semibold text-foreground">{it.value}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div className="surface-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Activity className="h-4 w-4 text-accent" /> Recent activity
          </div>
          <ul className="mt-3 space-y-3">
            {activity.map((a, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.4 }}
                className="flex gap-3 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent animate-pulse-glow" style={{ animationDelay: `${i * 0.4}s` }} />
                {a}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}