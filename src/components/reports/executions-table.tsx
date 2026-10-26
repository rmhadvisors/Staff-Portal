import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { reportsApi, fmtDate, fmtDuration, type Filters } from "@/lib/reports-api";
import { categoryLabel, type ToolCategoryId } from "@/data/tools";

const STATUS: Record<string, { label: string; cls: string }> = {
  success: { label: "Success", cls: "bg-success/15 text-success" },
  failed: { label: "Failed", cls: "bg-destructive/15 text-destructive" },
  running: { label: "In progress", cls: "bg-warning/15 text-warning" },
  launched: { label: "Launched", cls: "bg-muted-foreground/15 text-muted-foreground" },
  cancelled: { label: "Cancelled", cls: "bg-muted-foreground/15 text-muted-foreground" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.launched;
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", s.cls)}>{s.label}</span>;
}

export function ExecutionsTable({ filters }: { filters: Filters }) {
  const [page, setPage] = useState(1);
  const key = JSON.stringify(filters);
  const [seen, setSeen] = useState(key);
  if (seen !== key) {
    setSeen(key);
    setPage(1);
  }
  const q = useQuery({
    queryKey: ["executions", key, page],
    queryFn: () => reportsApi.executions(filters, page),
    placeholderData: keepPreviousData,
  });
  const pages = q.data ? Math.max(1, Math.ceil(q.data.total / q.data.limit)) : 1;

  if (q.isError) return <p className="py-8 text-center text-sm text-destructive">Couldn&apos;t load execution history.</p>;
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              {["When", "Tool", "User", "Category", "Action", "Status", "Duration", "Error", "Run ID"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={9} className="p-2"><Skeleton className="h-6 w-full" /></td></tr>
              ))}
            {q.data?.items.map((e) => (
              <tr key={e.id} className="border-b border-border/60">
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{fmtDate(e.started_at)}</td>
                <td className="whitespace-nowrap px-3 py-2 font-medium text-foreground">{e.tool_name}</td>
                <td className="whitespace-nowrap px-3 py-2">{e.user_id}</td>
                <td className="whitespace-nowrap px-3 py-2">{categoryLabel(e.tool_category as ToolCategoryId)}</td>
                <td className="px-3 py-2">{e.action ?? "—"}</td>
                <td className="px-3 py-2"><StatusBadge status={e.status} /></td>
                <td className="whitespace-nowrap px-3 py-2">{fmtDuration(e.duration_ms)}</td>
                <td className="px-3 py-2 text-destructive">{e.error_code ?? ""}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{e.id.slice(0, 8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {q.data?.items.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No executions recorded for these filters.</p>
        )}
      </div>
      <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
        <span>{q.data?.total ?? 0} records</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-md border border-border p-1 disabled:opacity-40" aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-md border border-border p-1 disabled:opacity-40" aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
