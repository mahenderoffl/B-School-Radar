import { getUrgency } from "@/lib/utils";

export default function DeadlineBadge({ date }: { date: Date | string }) {
  const { label, badgeClasses } = getUrgency(date);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${badgeClasses}`}
    >
      {label}
    </span>
  );
}
