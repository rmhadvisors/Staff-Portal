import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import type { Tool } from "@/data/tools";
import { categoryAccent } from "@/data/tools";
import { isSidecarTool, sidecarToolHref } from "@/data/sidecar-tools";
import { usePortal } from "@/lib/portal/portal-store";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  live: "bg-success/15 text-success",
  wip: "bg-warning/15 text-warning",
  soon: "bg-muted-foreground/15 text-muted-foreground",
};
const statusLabel: Record<string, string> = { live: "Live", wip: "In progress", soon: "Coming soon" };
const badgeStyles: Record<string, string> = {
  BETA: "bg-accent/15 text-accent",
  PRO: "bg-gradient-to-r from-primary to-accent text-white",
};

export function ToolCard({ tool, recent }: { tool: Tool; recent?: boolean }) {
  const { isFavorite, toggleFavorite, pushRecent } = usePortal();
  const Icon = tool.icon;
  const accent = categoryAccent(tool.category);
  const fav = isFavorite(tool.id);
  const className = "surface-card elev-hover relative flex h-full flex-col rounded-xl p-4";

  const content = (
    <>
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${accent}1f`, boxShadow: `0 0 22px -6px ${accent}` }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(tool.id);
          }}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-warning"
          aria-label="Toggle favourite"
        >
          <Star className={cn("h-4 w-4", fav && "fill-warning text-warning")} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <h3 className="text-sm font-semibold text-foreground">{tool.name}</h3>
        {tool.badge && (
          <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide", badgeStyles[tool.badge])}>
            {tool.badge}
          </span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{tool.description}</p>

      <div className="mt-auto flex items-center justify-end pt-3">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusStyles[tool.status ?? "live"])}>
          {recent ? "Recently used" : statusLabel[tool.status ?? "live"]}
        </span>
      </div>
    </>
  );

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative h-full"
    >
      {tool.url ? (
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => pushRecent(tool.id)}
          className={className}
        >
          {content}
        </a>
      ) : isSidecarTool(tool.id) ? (
        // Plain <a>, not the router's <Link>: this is a real reverse-proxied app
        // (or, in dev for SSR-alias tools, a different origin entirely) — it must
        // be a genuine browser navigation, not a client-side SPA transition.
        <a href={sidecarToolHref(tool.id)} onClick={() => pushRecent(tool.id)} className={className}>
          {content}
        </a>
      ) : (
        <Link to="/tools/$toolId" params={{ toolId: tool.id }} onClick={() => pushRecent(tool.id)} className={className}>
          {content}
        </Link>
      )}
    </motion.div>
  );
}