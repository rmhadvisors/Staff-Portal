import test from "node:test";
import assert from "node:assert/strict";
import { openDb, createApp } from "./server.mjs";

let clock = new Date("2026-10-01T10:00:00.000Z");
const app = createApp({ db: openDb(":memory:"), allowedOrigins: ["https://staff.test"], now: () => clock });
await new Promise((r) => app.listen(0, r));
const base = `http://localhost:${app.address().port}`;
const call = async (method, path, body) => {
  const res = await fetch(base + path, { method, body: body && JSON.stringify(body) });
  const text = await res.text();
  return { status: res.status, body: res.headers.get("content-type")?.includes("json") ? JSON.parse(text) : text, headers: res.headers };
};
const start = (id, toolId = "gst-2a2b", userId = "a@x.in", category = "gst") =>
  call("POST", "/api/events", { id, toolId, toolName: toolId.toUpperCase(), toolCategory: category, userId });

test.after(() => app.close());

test("start creates one record; duplicate start does not", async () => {
  assert.equal((await start("exec-0001")).body.created, true);
  assert.equal((await start("exec-0001")).body.created, false);
  assert.equal((await call("GET", "/api/reports/overview")).body.total, 1);
});

test("finish updates same record, computes duration, is idempotent", async () => {
  clock = new Date("2026-10-01T10:00:05.500Z");
  assert.equal((await call("PATCH", "/api/events/exec-0001", { status: "success" })).body.updated, true);
  assert.equal((await call("PATCH", "/api/events/exec-0001", { status: "failed" })).body.updated, false);
  const { items, total } = (await call("GET", "/api/reports/executions")).body;
  assert.equal(total, 1);
  assert.equal(items[0].status, "success");
  assert.equal(items[0].duration_ms, 5500);
});

test("failed run keeps only a sanitised error code", async () => {
  await start("exec-0002", "acc-bankconv", "b@x.in", "accounts");
  assert.equal((await call("PATCH", "/api/events/exec-0002", { status: "failed", errorCode: "bad code!\n<script>" })).status, 400);
  await call("PATCH", "/api/events/exec-0002", { status: "failed", errorCode: "PARSE_ERROR" });
  const r = (await call("GET", "/api/reports/executions?status=failed")).body;
  assert.equal(r.total, 1);
  assert.equal(r.items[0].error_code, "PARSE_ERROR");
});

test("overview totals match records", async () => {
  await start("exec-0003", "gst-2a2b", "a@x.in"); // left open (launch only)
  const o = (await call("GET", "/api/reports/overview")).body;
  assert.deepEqual(
    [o.total, o.success, o.failed, o.open, o.unique_users, o.tools_used],
    [3, 1, 1, 1, 2, 2],
  );
  assert.equal(o.successRate, 0.5);
});

test("filters: tool, category, user, date range, bad status", async () => {
  assert.equal((await call("GET", "/api/reports/overview?tool=gst-2a2b")).body.total, 2);
  assert.equal((await call("GET", "/api/reports/overview?category=accounts")).body.total, 1);
  assert.equal((await call("GET", "/api/reports/overview?user=b@x.in")).body.total, 1);
  assert.equal((await call("GET", "/api/reports/overview?from=2026-11-01T00:00:00Z")).body.total, 0);
  assert.equal((await call("GET", "/api/reports/overview?status=bogus")).status, 400);
  assert.equal((await call("GET", "/api/reports/overview?tool=' OR 1=1 --")).body.total, 0);
});

test("pagination", async () => {
  const p1 = (await call("GET", "/api/reports/executions?limit=2&page=1")).body;
  const p2 = (await call("GET", "/api/reports/executions?limit=2&page=2")).body;
  assert.equal(p1.total, 3);
  assert.equal(p1.items.length, 2);
  assert.equal(p2.items.length, 1);
});

test("tool-usage and tool detail aggregate per tool", async () => {
  const u = (await call("GET", "/api/reports/tool-usage")).body;
  const t = u.byTool.find((r) => r.tool_id === "gst-2a2b");
  assert.deepEqual([t.total, t.success, t.open, t.success_rate], [2, 1, 1, 1]);
  assert.equal(u.series.points[0].total, 3);
  const d = (await call("GET", "/api/reports/tools/gst-2a2b")).body;
  assert.equal(d.summary.total, 2);
  assert.equal(d.lastSuccess.id, "exec-0001");
  assert.equal(d.lastFailed, null);
});

test("CSV export respects filters and neutralises formulas", async () => {
  await call("POST", "/api/events", { id: "exec-0004", toolId: "t", toolName: "=cmd()", toolCategory: "gst", userId: "c@x.in" });
  const r = await call("GET", "/api/reports/export?user=c@x.in");
  assert.match(r.headers.get("content-type"), /text\/csv/);
  assert.equal(r.body.trim().split("\r\n").length, 2);
  assert.match(r.body, /'=cmd\(\)/);
});

test("rejects bad input and unknown routes", async () => {
  assert.equal((await call("POST", "/api/events", { id: "x" })).status, 400);
  assert.equal((await call("PATCH", "/api/events/nope-nope-1", { status: "success" })).status, 404);
  assert.equal((await call("GET", "/api/nope")).status, 404);
});

test("CORS only for allowed origins", async () => {
  const ok = await fetch(`${base}/api/reports/overview`, { headers: { Origin: "https://staff.test" } });
  const bad = await fetch(`${base}/api/reports/overview`, { headers: { Origin: "https://evil.test" } });
  assert.equal(ok.headers.get("access-control-allow-origin"), "https://staff.test");
  assert.equal(bad.headers.get("access-control-allow-origin"), null);
});
