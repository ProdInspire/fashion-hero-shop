/**
 * Thin event-tracking shim. Wire this up to the real PostHog client
 * (see analyses/2026-08-07-posthog-instrumentation-audit-AI-listing.md)
 * once instrumentation is approved — until then it no-ops safely.
 */
type ComparisonEvent =
  | "comparison_add"
  | "comparison_remove"
  | "comparison_view"
  | "comparison_to_cart";

export function trackEvent(event: ComparisonEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const posthog = (window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog;
  posthog?.capture(event, properties);
}
