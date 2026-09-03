import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Star, Upload, Play, Sparkles } from "lucide-react";
import { getTool, categoryLabel, categoryAccent } from "@/data/tools";
import { isSidecarTool, sidecarToolHref } from "@/data/sidecar-tools";
import { usePortal } from "@/lib/portal/portal-store";
import { PortalShell } from "@/components/portal/portal-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools/$toolId")({
  component: ToolRoute,
});

function ToolRoute() {
  return (
    <PortalShell>
      <ToolPage />
    </PortalShell>
  );
}

function ToolPage() {
  const { toolId } = Route.useParams();
  const tool = getTool(toolId);
  const { isFavorite, toggleFavorite, pushRecent } = usePortal();

  useEffect(() => {
    if (tool) pushRecent(tool.id);
  }, [tool, pushRecent]);

  // Sidecar tools are served by a real reverse proxy at this exact URL (see
  // unified-preview.mjs) and should never reach this client route — ToolCard/
  // GlobalSearch force a real browser navigation for them. If we land here
  // anyway (e.g. a stale cached SPA shell), force a hard reload so the server
  // takes over instead of rendering the placeholder below.
  useEffect(() => {
    if (tool?.url) {
      window.location.replace(tool.url);
      return;
    }
    if (tool && isSidecarTool(tool.id)) {
      window.location.replace(sidecarToolHref(tool.id));
    }
  }, [tool]);

  if (!tool) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-muted-foreground">Tool not found.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-accent hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  if (isSidecarTool(tool.id)) {
    return null;
  }

  const Icon = tool.icon;
  const accent = categoryAccent(tool.category);
  const fav = isFavorite(tool.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/category/$categoryId"
        params={{ categoryId: tool.category }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {categoryLabel(tool.category)}
      </Link>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="gradient-border rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{ background: `${accent}1f`, boxShadow: `0 0 28px -6px ${accent}` }}
            >
              <Icon className="h-7 w-7" style={{ color: accent }} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{tool.name}</h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{tool.description}</p>
            </div>
          </div>
          <button
            onClick={() => toggleFavorite(tool.id)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-warning"
          >
            <Star className={cn("h-4 w-4", fav && "fill-warning text-warning")} />
            {fav ? "Favourited" : "Favourite"}
          </button>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="gradient-border rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Workspace</h2>
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40 px-6 py-14 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">Drop your files to begin</p>
            <p className="mt-1 text-xs text-muted-foreground">Supports XLSX, CSV, PDF and portal exports.</p>
            <button className="glow-primary mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground">
              <Play className="h-4 w-4" /> Run {tool.name}
            </button>
          </div>
        </div>
        <div className="gradient-border rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-accent" /> About this tool
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row k="Category" v={categoryLabel(tool.category)} />
            <Row k="Status" v={tool.status === "wip" ? "In progress" : tool.status === "soon" ? "Coming soon" : "Live"} />
            <Row k="Access" v="Role-based" />
            {tool.shortcut && <Row k="Shortcut" v={tool.shortcut} />}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-foreground">{v}</dd>
    </div>
  );
}