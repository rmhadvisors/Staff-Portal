// RMH tracking API: one SQLite table of tool executions + report queries.
// Zero dependencies (node:http + node:sqlite). Needs Node >= 22.13.
//   PORT=8200 DB_PATH=./data/tracking.db ALLOWED_ORIGINS=https://staff.rmhadvisors.in node tracking-api/server.mjs
import http from "node:http";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const STATUSES = ["launched", "running", "success", "failed", "cancelled"];
const OPEN = ["launched", "running"]; // not yet reported finished
const SAFE_CODE = /^[A-Za-z0-9_.:-]{1,64}$/;
const MAX_PAGE = 200;
// Day/week grouping happens in this zone (default IST); storage stays UTC.
const TZ_MIN = Number(process.env.TZ_OFFSET_MINUTES ?? 330);

export function openDb(path) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS tool_executions (
      id TEXT PRIMARY KEY,
      tool_id TEXT NOT NULL, tool_name TEXT NOT NULL, tool_category TEXT NOT NULL,
      user_id TEXT NOT NULL, user_name TEXT,
      started_at TEXT NOT NULL, completed_at TEXT, duration_ms INTEGER,
      status TEXT NOT NULL, action TEXT, error_code TEXT, correlation_id TEXT, source TEXT
    );
    CREATE INDEX IF NOT EXISTS ix_exec_started ON tool_executions(started_at);
    CREATE INDEX IF NOT EXISTS ix_exec_tool ON tool_executions(tool_id, started_at);
    CREATE INDEX IF NOT EXISTS ix_exec_user ON tool_executions(user_id, started_at);
    CREATE INDEX IF NOT EXISTS ix_exec_status ON tool_executions(status, started_at);
    CREATE INDEX IF NOT EXISTS ix_exec_cat ON tool_executions(tool_category, started_at);
  `);
  return db;
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const str = (v, max, required = false) => {
  if (v == null || v === "") {
    if (required) throw new HttpError(400, "missing field");
    return null;
  }
  if (typeof v !== "string") throw new HttpError(400, "invalid field");
  return v.slice(0, max);
};
const isoDate = (v) => {
  if (v == null || v === "") return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, "invalid date");
  return d.toISOString();
};

/** Shared WHERE builder: every filter is a bound parameter. */
function where(q) {
  const c = [];
  const p = [];
  const from = isoDate(q.get("from"));
  const to = isoDate(q.get("to"));
  if (from) {
    c.push("started_at >= ?");
    p.push(from);
  }
  if (to) {
    c.push("started_at <= ?");
    p.push(to);
  }
  for (const [param, col] of [
    ["tool", "tool_id"],
    ["category", "tool_category"],
    ["user", "user_id"],
  ]) {
    const v = q.get(param);
    if (v) {
      c.push(`${col} = ?`);
      p.push(v.slice(0, 200));
    }
  }
  const status = q.get("status");
  if (status) {
    if (!STATUSES.includes(status)) throw new HttpError(400, "invalid status");
    c.push("status = ?");
    p.push(status);
  }
  return { sql: c.length ? `WHERE ${c.join(" AND ")}` : "", p };
}

const AGG = `
  COUNT(*) AS total,
  SUM(status = 'success') AS success,
  SUM(status = 'failed') AS failed,
  SUM(status IN ('launched','running')) AS open,
  SUM(status = 'cancelled') AS cancelled,
  COUNT(DISTINCT user_id) AS unique_users,
  MAX(started_at) AS last_used,
  AVG(duration_ms) AS avg_duration_ms,
  COALESCE(SUM(duration_ms), 0) AS total_duration_ms`;

const num = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v]));
const rows = (db, sql, p = []) => db.prepare(sql).all(...p).map(num);
const one = (db, sql, p = []) => rows(db, sql, p)[0];
const rate = (r) => (r.success + r.failed ? r.success / (r.success + r.failed) : null);
// SUM() over zero rows is NULL; report 0 instead.
const zeroed = (o) => ({ ...o, success: o.success ?? 0, failed: o.failed ?? 0, open: o.open ?? 0, cancelled: o.cancelled ?? 0 });

function series(db, q, w) {
  const from = q.get("from") ? new Date(q.get("from")) : null;
  const to = q.get("to") ? new Date(q.get("to")) : new Date();
  const weekly = from && (to - from) / 864e5 > 62;
  const local = `datetime(started_at, '${TZ_MIN} minutes')`;
  const bucket = weekly ? `date(${local}, 'weekday 0', '-6 days')` : `date(${local})`;
  const points = rows(
    db,
    `SELECT ${bucket} AS bucket, COUNT(*) AS total, SUM(status='success') AS success,
      SUM(status='failed') AS failed, SUM(status IN ('launched','running')) AS open
      FROM tool_executions ${w.sql} GROUP BY bucket ORDER BY bucket`,
    w.p,
  );
  return { granularity: weekly ? "week" : "day", points };
}

function insertEvent(db, body, now) {
  const id = str(body.id, 64, true);
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) throw new HttpError(400, "invalid id");
  // INSERT OR IGNORE: a retried/duplicated start event cannot create a second run.
  const r = db
    .prepare(
      `INSERT OR IGNORE INTO tool_executions
       (id, tool_id, tool_name, tool_category, user_id, user_name, started_at, status, action, correlation_id, source)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      id,
      str(body.toolId, 100, true),
      str(body.toolName, 200, true),
      str(body.toolCategory, 100, true),
      str(body.userId, 200, true),
      str(body.userName, 200),
      now().toISOString(),
      body.status === "running" ? "running" : "launched",
      str(body.action, 120) ?? "launch",
      str(body.correlationId, 100),
      str(body.source, 40) ?? "ui",
    );
  return { id, created: r.changes === 1 };
}

