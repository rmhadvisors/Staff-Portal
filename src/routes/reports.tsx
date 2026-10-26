import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Activity, CheckCircle2, Clock, Download, Search, Timer, Users, Wrench, XCircle, ArrowUpDown } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryBars, TopToolsChart, TrendChart } from "@/components/reports/charts";
import { ExecutionsTable } from "@/components/reports/executions-table";
import { ToolDetailSheet } from "@/components/reports/tool-detail-sheet";
import { categories, categoryLabel, tools, type ToolCategoryId } from "@/data/tools";
import { reportsApi, fmtDate, fmtDuration, fmtPct, type Filters, type ToolRow } from "@/lib/reports-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Staff Automation Portal" }] }),
  component: () => (
    <PortalShell>
      <ReportsContent />
    </PortalShell>
  ),
});

type Range = "today" | "7d" | "30d" | "month" | "custom";
const RANGES: { id: Range; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "month", label: "This Month" },
  { id: "custom", label: "Custom Range" },
];
const STATUSES = [
  ["success", "Success"],
  ["failed", "Failed"],
  ["running", "In progress"],
  ["launched", "Launched (outcome not reported)"],
  ["cancelled", "Cancelled"],
] as const;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
function rangeBounds(range: Range, cFrom: string, cTo: string): { from: string; to: string } {
  const now = new Date();
  if (range === "today") return { from: startOfDay(now).toISOString(), to: "" };
  if (range === "7d") return { from: new Date(now.getTime() - 7 * 864e5).toISOString(), to: "" };
  if (range === "30d") return { from: new Date(now.getTime() - 30 * 864e5).toISOString(), to: "" };
  if (range === "month") return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), to: "" };
  return {
    from: cFrom ? new Date(`${cFrom}T00:00:00`).toISOString() : "",
    to: cTo ? new Date(`${cTo}T23:59:59.999`).toISOString() : "",
  };
}

const selectCls = "h-9 rounded-lg border border-border bg-card px-2 text-sm text-foreground";

