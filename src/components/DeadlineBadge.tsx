import { getUrgency } from "@/lib/utils";

export default function DeadlineBadge({ date }: { date: Date | string }) {
  const { label, badgeClasses } = getUrgency(date);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${badgeClasses}`}
    >
      {label}
    </span>
  );
}
