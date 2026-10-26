import { getTool } from "@/data/tools";

/** Base URL of tracking-api (see /tracking-api). Must be https in production. */
export const TRACKING_API = (import.meta.env.VITE_TRACKING_API_URL as string | undefined) ?? "http://localhost:8200";

// The same click can reach pushRecent twice (card click + tool route effect, StrictMode);
// one launch = one event, so drop repeats of a tool within this window.
const DEDUPE_MS = 3000;
const lastSent = new Map<string, number>();

/** Record that a live tool was opened. Fire-and-forget; never throws or blocks navigation. */
export function trackLaunch(toolId: string, user: { email: string; name: string } | null) {
  const tool = getTool(toolId);
  if (!tool || !user || (tool.status ?? "live") !== "live") return;
  const now = Date.now();
  if (now - (lastSent.get(toolId) ?? 0) < DEDUPE_MS) return;
  lastSent.set(toolId, now);
  try {
    const payload = JSON.stringify({
      id: crypto.randomUUID(),
      toolId: tool.id,
      toolName: tool.name,
      toolCategory: tool.category,
      userId: user.email,
      userName: user.name,
      action: "launch",
      source: "ui",
    });
    // text/plain keeps it a "simple" request (no CORS preflight) and survives page unload.
    const blob = new Blob([payload], { type: "text/plain" });
    if (!navigator.sendBeacon?.(`${TRACKING_API}/api/events`, blob)) {
      void fetch(`${TRACKING_API}/api/events`, { method: "POST", body: payload, keepalive: true }).catch(() => {});
    }
  } catch {
    /* tracking must never break the portal */
  }
}