function ReportsContent() {
  const [range, setRange] = useState<Range>("30d");
  const [cFrom, setCFrom] = useState("");
  const [cTo, setCTo] = useState("");
  const [tool, setTool] = useState("");
  const [category, setCategory] = useState("");
  const [user, setUser] = useState("");
  const [status, setStatus] = useState("");
  const [detail, setDetail] = useState<{ id: string; name: string } | null>(null);

  const bounds = useMemo(() => rangeBounds(range, cFrom, cTo), [range, cFrom, cTo]);
  const filters: Filters = { ...bounds, tool, category, user, status };
  const key = JSON.stringify(filters);

  const overview = useQuery({ queryKey: ["overview", key], queryFn: () => reportsApi.overview(filters), placeholderData: keepPreviousData });
  const usage = useQuery({ queryKey: ["usage", key], queryFn: () => reportsApi.usage(filters), placeholderData: keepPreviousData });

  const o = overview.data;
  const kpis = [
    { label: "Total Tool Executions", value: o?.total, icon: Activity, tone: "text-primary" },
    { label: "Successful Executions", value: o?.success, icon: CheckCircle2, tone: "text-success" },
    { label: "Failed Executions", value: o?.failed, icon: XCircle, tone: "text-destructive" },
    { label: "Unique Active Users", value: o?.unique_users, icon: Users, tone: "text-accent" },
    { label: "Tools Used", value: o?.tools_used, icon: Wrench, tone: "text-accent" },
    { label: "Total Processing Time", value: o ? (o.total_duration_ms ? fmtDuration(o.total_duration_ms) : "Not reported") : undefined, icon: Timer, tone: "text-warning" },
  ];
  const rangeLabel =
    range === "custom"
      ? `${cFrom || "start"} → ${cTo || "today"}`
      : RANGES.find((r) => r.id === range)!.label;
  const liveTools = tools.filter((t) => (t.status ?? "live") === "live");

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tool usage across the firm · {rangeLabel}</p>
        </div>
        <a
          href={reportsApi.exportUrl(filters)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-secondary"
        >
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      <div className="surface-card flex flex-wrap items-center gap-2 rounded-xl p-3">
        <select aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value as Range)} className={selectCls}>
          {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        {range === "custom" && (
          <>
            <input type="date" aria-label="From date" value={cFrom} onChange={(e) => setCFrom(e.target.value)} className={selectCls} />
            <input type="date" aria-label="To date" value={cTo} onChange={(e) => setCTo(e.target.value)} className={selectCls} />
          </>
        )}
        <select aria-label="Tool" value={tool} onChange={(e) => setTool(e.target.value)} className={selectCls}>
          <option value="">All tools</option>
          {liveTools.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select aria-label="User" value={user} onChange={(e) => setUser(e.target.value)} className={selectCls}>
          <option value="">All users</option>
          {o?.users.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="">All statuses</option>
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {(overview.isError || usage.isError) && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Couldn&apos;t reach the tracking service. Usage data is unavailable right now.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="surface-card rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {k.label}
              <k.icon className={cn("h-4 w-4", k.tone)} />
            </div>
            {k.value === undefined ? (
              <Skeleton className="mt-3 h-7 w-16" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-foreground">{k.value}</p>
            )}
          </div>
        ))}
      </div>
      {o && o.open > 0 && (
        <p className="-mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {o.open} execution{o.open === 1 ? "" : "s"} recorded at launch only — the tool hasn&apos;t reported an outcome. Success, failure and duration are
          counted only for tools that report back.
        </p>
      )}

      <section aria-labelledby="usage-h" className="space-y-4">
        <h2 id="usage-h" className="text-lg font-semibold text-foreground">Tool Usage Analytics</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title={`Executions over time (${usage.data?.series.granularity === "week" ? "weekly" : "daily"})`} className="lg:col-span-2">
            {usage.data ? <TrendChart series={usage.data.series} /> : <Skeleton className="h-64 w-full" />}
          </Card>
          <Card title="By category">
            {usage.data ? <CategoryBars data={usage.data.byCategory} /> : <Skeleton className="h-40 w-full" />}
          </Card>
        </div>
        <Card title="Most used tools">
          {usage.data ? (
            <TopToolsChart data={usage.data.byTool.slice(0, 8).map((t) => ({ name: t.tool_name, total: t.total }))} />
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
        </Card>
      </section>

      <Card title="Usage by tool">
        <ToolTable rows={usage.data?.byTool} loading={usage.isLoading} onOpen={(id, name) => setDetail({ id, name })} filtered={!!(tool || category || user || status)} />
      </Card>

      <Card title="Execution history">
        <ExecutionsTable filters={filters} />
      </Card>

      <ToolDetailSheet toolId={detail?.id ?? null} toolName={detail?.name ?? ""} filters={filters} onClose={() => setDetail(null)} />
    </div>
  );
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("surface-card rounded-xl p-4 sm:p-5", className)}>
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

type SortKey = "tool_name" | "tool_category" | "total" | "success" | "failed" | "unique_users" | "last_used" | "avg_duration_ms" | "success_rate";
const COLS: [SortKey, string][] = [
  ["tool_name", "Tool"], ["tool_category", "Category"], ["total", "Total Runs"], ["success", "Successful"], ["failed", "Failed"],
  ["unique_users", "Unique Users"], ["last_used", "Last Used"], ["avg_duration_ms", "Avg. Duration"], ["success_rate", "Success Rate"],
];
const PAGE = 10;

function ToolTable({ rows, loading, onOpen, filtered }: {
  rows: ToolRow[] | undefined;
  loading: boolean;
  onOpen: (id: string, name: string) => void;
  filtered: boolean;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "total", dir: -1 });
  const [page, setPage] = useState(1);

  // One row per live tool; configured tools with no recorded runs show 0 (hidden when filtering by user/status etc.).
  const data = useMemo(() => {
    if (!rows) return [];
    const seen = new Set(rows.map((r) => r.tool_id));
    const unused = filtered
      ? []
      : tools
          .filter((t) => (t.status ?? "live") === "live" && !seen.has(t.id))
          .map((t): ToolRow => ({ tool_id: t.id, tool_name: t.name, tool_category: t.category, total: 0, success: 0, failed: 0, open: 0, cancelled: 0, unique_users: 0, last_used: null, avg_duration_ms: null, total_duration_ms: 0, success_rate: null }));
    const s = search.trim().toLowerCase();
    return [...rows, ...unused]
      .filter((r) => !s || r.tool_name.toLowerCase().includes(s) || categoryLabel(r.tool_category as ToolCategoryId).toLowerCase().includes(s))
      .sort((a, b) => {
        const x = a[sort.key], y = b[sort.key];
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;
        return (x > y ? 1 : x < y ? -1 : 0) * sort.dir;
      });
  }, [rows, search, sort, filtered]);

  const pages = Math.max(1, Math.ceil(data.length / PAGE));
  const view = data.slice((page - 1) * PAGE, page * PAGE);

  return (
    <div>
      <div className="relative mb-3 max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search tools…"
          aria-label="Search tools"
          className="h-9 w-full rounded-lg border border-border bg-card pl-8 pr-2 text-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              {COLS.map(([k, label]) => (
                <th key={k} className="whitespace-nowrap px-3 py-2 font-medium">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (-s.dir as 1 | -1) : -1 }))}>
                    {label} <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={9} className="p-2"><Skeleton className="h-6 w-full" /></td></tr>)}
            {view.map((r) => (
              <tr key={r.tool_id} onClick={() => onOpen(r.tool_id, r.tool_name)} className="cursor-pointer border-b border-border/60 hover:bg-secondary/50">
                <td className="whitespace-nowrap px-3 py-2 font-medium text-foreground">{r.tool_name}</td>
                <td className="whitespace-nowrap px-3 py-2">{categoryLabel(r.tool_category as ToolCategoryId)}</td>
                <td className="px-3 py-2">{r.total}</td>
                <td className="px-3 py-2 text-success">{r.success}</td>
                <td className="px-3 py-2 text-destructive">{r.failed}</td>
                <td className="px-3 py-2">{r.unique_users}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{r.last_used ? fmtDate(r.last_used) : "Never used"}</td>
                <td className="px-3 py-2">{fmtDuration(r.avg_duration_ms)}</td>
                <td className="px-3 py-2">{fmtPct(r.success_rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && view.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No tools match.</p>}
      </div>
      <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
        <span>{data.length} tools</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-md border border-border px-2 py-1 disabled:opacity-40">Prev</button>
          <span>Page {Math.min(page, pages)} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-md border border-border px-2 py-1 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
