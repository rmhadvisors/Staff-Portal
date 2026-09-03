import http from "node:http";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { spawn } from "node:child_process";

const staffRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(staffRoot, "..");

const publicPort = Number(process.env.PORT || getArgValue("--port") || 8080);
const staffClientDir = path.join(staffRoot, "dist", "client");
const analyzerClientDir = path.join(repoRoot, "BankStatementAnalyzer", "frontend", "dist", "client");
const converterClientDir = path.join(repoRoot, "BankStatementconvertermain", "dist", "client");
const tbConverterClientDir = path.join(repoRoot, "TrialBalanceConverter", "dist", "client");
const analyzerServerAssetsDir = path.join(repoRoot, "BankStatementAnalyzer", "frontend", "dist", "server", "assets");
const analyzerServerPath = path.join(repoRoot, "BankStatementAnalyzer", "frontend", "dist", "server", "server.js");
const converterServerPath = path.join(repoRoot, "BankStatementconvertermain", "dist", "server", "server.js");
const tbConverterServerPath = path.join(repoRoot, "TrialBalanceConverter", "dist", "server", "server.js");
const gstRecoRoot = path.join(repoRoot, "Collection-Gst-Reconcillation");
const GST_RECO_PORT = 3000;
const itrRoot = path.join(repoRoot, "ITRBankStatementAnalyzer");
const ITR_PORT = 8765;
const acc2a2bRoot = path.join(repoRoot, "2A-2B convertion");
const ACC_2A2B_PORT = 8010;
const gstReconciliationRoot = path.join(repoRoot, "gst-reconciliation");
const GST_RECONCILIATION_PORT = 5090;
const partyAnalysisClientDir = path.join(repoRoot, "one-page-party-analysis", "frontend", "dist", "client");
const partyAnalysisServerAssetsDir = path.join(repoRoot, "one-page-party-analysis", "frontend", "dist", "server", "assets");
const partyAnalysisServerPath = path.join(repoRoot, "one-page-party-analysis", "frontend", "dist", "server", "server.js");

console.log(`[gst-reco] resolved gstRecoRoot=${gstRecoRoot}`);
const gstRecoServerJs = path.join(gstRecoRoot, "server.js");
console.log(`[gst-reco] server.js exists? ${fs.existsSync(gstRecoServerJs)}`);

console.log(`[itr] resolved itrRoot=${itrRoot}`);
const itrServerMjs = path.join(itrRoot, "app", "server.mjs");
console.log(`[itr] app/server.mjs exists? ${fs.existsSync(itrServerMjs)}`);

// The Party Ledger Analyzer's manual-override data (parties, transaction
// reassignments, audit log) is stored as one JSON file per analysis under
// frontend/server/data/party-overrides/ (see partyOverrideStore.ts) -- no
// database, no migrations. That store module locates its data directory via
// `path.resolve(__dirname, "..", "..", "data")`, which only points at the right
// folder when running from source; once Vite bundles it into a flat
// dist/server/assets/*.js chunk, __dirname no longer matches the original
// nested source path. Setting PARTY_ANALYSIS_DATA_DIR here, before the dynamic
// import below, gives the store an absolute path that's correct regardless of
// bundling (this process, unlike the bundled server module, is never bundled --
// its own import.meta.url always points at its real location on disk).
const partyAnalysisFrontendRoot = path.join(repoRoot, "one-page-party-analysis", "frontend");
process.env.PARTY_ANALYSIS_DATA_DIR = path.join(partyAnalysisFrontendRoot, "server", "data");

let analyzerApiAppPromise;

const toolServers = {
  analyzer: import(pathToFileURL(analyzerServerPath)).then((module) => ({ fetch: module.default.fetch })),
  converter: import(pathToFileURL(converterServerPath)).then((module) => ({
    fetch: module.default.fetch,
  })),
  tbconverter: import(pathToFileURL(tbConverterServerPath)).then((module) => ({
    fetch: module.default.fetch,
  })),
  partyAnalysis: import(pathToFileURL(partyAnalysisServerPath)).then((module) => ({
    fetch: module.default.fetch,
  })),
};

