import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  FileText,
  Percent,
  ClipboardCheck,
  Scale,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { LogoWord, Logo } from "@/components/portal/logo";
import { usePortal } from "@/lib/portal/portal-store";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" as const, params: undefined },
  {
    label: "GST",
    icon: Receipt,
    to: "/category/$categoryId" as const,
    params: { categoryId: "gst" },
  },
  {
    label: "Accounts",
    icon: Landmark,
    to: "/category/$categoryId" as const,
    params: { categoryId: "accounts" },
  },
  {
    label: "Income Tax",
    icon: FileText,
    to: "/category/$categoryId" as const,
    params: { categoryId: "income-tax" },
  },
  {
    label: "TDS",
    icon: Percent,
    to: "/category/$categoryId" as const,
    params: { categoryId: "tds" },
  },
  {
    label: "Audit",
    icon: ClipboardCheck,
    to: "/category/$categoryId" as const,
    params: { categoryId: "audit" },
  },
  {
    label: "Legal",
    icon: Scale,
    to: "/category/$categoryId" as const,
    params: { categoryId: "legal" },
  },
  {
    label: "CRM",
    icon: Users,
    to: "/category/$categoryId" as const,
    params: { categoryId: "crm" },
  },
  { label: "Reports", icon: BarChart3, to: "/reports" as const, params: undefined },
  { label: "Settings", icon: Settings, to: "/settings" as const, params: undefined },
];

export function AppSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const { logout } = usePortal();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl md:flex"
    >
      <div className="flex h-16 items-center justify-between px-4">
        {collapsed ? <Logo size={34} /> : <LogoWord size={34} />}
      </div>
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {nav.map((item) => {
          const active = item.params?.categoryId
            ? pathname === `/category/${item.params.categoryId}`
            : pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              params={item.params as never}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "text-foreground"
                  : "text-sidebar-foreground hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-lg border border-primary/40 bg-linear-to-r from-primary/20 to-accent/10 glow-primary"
                />
              )}
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "relative z-10 h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110",
                  active && "text-primary",
                )}
              />
              {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-sidebar-border p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent"
        >
          <ChevronLeft
            className={cn("h-4.5 w-4.5 shrink-0 transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