function finishEvent(db, id, body, now) {
  const status = body.status;
  if (!["success", "failed", "cancelled"].includes(status)) throw new HttpError(400, "invalid status");
  let code = null;
  if (body.errorCode != null) {
    if (typeof body.errorCode !== "string" || !SAFE_CODE.test(body.errorCode)) throw new HttpError(400, "invalid errorCode");
    code = body.errorCode;
  }
  const row = db.prepare("SELECT started_at, status FROM tool_executions WHERE id = ?").get(id);
  if (!row) throw new HttpError(404, "unknown execution");
  if (!OPEN.includes(row.status)) return { id, updated: false }; // already finished: idempotent
  const done = now();
  db.prepare(
    `UPDATE tool_executions SET status=?, completed_at=?, duration_ms=?, error_code=?
     WHERE id=? AND status IN ('launched','running')`,
  ).run(status, done.toISOString(), Math.max(0, done - new Date(row.started_at)), code, id);
  return { id, updated: true };
}

const csvCell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formulas
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const COLS = ["started_at", "tool_name", "tool_category", "user_id", "action", "status", "duration_ms", "error_code", "id"];

function route(db, req, url, body, now) {
  const q = url.searchParams;
  const path = url.pathname;
  const m = req.method;
  if (m === "POST" && path === "/api/events") return insertEvent(db, body, now);
  let mt = path.match(/^\/api\/events\/([A-Za-z0-9-]{8,64})$/);
  if (m === "PATCH" && mt) return finishEvent(db, mt[1], body, now);
  if (m !== "GET") throw new HttpError(404, "not found");
  const w = where(q);

  if (path === "/api/reports/overview") {
    const o = zeroed(one(db, `SELECT ${AGG}, COUNT(DISTINCT tool_id) AS tools_used FROM tool_executions ${w.sql}`, w.p));
    const users = rows(db, "SELECT DISTINCT user_id FROM tool_executions ORDER BY user_id").map((r) => r.user_id);
    return { ...o, successRate: rate(o), users };
  }
  if (path === "/api/reports/tool-usage") {
    const byTool = rows(
      db,
      `SELECT tool_id, MAX(tool_name) AS tool_name, MAX(tool_category) AS tool_category, ${AGG}
       FROM tool_executions ${w.sql} GROUP BY tool_id ORDER BY total DESC`,
      w.p,
    ).map((r) => ({ ...zeroed(r), success_rate: rate(zeroed(r)) }));
    const byCategory = rows(
      db,
      `SELECT tool_category, COUNT(*) AS total FROM tool_executions ${w.sql} GROUP BY tool_category ORDER BY total DESC`,
      w.p,
    );
    return { series: series(db, q, w), byTool, byCategory };
  }
  if (path === "/api/reports/executions") {
    const limit = Math.min(MAX_PAGE, Math.max(1, Number(q.get("limit")) || 25));
    const page = Math.max(1, Number(q.get("page")) || 1);
    const total = one(db, `SELECT COUNT(*) AS n FROM tool_executions ${w.sql}`, w.p).n;
    const items = rows(
      db,
      `SELECT id, tool_id, tool_name, tool_category, user_id, user_name, started_at, completed_at,
        duration_ms, status, action, error_code, correlation_id, source FROM tool_executions ${w.sql}
        ORDER BY started_at DESC, id LIMIT ? OFFSET ?`,
      [...w.p, limit, (page - 1) * limit],
    );
    return { items, total, page, limit };
  }
  mt = path.match(/^\/api\/reports\/tools\/([^/]+)$/);
  if (mt) {
    const q2 = new URLSearchParams(q);
    q2.set("tool", decodeURIComponent(mt[1]).slice(0, 100));
    const tw = where(q2);
    const summary = zeroed(one(db, `SELECT ${AGG} FROM tool_executions ${tw.sql}`, tw.p));
    const last = (st) =>
      one(
        db,
        `SELECT id, started_at, user_id, duration_ms, error_code FROM tool_executions
         ${tw.sql ? `${tw.sql} AND` : "WHERE"} status = ? ORDER BY started_at DESC LIMIT 1`,
        [...tw.p, st],
      ) ?? null;
    return {
      summary: { ...summary, success_rate: rate(summary) },
      series: series(db, q2, tw),
      recent: rows(
        db,
        `SELECT id, user_id, started_at, duration_ms, status, action, error_code FROM tool_executions
         ${tw.sql} ORDER BY started_at DESC LIMIT 10`,
        tw.p,
      ),
      lastSuccess: last("success"),
      lastFailed: last("failed"),
    };
  }
  if (path === "/api/reports/export") {
    const data = db.prepare(`SELECT ${COLS.join(",")} FROM tool_executions ${w.sql} ORDER BY started_at DESC LIMIT 50000`).all(...w.p);
    return { csv: [COLS.join(","), ...data.map((r) => COLS.map((c) => csvCell(r[c])).join(","))].join("\r\n") };
  }
  throw new HttpError(404, "not found");
}

export function createApp({ db, allowedOrigins = [], now = () => new Date() }) {
  return http.createServer((req, res) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") {
      res.writeHead(204).end();
      return;
    }
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > 8192) req.destroy();
    });
    req.on("end", () => {
      try {
        let body = {};
        if (raw) {
          try {
            body = JSON.parse(raw);
          } catch {
            throw new HttpError(400, "invalid json");
          }
        }
        if (body === null || typeof body !== "object") throw new HttpError(400, "invalid body");
        const out = route(db, req, new URL(req.url, "http://x"), body, now);
        if (out.csv !== undefined) {
          res
            .writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="tool-usage.csv"' })
            .end(out.csv);
        } else {
          res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(out));
        }
      } catch (e) {
        const status = e instanceof HttpError ? e.status : 500;
        if (status === 500) console.error(e);
        res
          .writeHead(status, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: status === 500 ? "server error" : e.message }));
      }
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 8200);
  const db = openDb(process.env.DB_PATH ?? "./tracking-api/data/tracking.db");
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:8080,http://localhost:5173").split(",").map((s) => s.trim());
  createApp({ db, allowedOrigins }).listen(port, () => console.log(`tracking-api on :${port}`));
}