/**
 * Live tools that are served at their own dedicated /tools/<toolId> route
 * (no iframe). "ssr-alias" tools are Vite/TanStack Start SPAs built with
 * VITE_APP_BASE_PATH=/tools/<toolId>/ (see build-unified-tools.mjs), so their
 * client-side router basepath matches the real browser URL exactly — this
 * must stay true or the client router throws "Invariant failed" on hydrate
 * because window.location won't start with its baked-in basepath. "proxy"
 * tools are plain Express sidecars spawned as child processes and
 * reverse-proxied wholesale onto /tools/<toolId>/*.
 */
const SIDECAR_TOOLS = {
  "acc-bankanalyser": { kind: "ssr-alias", internalKey: "analyzer", assetPrefix: "/tools/acc-bankanalyser/" },
  "acc-bankconv": { kind: "ssr-alias", internalKey: "converter", assetPrefix: "/tools/acc-bankconv/" },
  "gst-xml": { kind: "ssr-alias", internalKey: "tbconverter", assetPrefix: "/tools/gst-xml/" },
  "aud-party-analysis": { kind: "ssr-alias", internalKey: "partyAnalysis", assetPrefix: "/tools/aud-party-analysis/" },
  "gst-reco": { kind: "proxy", port: GST_RECO_PORT },
  "it-bankanalyser": { kind: "proxy", port: ITR_PORT },
  "acc-2a2b": { kind: "proxy", port: ACC_2A2B_PORT },
  "gst-2breco": { kind: "proxy", port: GST_RECONCILIATION_PORT },
};

// Spawn the Collection & GST Reconciliation Express app as a sidecar child process.
// IMPORTANT: Force PORT=3000 for the child so it does not inherit the outer $PORT (e.g. 10000)
// from Render. The proxy always forwards to 3000.
const gstRecoProc = spawn("node", ["server.js"], {
  cwd: gstRecoRoot,
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    PORT: String(GST_RECO_PORT),
  },
});
gstRecoProc.on("error", (err) => console.error("[gst-reco] spawn error", err));
gstRecoProc.on("exit", (code, signal) => {
  console.error(`[gst-reco] child exited (code=${code}, signal=${signal})`);
});

// Spawn the ITR Bank Statement Analyzer (Express + Python OCR) as a sidecar
// child process, same pattern as GST-Reco above. Force a dedicated PORT so it
// never inherits the outer $PORT.
const itrProc = spawn("node", ["app/server.mjs"], {
  cwd: itrRoot,
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    PORT: String(ITR_PORT),
  },
});
itrProc.on("error", (err) => console.error("[itr] spawn error", err));
itrProc.on("exit", (code, signal) => {
  console.error(`[itr] child exited (code=${code}, signal=${signal})`);
});

// Spawn the 2A-2B Conversion FastAPI app (server.py) as a sidecar child
// process, same pattern as GST-Reco/ITR above. server.py mounts its own built
// frontend (frontend/dist) as static files at "/" and its API under /api/*,
// so proxying the whole /tools/acc-2a2b/* subtree to it (prefix stripped)
// serves both from one process. Force a dedicated PORT so it never inherits
// the outer $PORT.
const acc2a2bProc = spawn("python3", ["-m", "uvicorn", "server:app", "--host", "127.0.0.1", "--port", String(ACC_2A2B_PORT)], {
  cwd: acc2a2bRoot,
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    PORT: String(ACC_2A2B_PORT),
  },
});
acc2a2bProc.on("error", (err) => console.error("[acc-2a2b] spawn error", err));
acc2a2bProc.on("exit", (code, signal) => {
  console.error(`[acc-2a2b] child exited (code=${code}, signal=${signal})`);
});

