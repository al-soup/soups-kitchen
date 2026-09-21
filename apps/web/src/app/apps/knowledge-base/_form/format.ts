function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const month = d.toLocaleString("en-GB", { month: "long" });
  return `${d.getDate()}. ${month} ${d.getFullYear()}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${formatDate(iso)}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
