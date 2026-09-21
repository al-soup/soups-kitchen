import { flushSync } from "react-dom";

// Runs a state update inside a View Transition so elements that carry a
// `view-transition-name` animate from their old to their new position.
// `update` runs asynchronously (after the browser captured the old state), so
// callers must re-check staleness inside it.
export function withViewTransition(update: () => void): void {
  if (
    typeof document.startViewTransition !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}
