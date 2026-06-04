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
      <h1 className={sharedStyles.title}>Knowledge Base</h1>
      <p className={sharedStyles.description}>
        Something went wrong loading the knowledge base.
      </p>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
