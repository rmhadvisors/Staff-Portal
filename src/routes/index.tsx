import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePortal } from "@/lib/portal/portal-store";
import { Logo } from "@/components/portal/logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Staff Automation Portal — Unified CA Workspace" },
      { name: "description", content: "Premium enterprise portal for GST, Income Tax, Audit & Compliance automation." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = usePortal();
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: user ? "/dashboard" : "/login" });
  }, [user, navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Logo size={56} floating />
    </div>
  );
}
