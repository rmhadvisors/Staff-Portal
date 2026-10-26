import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Series } from "@/lib/reports-api";
import { categoryAccent, categoryLabel, type ToolCategoryId } from "@/data/tools";

const GRID = "var(--border)";
const TICK = { fill: "var(--muted-foreground)", fontSize: 11 };
const TIP = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

/** Executions over time, split into success / failed / outcome-not-reported. */
export function TrendChart({ series, height = 260 }: { series: Series; height?: number }) {
  if (series.points.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={series.points}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="bucket" tick={TICK} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={TICK} tickLine={false} axisLine={false} width={28} />
        <Tooltip contentStyle={TIP} cursor={{ fill: "var(--muted)", opacity: 0.4 }} labelFormatter={(l) => (series.granularity === "week" ? `Week of ${l}` : l)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="success" name="Successful" stackId="a" fill="var(--success)" />
        <Bar dataKey="failed" name="Failed" stackId="a" fill="var(--destructive)" />
        <Bar dataKey="open" name="Outcome not reported" stackId="a" fill="var(--muted-foreground)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopToolsChart({ data }: { data: { name: string; total: number }[] }) {
  if (data.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 32)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={TICK} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={150} tick={TICK} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TIP} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
        <Bar dataKey="total" name="Executions" fill="var(--primary)" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Category split as labelled bars (more legible than a pie for 3+ categories). */
export function CategoryBars({ data }: { data: { tool_category: string; total: number }[] }) {
  if (data.length === 0) return <Empty />;
  const max = Math.max(...data.map((d) => d.total));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.tool_category} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 text-muted-foreground">{categoryLabel(d.tool_category as ToolCategoryId)}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full" style={{ width: `${(d.total / max) * 100}%`, background: categoryAccent(d.tool_category as ToolCategoryId) }} />
          </div>
          <span className="w-8 text-right font-semibold text-foreground">{d.total}</span>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return <p className="py-10 text-center text-sm text-muted-foreground">No executions recorded for these filters.</p>;
}
