import { TRACKING_API } from "@/lib/tracking";

export interface Filters {
  from: string; // ISO instant, "" = open
  to: string;
  tool: string;
  category: string;
  user: string;
  status: string;
}

export interface Totals {
  total: number;
  success: number;
  failed: number;
  open: number;
  cancelled: number;
  unique_users: number;
  last_used: string | null;
  avg_duration_ms: number | null;
  total_duration_ms: number;
}
export interface Overview extends Totals {
  tools_used: number;
  successRate: number | null;
  users: string[];
}
export interface ToolRow extends Totals {
  tool_id: string;
  tool_name: string;
  tool_category: string;
  success_rate: number | null;
}
export interface SeriesPoint {
  bucket: string;
  total: number;
  success: number;
  failed: number;
  open: number;
}
export interface Series {
  granularity: "day" | "week";
  points: SeriesPoint[];
}
export interface Usage {
  series: Series;
  byTool: ToolRow[];
  byCategory: { tool_category: string; total: number }[];
}
export interface Execution {
  id: string;
  tool_id: string;
  tool_name: string;
  tool_category: string;
  user_id: string;
  started_at: string;
  duration_ms: number | null;
  status: string;
  action: string | null;
  error_code: string | null;
}
export interface ExecutionPage {
  items: Execution[];
  total: number;
  page: number;
  limit: number;
}
export interface ToolDetail {
  summary: Totals & { success_rate: number | null };
  series: Series;
  recent: Execution[];
  lastSuccess: { started_at: string; user_id: string } | null;
  lastFailed: { started_at: string; user_id: string; error_code: string | null } | null;
}

export function query(f: Partial<Filters>, extra: Record<string, string | number> = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...f, ...extra })) if (v !== "" && v != null) p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${TRACKING_API}${path}`);
  if (!res.ok) throw new Error(`Reports API ${res.status}`);
  return res.json() as Promise<T>;
}

export const reportsApi = {
  overview: (f: Filters) => get<Overview>(`/api/reports/overview${query(f)}`),
  usage: (f: Filters) => get<Usage>(`/api/reports/tool-usage${query(f)}`),
  executions: (f: Partial<Filters>, page: number, limit = 15) =>
    get<ExecutionPage>(`/api/reports/executions${query(f, { page, limit })}`),
  tool: (toolId: string, f: Filters) => get<ToolDetail>(`/api/reports/tools/${encodeURIComponent(toolId)}${query(f)}`),
  exportUrl: (f: Filters) => `${TRACKING_API}/api/reports/export${query(f)}`,
};

export const fmtDuration = (ms: number | null | undefined) =>
  ms == null ? "—" : ms < 1000 ? `${Math.round(ms)} ms` : ms < 60_000 ? `${(ms / 1000).toFixed(1)} s` : `${(ms / 60_000).toFixed(1)} min`;
export const fmtPct = (r: number | null | undefined) => (r == null ? "—" : `${Math.round(r * 100)}%`);
export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
