import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendChart } from "@/components/reports/charts";
import { StatusBadge } from "@/components/reports/executions-table";
import { reportsApi, fmtDate, fmtDuration, fmtPct, type Filters } from "@/lib/reports-api";

export function ToolDetailSheet({ toolId, toolName, filters, onClose }: {
  toolId: string | null;
  toolName: string;
  filters: Filters;
  onClose: () => void;
}) {
  const q = useQuery({
    queryKey: ["tool-detail", toolId, JSON.stringify(filters)],
    queryFn: () => reportsApi.tool(toolId!, filters),
    enabled: !!toolId,
  });
  const s = q.data?.summary;
  return (
    <Sheet open={!!toolId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{toolName}</SheetTitle>
          <SheetDescription>Usage in the selected period.</SheetDescription>
        </SheetHeader>
        {q.isError && <p className="mt-6 text-sm text-destructive">Couldn&apos;t load this tool&apos;s report.</p>}
        {q.isLoading && <Skeleton className="mt-6 h-64 w-full" />}
        {q.data && s && (
          <div className="mt-6 space-y-6 text-sm">
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["Executions", s.total],
                ["Successful", s.success],
                ["Failed", s.failed],
                ["Outcome not reported", s.open],
                ["Unique users", s.unique_users],
                ["Avg. duration", fmtDuration(s.avg_duration_ms)],
                ["Success rate", fmtPct(s.success_rate)],
              ].map(([k, v]) => (
                <div key={k} className="surface-card rounded-lg p-3">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-lg font-semibold text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            <TrendChart series={q.data.series} height={180} />
            <div className="space-y-1 text-muted-foreground">
              <p>Last success: {q.data.lastSuccess ? `${fmtDate(q.data.lastSuccess.started_at)} · ${q.data.lastSuccess.user_id}` : "none recorded"}</p>
              <p>Last failure: {q.data.lastFailed ? `${fmtDate(q.data.lastFailed.started_at)} · ${q.data.lastFailed.error_code ?? "no code"}` : "none recorded"}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Recent executions</h3>
              <ul className="divide-y divide-border/60">
                {q.data.recent.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="text-muted-foreground">{fmtDate(e.started_at)} · {e.user_id}</span>
                    <StatusBadge status={e.status} />
                  </li>
                ))}
                {q.data.recent.length === 0 && <li className="py-4 text-muted-foreground">No executions recorded.</li>}
              </ul>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
