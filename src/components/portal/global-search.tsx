import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { tools, categories, categoryLabel, toolMatchesCategory } from "@/data/tools";
import { isSidecarTool, sidecarToolHref } from "@/data/sidecar-tools";
import { usePortal } from "@/lib/portal/portal-store";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pushRecent } = usePortal();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const grouped = useMemo(
    () => categories.map((c) => ({ c, items: tools.filter((t) => toolMatchesCategory(t, c.id)) })),
    [],
  );

  const go = (toolId: string) => {
    pushRecent(toolId);
    setOpen(false);
    const selected = tools.find((t) => t.id === toolId);
    if (selected?.url) {
      window.open(selected.url, "_blank", "noopener,noreferrer");
      return;
    }
    if (isSidecarTool(toolId)) {
      // Sidecar tools are served by a real reverse proxy (or, in dev for
      // SSR-alias tools, a different origin entirely) — a client-side SPA
      // transition never hits the network, so force a real browser navigation.
      window.location.assign(sidecarToolHref(toolId));
      return;
    }
    navigate({ to: "/tools/$toolId", params: { toolId } });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search any tool…</span>
        <kbd className="hidden rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tools by name or category…" />
        <CommandList>
          <CommandEmpty>No tools found.</CommandEmpty>
          {grouped.map(({ c, items }) => (
            <CommandGroup key={c.id} heading={categoryLabel(c.id)}>
              {items.map((t) => {
                const Icon = t.icon;
                return (
                  <CommandItem key={`${c.id}-${t.id}`} value={`${t.name} ${categoryLabel(c.id)}`} onSelect={() => go(t.id)}>
                    <Icon className="mr-2 h-4 w-4" style={{ color: c.accent }} />
                    <span>{t.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{categoryLabel(c.id).replace(" Tools", "")}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}