// Spawn the GSTR2B vs Books reconciliation Flask app (gunicorn) as a sidecar
// child process, same pattern as 2A-2B above. app.py mounts its own built
// frontend (frontend/dist) as static files at "/" and its API under /api/*,
// so proxying the whole /tools/gst-2breco/* subtree to it (prefix stripped)
// serves both from one process. Force a dedicated PORT so it never inherits
// the outer $PORT.
const gstReconciliationProc = spawn(
  "python3",
  ["-m", "gunicorn", "--bind", `127.0.0.1:${GST_RECONCILIATION_PORT}`, "--workers", "2", "--timeout", "120", "app:app"],
  {
    cwd: path.join(gstReconciliationRoot, "backend"),
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      PORT: String(GST_RECONCILIATION_PORT),
    },
  },
);
gstReconciliationProc.on("error", (err) => console.error("[gst-2breco] spawn error", err));
gstReconciliationProc.on("exit", (code, signal) => {
  console.error(`[gst-2breco] child exited (code=${code}, signal=${signal})`);
});

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    // /tools/<toolId> requests for live sidecar tools must be handled before
    // serveStatic's SPA-shell catch-all (below), which would otherwise swallow
    // them and hand back the portal's own index.html instead.
    const routedTool = resolveToolByRoute(url.pathname);
    if (routedTool) {
      await handleRoutedToolRequest(req, res, routedTool);
      return;
    }

    if (serveStatic(req, res, url.pathname)) return;

    const tool = resolveTool(url.pathname);
    if (tool) {
      await handleToolRequest(req, res, tool);
      return;
    }

    if (!url.pathname.startsWith("/api/")) {
      sendFile(res, staffClientDir, "index.html", req.method === "HEAD");
      return;
    }

    sendText(res, 404, "Not found");
  } catch (error) {
    console.error("[unified] request error", error);
    if (!res.headersSent) {
      sendText(res, 500, "Internal server error");
    } else {
      res.end();
    }
  }
});

// Same rationale as ITRBankStatementAnalyzer/app/server.mjs's requestTimeout
// override: every request to the ITR sidecar (and the other tools) passes
// through this proxy first, so its default 5-minute requestTimeout is what
// actually aborts a slow upload of a large bank statement PDF, not the
// sidecar's own (already-relaxed) timeout.
server.requestTimeout = 0;

