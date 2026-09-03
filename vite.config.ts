// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { ProxyOptions } from "vite";

// Dev-only: proxy every live sidecar tool's /tools/<toolId> route to its own
// standalone dev server (started by scripts/dev-unified.ps1), so navigating to
// a tool from the dashboard in `npm run dev` behaves the same as the real
// reverse proxy in unified-preview.mjs (prod) — same origin as the portal, no
// iframe, and "Back to Dashboard" (a plain <a href="/dashboard">) resolves
// correctly instead of 404ing against the tool's own dev server.
//
// - "strip" tools (gst-reco, it-bankanalyser) are plain Express apps whose
//   basePath is dynamic (read from the x-forwarded-prefix header we inject
//   here, echoed back into every generated link) — the proxy strips the
//   /tools/<id> prefix before forwarding, matching what unified-preview.mjs
//   does in prod.
// - "passthrough" tools are Vite/TanStack Start SPAs. dev-unified.ps1 starts
//   their dev server with VITE_APP_BASE_PATH=/tools/<id>/, so Vite itself
//   already serves and generates every asset/module/HMR URL under that exact
//   prefix — the proxy must forward the path unchanged (no stripping), same
//   idea as prod's VITE_APP_BASE_PATH=/__tools/<slug>/ build-time base path.
const SIDECAR_DEV_PROXY: Record<string, { port: number; mode: "strip" | "passthrough" }> = {
  "acc-bankanalyser": { port: 5173, mode: "passthrough" },
  "acc-bankconv": { port: 8090, mode: "passthrough" },
  "gst-xml": { port: 8095, mode: "passthrough" },
  "aud-party-analysis": { port: 5180, mode: "passthrough" },
  "gst-reco": { port: 3000, mode: "strip" },
  "it-bankanalyser": { port: 8765, mode: "strip" },
  "acc-2a2b": { port: 5185, mode: "passthrough" },
  "gst-2breco": { port: 5190, mode: "passthrough" },
};

const sidecarProxy: Record<string, ProxyOptions> = Object.fromEntries(
  Object.entries(SIDECAR_DEV_PROXY).map(([toolId, { port, mode }]) => {
    const prefix = `/tools/${toolId}`;
    const options: ProxyOptions = {
      target: `http://localhost:${port}`,
      changeOrigin: true,
    };
    if (mode === "strip") {
      options.rewrite = (p: string) => p.slice(prefix.length) || "/";
      options.configure = (proxy) => {
        proxy.on("proxyReq", (proxyReq) => {
          proxyReq.setHeader("x-forwarded-prefix", prefix);
        });
      };
    } else {
      // Vite's dev server only serves its configured `base` with the exact
      // trailing slash — the portal's own route has none, so add it back for
      // the bare document request (deeper paths already carry their own slash).
      options.rewrite = (p: string) => (p === prefix ? `${prefix}/` : p);
    }
    return [prefix, options];
  }),
);

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // SPA mode: prerender a static HTML shell at build time so the app can be
    // hosted on a plain static CDN (Render Static Site) with no Node server.
    // outputPath "/index" writes the shell to dist/client/index.html, which the
    // static host serves for every route (with a /* -> /index.html rewrite).
    spa: {
      enabled: true,
      prerender: { outputPath: "/index" },
    },
  },
  vite: {
    preview: {
      host: "0.0.0.0",
      allowedHosts: ["ca-rmhstaffportal.onrender.com", "staff.rmhadvisors.in"],
    },
    server: {
      proxy: sidecarProxy,
    },
  },
});
