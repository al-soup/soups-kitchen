import sharedStyles from "@/app/shared-page.module.css";

export default function Loading() {
  return (
    <div className={sharedStyles.page}>
      <p>Loading…</p>
    </div>
  );
}