server.listen(publicPort, "0.0.0.0", () => {
  console.log(`[unified] listening on ${publicPort}`);
  console.log("[unified] /tools/acc-bankanalyser -> analyzer server");
  console.log("[unified] /tools/acc-bankconv -> converter server");
  console.log("[unified] /tools/gst-xml -> trial balance converter server");
  console.log(`[unified] /tools/gst-reco -> gst-reco express server (port ${GST_RECO_PORT})`);
  console.log("[unified] /tools/aud-party-analysis -> party ledger analyzer server");
  console.log(`[unified] /tools/it-bankanalyser -> ITR bank statement analyzer server (port ${ITR_PORT})`);
  console.log(`[unified] /tools/acc-2a2b -> 2A-2B conversion server (port ${ACC_2A2B_PORT})`);
  console.log(`[unified] /tools/gst-2breco -> GSTR2B vs Books reconciliation server (port ${GST_RECONCILIATION_PORT})`);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("exit", () => {
  try { gstRecoProc.kill(); } catch (_) {}
  try { itrProc.kill(); } catch (_) {}
  try { acc2a2bProc.kill(); } catch (_) {}
  try { gstReconciliationProc.kill(); } catch (_) {}
});

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

/**
 * Matches the portal-facing /tools/<toolId> routes for live sidecar tools.
 * "ssr-alias" tools only match their exact top-level document path here (their
 * own assets are requested at /tools/<toolId>/assets/... and served by the
 * serveStatic() fast path instead, matching the below fallback); proxy tools
 * match the whole /tools/<toolId>/* subtree since their EJS/Express pages
 * generate every internal link from the x-forwarded-prefix we send them.
 */
function resolveToolByRoute(pathname) {
  for (const [toolId, info] of Object.entries(SIDECAR_TOOLS)) {
    const base = `/tools/${toolId}`;
    if (info.kind === "proxy") {
      if (pathname === base || pathname.startsWith(`${base}/`)) {
        return { toolId, ...info };
      }
    } else if (pathname === base) {
      return { toolId, ...info };
    }
  }
  return null;
}

async function handleRoutedToolRequest(req, res, routedTool) {
  if (routedTool.kind === "proxy") {
    await proxySidecar(req, res, { port: routedTool.port, prefix: `/tools/${routedTool.toolId}` });
    return;
  }

  const toolServer = await toolServers[routedTool.internalKey];
  const request = toFetchRequest(req, routedTool.assetPrefix);
  const response = await toolServer.fetch(request, process.env, {});
  await sendFetchResponse(res, response, req.method === "HEAD");
}

function resolveTool(pathname) {
  if (pathname.startsWith("/tools/acc-bankanalyser") || pathname.startsWith("/api/analysis")) {
    return "analyzer";
  }

  if (pathname.startsWith("/tools/acc-bankconv") || pathname.startsWith("/api/convert")) {
    return "converter";
  }

  if (
    pathname.startsWith("/tools/gst-xml") ||
    pathname.startsWith("/api/tbparse") ||
    pathname.startsWith("/api/tbconvert")
  ) {
    return "tbconverter";
  }

  if (pathname.startsWith("/tools/aud-party-analysis")) {
    return "partyAnalysis";
  }

  return null;
}

async function handleToolRequest(req, res, tool) {
  if (tool === "gst-reco") {
    await proxySidecar(req, res, { port: GST_RECO_PORT, prefix: "/__tools/gst-reco" });
    return;
  }

  const toolServer = await toolServers[tool];
  if (tool === "analyzer" && req.url?.startsWith("/api/analysis")) {
    await handleAnalyzerNodeApi(req, res);
    return;
  }

  if (tool === "partyAnalysis" && req.url?.startsWith("/tools/aud-party-analysis/api")) {
    await handlePartyAnalysisNodeApi(req, res);
    return;
  }

  const request = toFetchRequest(req);
  const response = await toolServer.fetch(request, process.env, {});
  await sendFetchResponse(res, response, req.method === "HEAD");
}

/**
 * Reverse-proxy requests for `${prefix}/*` to a sidecar Express app running on
 * 127.0.0.1:port. Strips the prefix so the Express app sees plain paths, and
 * tells it the prefix via x-forwarded-prefix so it can echo it back into any
 * generated links (asset URLs, form actions, download links).
 */
function proxySidecar(req, res, { port, prefix }) {
  return new Promise((resolve) => {
    const stripped = req.url.slice(prefix.length) || "/";
    const options = {
      hostname: "127.0.0.1",
      port,
      path: stripped,
      method: req.method,
      headers: {
        ...req.headers,
        "x-forwarded-prefix": prefix,
      },
    };
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
      proxyRes.on("end", resolve);
    });
    proxyReq.on("error", (err) => {
      console.error(`[sidecar proxy ${prefix}] error`, err.message);
      if (!res.headersSent) res.writeHead(502);
      res.end("Tool service unavailable");
      resolve();
    });
    req.pipe(proxyReq, { end: true });
  });
}

async function handleAnalyzerNodeApi(req, res) {
  const app = await getAnalyzerApiApp();

  await new Promise((resolve, reject) => {
    const settle = () => resolve();
    res.once("finish", settle);
    res.once("close", settle);

    app(req, res, (error) => {
      res.off("finish", settle);
      res.off("close", settle);
      if (error) reject(error);
      else resolve();
    });
  });
}

async function getAnalyzerApiApp() {
  if (!analyzerApiAppPromise) {
    analyzerApiAppPromise = import(pathToFileURL(resolveAnalyzerCreateAppPath())).then((module) => module.createApiApp());
  }

  return analyzerApiAppPromise;
}

function resolveAnalyzerCreateAppPath() {
  const fileName = fs.readdirSync(analyzerServerAssetsDir).find((file) => /^createApp-.*\.js$/.test(file));
  if (!fileName) {
    throw new Error(`Could not find Analyzer createApp asset in ${analyzerServerAssetsDir}`);
  }

  return path.join(analyzerServerAssetsDir, fileName);
}

let partyAnalysisApiAppPromise;

/**
 * The Party Ledger Analyzer's frontend calls its API under the
 * /tools/aud-party-analysis/api/* prefix (see VITE_API_BASE_URL in
 * build-unified-tools.mjs) so it never collides with the Bank Statement
 * Analyzer's bare /api/analysis routes. Its Express app itself still expects
 * bare /api/* paths, so strip the tool prefix before invoking it as raw Node
 * middleware (same multipart-upload-safe approach as handleAnalyzerNodeApi).
 */
