import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { User, Bell, Palette, ShieldCheck, KeyRound, History, Sun, Moon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/portal-shell";
import { usePortal } from "@/lib/portal/portal-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Staff Automation Portal" }] }),
  component: SettingsRoute,
});

const roles = [
  { name: "GST Tools", level: "Full access" },
  { name: "Income Tax", level: "Full access" },
  { name: "Audit", level: "Read only" },
  { name: "Legal Drafting", level: "Restricted" },
  { name: "AI Automation", level: "Full access" },
];

const logins = [
  { device: "MacBook Pro · Chrome", loc: "Pune, IN", time: "Now · current session" },
  { device: "iPhone 15 · Safari", loc: "Pune, IN", time: "Yesterday, 6:42 PM" },
  { device: "Windows · Edge", loc: "Mumbai, IN", time: "3 days ago" },
];

function SettingsRoute() {
  return (
    <PortalShell>
      <SettingsPage />
    </PortalShell>
  );
}

function SettingsPage() {
  const { user, theme, toggleTheme } = usePortal();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gradient">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, preferences and security.</p>
      </div>
      <Tabs defaultValue="profile">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-secondary/50 p-1">
          <Tab v="profile" icon={User}>Profile</Tab>
          <Tab v="notifications" icon={Bell}>Notifications</Tab>
          <Tab v="theme" icon={Palette}>Theme</Tab>
          <Tab v="roles" icon={ShieldCheck}>Permissions</Tab>
          <Tab v="security" icon={KeyRound}>Security</Tab>
          <Tab v="activity" icon={History}>Login activity</Tab>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" defaultValue={user?.name ?? ""} />
              <Field label="Email" defaultValue={user?.email ?? ""} />
              <Field label="Role" defaultValue={user?.role ?? ""} />
              <Field label="Department" defaultValue="Compliance" />
            </div>
            <Button className="mt-5">Save changes</Button>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            {[
              "GST deadline alerts",
              "Income tax reminders",
              "Notice & assessment updates",
              "Task assignment alerts",
              "Weekly summary email",
            ].map((n, i) => (
              <ToggleRow key={n} label={n} defaultOn={i < 3} />
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Appearance</p>
                <p className="text-xs text-muted-foreground">Switch between dark and light workspace.</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium"
              >
                {theme === "dark" ? <Moon className="h-4 w-4 text-accent" /> : <Sun className="h-4 w-4 text-warning" />}
                {theme === "dark" ? "Dark" : "Light"}
              </button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <div className="space-y-3">
              {roles.map((r) => (
                <div key={r.name} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <span className="text-sm font-medium text-foreground">{r.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      r.level === "Full access" && "bg-success/15 text-success",
                      r.level === "Read only" && "bg-warning/15 text-warning",
                      r.level === "Restricted" && "bg-destructive/15 text-destructive",
                    )}
                  >
                    {r.level}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current password" type="password" defaultValue="" />
              <div />
              <Field label="New password" type="password" defaultValue="" />
              <Field label="Confirm password" type="password" defaultValue="" />
            </div>
            <ToggleRow label="Two-factor authentication (2FA)" defaultOn />
            <Button className="mt-3">Update security</Button>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <div className="space-y-3">
              {logins.map((l) => (
                <div key={l.device} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.device}</p>
                    <p className="text-xs text-muted-foreground">{l.loc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{l.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Tab({ v, icon: Icon, children }: { v: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <TabsTrigger value={v} className="gap-2 data-[state=active]:bg-background">
      <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{children}</span>
    </TabsTrigger>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="gradient-border mt-4 rounded-2xl p-6">
      {children}
    </motion.div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} defaultValue={defaultValue} className="h-11" />
    </div>
  );
}

function ToggleRow({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <Switch defaultChecked={defaultOn} />
    </div>
  );
}