/**
 * Tool ids that are backed by a real sidecar app (not the generic "Workspace"
 * placeholder). These are served directly at /tools/<toolId> via a real
 * reverse proxy — unified-preview.mjs in prod, the Vite dev proxy in
 * vite.config.ts in dev — so navigating to them must be a real browser
 * navigation, not a client-side SPA transition (a client transition never
 * hits the network, so the proxy would never see the request).
 */
export const SIDECAR_TOOL_IDS = new Set<string>([
  "acc-bankanalyser",
  "acc-bankconv",
  "gst-xml",
  "aud-party-analysis",
  "gst-reco",
  "gst-2breco",
  "it-bankanalyser",
  "acc-2a2b",
]);

export const isSidecarTool = (toolId: string) => SIDECAR_TOOL_IDS.has(toolId);

/** Where a real (non-SPA) browser navigation for this sidecar tool should go. */
export function sidecarToolHref(toolId: string): string {
  return `/tools/${toolId}`;
}