async function handlePartyAnalysisNodeApi(req, res) {
  const app = await getPartyAnalysisApiApp();
  const originalUrl = req.url;
  req.url = originalUrl.replace(/^\/tools\/aud-party-analysis/, "") || "/";

  try {
    await new Promise((resolve, reject) => {
      const settle = () => resolve();
      res.once("finish", settle);
      res.once("close", settle);

      app(req, res, (error) => {
        res.off("finish", settle);
        res.off("close", settle);
        if (error) reject(error);
        else resolve();
      });
    });
  } finally {
    req.url = originalUrl;
  }
}

async function getPartyAnalysisApiApp() {
  if (!partyAnalysisApiAppPromise) {
    partyAnalysisApiAppPromise = import(pathToFileURL(resolvePartyAnalysisCreateAppPath())).then((module) => module.createApiApp());
  }

  return partyAnalysisApiAppPromise;
}

function resolvePartyAnalysisCreateAppPath() {
  const fileName = fs.readdirSync(partyAnalysisServerAssetsDir).find((file) => /^createApp-.*\.js$/.test(file));
  if (!fileName) {
    throw new Error(`Could not find Party Analysis createApp asset in ${partyAnalysisServerAssetsDir}`);
  }

  return path.join(partyAnalysisServerAssetsDir, fileName);
}

function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") return false;

  if (pathname.startsWith("/assets/")) {
    return sendFile(res, staffClientDir, pathname.slice(1), req.method === "HEAD");
  }

  if (pathname.startsWith("/tools/acc-bankanalyser/assets/")) {
    const relativePath = pathname.replace("/tools/acc-bankanalyser/", "");
    return sendFile(res, analyzerClientDir, relativePath, req.method === "HEAD");
  }

  if (pathname.startsWith("/tools/acc-bankconv/assets/")) {
    const relativePath = pathname.replace("/tools/acc-bankconv/", "");
    return sendFile(res, converterClientDir, relativePath, req.method === "HEAD");
  }

  if (pathname.startsWith("/tools/gst-xml/assets/")) {
    const relativePath = pathname.replace("/tools/gst-xml/", "");
    return sendFile(res, tbConverterClientDir, relativePath, req.method === "HEAD");
  }

  if (pathname.startsWith("/tools/aud-party-analysis/assets/")) {
    const relativePath = pathname.replace("/tools/aud-party-analysis/", "");
    return sendFile(res, partyAnalysisClientDir, relativePath, req.method === "HEAD");
  }

  // gst-reco / itr are plain Express apps — no pre-built static assets to serve
  // here; all requests (including their own /public/*-style files) are
  // proxied dynamically to the spawned child process.

  if (!pathname.startsWith("/api/") && !pathname.startsWith("/__tools/") && !pathname.startsWith("/tools/")) {
    return sendFile(res, staffClientDir, "index.html", req.method === "HEAD");
  }

  return false;
}

function sendFile(res, root, relativePath, headOnly) {
  const safeRelativePath = path.normalize(decodeURIComponent(relativePath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safeRelativePath);

  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return false;
  }

  res.writeHead(200, { "content-type": contentType(filePath) });
  if (headOnly) {
    res.end();
    return true;
  }

  fs.createReadStream(filePath).pipe(res);
  return true;
}

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".ico")) return "image/x-icon";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

function sendText(res, statusCode, body) {
  res.writeHead(statusCode, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

function toFetchRequest(req, overridePathname) {
  const origin = `http://${req.headers.host || "localhost"}`;
  const url = new URL(req.url || "/", origin);
  if (overridePathname) {
    url.pathname = overridePathname;
  }
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const init = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req;
    init.duplex = "half";
  }

  return new Request(url, init);
}

async function sendFetchResponse(res, response, headOnly) {
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  res.writeHead(response.status, headers);
  if (headOnly || !response.body) {
    res.end();
    return;
  }

  const reader = response.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (error) {
    res.destroy(error);
  }
}

function shutdown(code) {
  server.close();
  process.exit(code);
}
