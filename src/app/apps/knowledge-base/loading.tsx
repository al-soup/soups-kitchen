import sharedStyles from "../../shared-page.module.css";

export default function Loading() {
  return (
    <div className={sharedStyles.page}>
      <h1 className={sharedStyles.title}>Knowledge Base</h1>
      <p>Loading…</p>
    </div>
  );
}
