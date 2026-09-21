"use client";

import sharedStyles from "../../shared-page.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={sharedStyles.page}>
      <h1 className={sharedStyles.title}>Habits failed to load</h1>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
