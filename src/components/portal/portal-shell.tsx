import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AppSidebar } from "@/components/portal/app-sidebar";
import { TopNav } from "@/components/portal/top-nav";
import { AnimatedBackground } from "@/components/portal/animated-background";
import { usePortal } from "@/lib/portal/portal-store";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AppSidebarMobile } from "@/components/portal/app-sidebar-mobile";
import { AiProcessing } from "@/components/portal/ai-processing";

export function PortalShell({ children }: { children: ReactNode }) {
  const { user, hydrated } = usePortal();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login" });
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <AiProcessing
          title="Preparing your workspace"
          steps={["Authenticating", "Loading tools", "Syncing client data"]}
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen">
      <AnimatedBackground />
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
          <AppSidebarMobile onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav onMenu={() => setMobileOpen(true)} />
        <main className="scrollbar-thin flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}