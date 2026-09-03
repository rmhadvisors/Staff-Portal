import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  accent: string;
  index?: number;
  delta?: number;
  series?: number[];
}

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      ref.current = Math.round(target * eased);
      setVal(ref.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function Sparkline({ data, accent, id }: { data: number[]; accent: string; id: string }) {
  const w = 120;
  const h = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => [i * step, h - ((d - min) / span) * (h - 6) - 3]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-10 w-full">
      <defs>
        <linearGradient id={`spark-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-fill-${id})`} />
      <motion.path
        d={line}
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      <motion.circle
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r="2.6"
        fill={accent}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      />
    </svg>
  );
}

export function StatCard({ label, value, suffix, icon: Icon, accent, index = 0, delta, series }: StatCardProps) {
  const count = useCountUp(value);
  const up = (delta ?? 0) >= 0;
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -6 }}
      onMouseMove={onMove}
      className="surface-card spotlight-card elev-hover group relative overflow-hidden rounded-xl p-4"
    >
      <div className="sheen" />
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-60"
        style={{ background: accent }}
      />
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-xl opacity-80"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110 group-hover:-rotate-6"
          style={{ background: `${accent}1f` }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
      </div>
      <div className="relative mt-3 flex items-end justify-between gap-2">
        <p className="text-3xl font-extrabold tracking-tight text-foreground">
          {count}
          {suffix}
        </p>
        {delta !== undefined && (
          <span
            className="mb-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
            style={{
              color: up ? "var(--success)" : "var(--risk)",
              background: up
                ? "color-mix(in oklab, var(--success) 14%, transparent)"
                : "color-mix(in oklab, var(--risk) 14%, transparent)",
            }}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {series && series.length > 1 && (
        <div className="relative mt-2 -mb-1">
          <Sparkline data={series} accent={accent} id={label.replace(/\s+/g, "")} />
        </div>
      )}
    </motion.div>
  );
}
