"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate, formatMoney, SCHOLARSHIP_PLAN_STAGE_LABELS, SCHOLARSHIP_PLAN_STAGE_CLASSES } from "@/lib/utils";
import { inputClass, tableCard, link } from "@/lib/ui";
import DeadlineBadge from "@/components/DeadlineBadge";
import EmptyState from "@/components/EmptyState";

export type ScholarshipRow = {
  id: string;
  name: string;
  provider: string | null;
  amount: number | null;
  currency: string;
  coverage: string | null;
  deadlineDate: string | null;
  schoolId: string | null;
  schoolName: string | null;
  status: string;
  done: number;
  total: number;
};

type Filter = "all" | keyof typeof SCHOLARSHIP_PLAN_STAGE_LABELS;

export default function ScholarshipsBoard({ scholarships }: { scholarships: ScholarshipRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of scholarships) c[s.status] = (c[s.status] ?? 0) + 1;
    return c;
  }, [scholarships]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scholarships.filter(
      (s) =>
        (filter === "all" || s.status === filter) &&
        (!q || [s.name, s.provider, s.schoolName].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [scholarships, filter, query]);

  if (scholarships.length === 0) {
    return <EmptyState text="No scholarships saved yet. Save one you've come across to start planning for it." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label="All" count={scholarships.length} />
          {Object.entries(SCHOLARSHIP_PLAN_STAGE_LABELS).map(([value, label]) => (
            <FilterPill
              key={value}
              active={filter === value}
              onClick={() => setFilter(value)}
              label={label}
              count={counts[value] ?? 0}
            />
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${inputClass} sm:max-w-xs`}
          placeholder="Search name, provider, school…"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="Nothing matches this filter." />
      ) : (
        <div className={tableCard}>
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Scholarship</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">For school</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  className="animate-fade-in-up transition-colors hover:bg-gray-50/80"
                  style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
                >
                  <td className="px-4 py-3">
                    <Link href={`/scholarships/${s.id}`} className={`${link} font-medium`}>
                      {s.name}
                    </Link>
                    {s.provider && <div className="text-xs text-gray-500">{s.provider}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.amount != null ? formatMoney(s.amount, s.currency) : s.coverage ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.schoolId ? (
                      <Link href={`/schools/${s.schoolId}`} className={link}>
                        {s.schoolName}
                      </Link>
                    ) : (
                      "Any"
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(s.deadlineDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${SCHOLARSHIP_PLAN_STAGE_CLASSES[s.status]}`}>
                      {SCHOLARSHIP_PLAN_STAGE_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-500">
                    {s.total > 0 ? `${s.done}/${s.total}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">{s.deadlineDate && <DeadlineBadge date={s.deadlineDate} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        active ? "bg-gray-900 text-white" : "bg-white text-gray-600 ring-1 ring-black/5 hover:bg-gray-50"
      }`}
    >
      {label}
      <span className={`ml-1.5 ${active ? "text-white/70" : "text-gray-400"}`}>{count}</span>
    </button>
  );
}
