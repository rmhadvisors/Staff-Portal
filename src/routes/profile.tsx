import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Mail, Briefcase, ShieldCheck, Star, History } from "lucide-react";
import { usePortal } from "@/lib/portal/portal-store";
import { PortalShell } from "@/components/portal/portal-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getTool } from "@/data/tools";
import { ToolGrid } from "@/components/portal/tool-grid";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Staff Automation Portal" }] }),
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <PortalShell>
      <ProfilePage />
    </PortalShell>
  );
}

function ProfilePage() {
  const { user, favorites, recent } = usePortal();
  const initials = (user?.name ?? "S").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const favTools = favorites.map(getTool).filter(Boolean) as NonNullable<ReturnType<typeof getTool>>[];
  const recentTools = recent.map(getTool).filter(Boolean) as NonNullable<ReturnType<typeof getTool>>[];

  return (
    <div className="mx-auto max-w-[1300px] space-y-8">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="gradient-border relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <Avatar className="h-20 w-20 border border-border">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{user?.name}</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {user?.email}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {user?.role}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> Verified staff</span>
            </div>
          </div>
        </div>
      </motion.div>

      {favTools.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground"><Star className="h-5 w-5 text-warning" /> Favourites</h2>
          <ToolGrid items={favTools} />
        </section>
      )}
      {recentTools.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground"><History className="h-5 w-5 text-accent" /> Recently used</h2>
          <ToolGrid items={recentTools} recent />
        </section>
      )}
    </div>
  );
}