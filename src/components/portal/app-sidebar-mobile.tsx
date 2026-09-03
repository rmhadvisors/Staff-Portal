import { Link, useRouterState } from "@tanstack/react-router";
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
  LogOut,
} from "lucide-react";
import { LogoWord } from "@/components/portal/logo";
import { usePortal } from "@/lib/portal/portal-store";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" as const, params: undefined },
  { label: "GST", icon: Receipt, to: "/category/$categoryId" as const, params: { categoryId: "gst" } },
  { label: "Accounts", icon: Landmark, to: "/category/$categoryId" as const, params: { categoryId: "accounts" } },
  { label: "Income Tax", icon: FileText, to: "/category/$categoryId" as const, params: { categoryId: "income-tax" } },
  { label: "TDS", icon: Percent, to: "/category/$categoryId" as const, params: { categoryId: "tds" } },
  { label: "Audit", icon: ClipboardCheck, to: "/category/$categoryId" as const, params: { categoryId: "audit" } },
  { label: "Legal", icon: Scale, to: "/category/$categoryId" as const, params: { categoryId: "legal" } },
  { label: "CRM", icon: Users, to: "/category/$categoryId" as const, params: { categoryId: "crm" } },
  { label: "Reports", icon: BarChart3, to: "/reports" as const, params: undefined },
  { label: "Settings", icon: Settings, to: "/settings" as const, params: undefined },
];

export function AppSidebarMobile({ onNavigate }: { onNavigate: () => void }) {
  const { logout } = usePortal();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-4">
        <LogoWord size={34} />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
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
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active ? "bg-primary/15 text-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active && "text-accent")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => {
            logout();
            onNavigate();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/15"
        >
          <LogOut className="h-[18px] w-[18px]" /> Sign out
        </button>
      </div>
    </div>
  );
}