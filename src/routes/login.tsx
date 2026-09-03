import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { AnimatedBackground } from "@/components/portal/animated-background";
import { AiCopilot } from "@/components/portal/ai-copilot";
import { usePortal } from "@/lib/portal/portal-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const STAFF_EMAIL = "rmhasnani@gmail.com";
const STAFF_PASSWORD = "RAMzan!@#2025";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Staff Automation Portal" },
      { name: "description", content: "Secure sign in to the unified workspace for GST, Income Tax, Audit & Compliance." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user } = usePortal();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (email.trim().toLowerCase() !== STAFF_EMAIL || password !== STAFF_PASSWORD) {
      setError("Invalid email or password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(STAFF_EMAIL);
      navigate({ to: "/dashboard" });
    }, 700);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <AnimatedBackground dense />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="gradient-border rounded-2xl p-8 shadow-2xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <AiCopilot size={104} state={loading ? "scanning" : "happy"} />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-3 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {loading ? "Securing your session…" : "Hi, I'm AURA — your financial copilot"}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 text-2xl font-extrabold tracking-tight text-gradient sm:text-3xl"
            >
              Staff Automation Portal
            </motion.h1>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Unified Workspace for GST, Income Tax, Audit &amp; Compliance
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rmhasnani@gmail.com"
                  className="h-11 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox id="remember" /> Remember me
              </label>
              <button type="button" className="font-medium text-accent hover:underline">
                Forgot password?
              </button>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="glow-primary group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-accent font-semibold text-primary-foreground transition-all disabled:opacity-70"
            >
              {loading ? "Signing in…" : "Sign in to workspace"}
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Protected by enterprise SSO &amp; role-based access control.
          </p>
        </div>
      </motion.div>
    </div>
  );
}