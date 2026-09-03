import { Link } from "@tanstack/react-router";
import { Bell, CalendarClock, Moon, Sun, Menu } from "lucide-react";
import { motion } from "motion/react";
import { GlobalSearch } from "@/components/portal/global-search";
import { usePortal } from "@/lib/portal/portal-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const notifications = [
  { t: "GSTR-3B due in 3 days", s: "12 clients pending", c: "#F59E0B" },
  { t: "Advance tax instalment", s: "Q1 — due 15 Jun", c: "#22D3EE" },
  { t: "Notice received", s: "ABC Pvt Ltd — Sec 143(2)", c: "#EF4444" },
];
const tasks = [
  { t: "Bank reco — Mehta & Co", s: "Due today" },
  { t: "TDS working — May", s: "Due tomorrow" },
  { t: "Audit report — Surya Ltd", s: "2 days left" },
];

export function TopNav({ onMenu }: { onMenu: () => void }) {
  const { theme, toggleTheme, user, logout } = usePortal();
  const initials = (user?.name ?? "Staff")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden max-w-md flex-1 sm:block">
        <GlobalSearch />
      </div>
      <div className="flex-1 sm:hidden" />

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="relative rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        <IconMenu icon={CalendarClock} count={tasks.length} title="Task alerts">
          {tasks.map((x) => (
            <DropdownMenuItem key={x.t} className="flex flex-col items-start gap-0.5 py-2">
              <span className="text-sm font-medium">{x.t}</span>
              <span className="text-xs text-muted-foreground">{x.s}</span>
            </DropdownMenuItem>
          ))}
        </IconMenu>

        <IconMenu icon={Bell} count={notifications.length} title="Notifications">
          {notifications.map((x) => (
            <DropdownMenuItem key={x.t} className="flex items-start gap-2 py-2">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: x.c }} />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{x.t}</span>
                <span className="text-xs text-muted-foreground">{x.s}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </IconMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 outline-none">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 rounded-full"
            >
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span>{user?.name ?? "Staff Member"}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user?.role ?? "Associate"}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function IconMenu({
  icon: Icon,
  count,
  title,
  children,
}: {
  icon: typeof Bell;
  count: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative rounded-lg p-2.5 text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground">
        <Icon className="h-4.5 w-4.5" />
        {count > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
            {count}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
