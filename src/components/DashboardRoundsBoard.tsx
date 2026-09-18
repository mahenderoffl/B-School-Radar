"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate, getUrgency, APPLICATION_STAGE_LABELS, APPLICATION_STAGE_CLASSES } from "@/lib/utils";
import { tableCard, link } from "@/lib/ui";
import DeadlineBadge from "@/components/DeadlineBadge";
import EmptyState from "@/components/EmptyState";
import SchoolLogo from "@/components/SchoolLogo";

export type RoundRow = {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolWebsite: string | null;
  programName: string;
  roundNumber: number;
  deadlineDate: string;
  status: string;
};

type Filter = "all" | "urgent" | "soon";

export default function DashboardRoundsBoard({
  rounds,
  scholarshipCount,
}: {
  rounds: RoundRow[];
  scholarshipCount: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const urgentCount = useMemo(() => rounds.filter((r) => getUrgency(r.deadlineDate).urgency === "urgent").length, [rounds]);
  const soonCount = useMemo(() => rounds.filter((r) => getUrgency(r.deadlineDate).urgency === "soon").length, [rounds]);

  const filteredRounds = useMemo(() => {
    if (filter === "all") return rounds;
    return rounds.filter((r) => getUrgency(r.deadlineDate).urgency === filter);
  }, [rounds, filter]);

  function toggleFilter(next: Filter) {
    setFilter((current) => (current === next ? "all" : next));
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Due within 7 days"
          value={urgentCount}
          tone="urgent"
          active={filter === "urgent"}
          onClick={() => toggleFilter("urgent")}
        />
        <StatCard
          label="Due within 30 days"
          value={soonCount}
          tone="soon"
          active={filter === "soon"}
          onClick={() => toggleFilter("soon")}
        />
        <StatCard
          label="Scholarship deadlines open"
          value={scholarshipCount}
          tone="open"
          onClick={() => document.getElementById("scholarships")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">Application rounds</h2>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Clear filter ×
            </button>
          )}
        </div>
        {rounds.length === 0 ? (
          <EmptyState text="No open rounds. Add a school to get started." />
        ) : filteredRounds.length === 0 ? (
          <EmptyState text="Nothing matches this filter." />
        ) : (
          <div className={tableCard}>
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Round</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRounds.map((r, i) => (
                  <tr
                    key={r.id}
                    className="animate-fade-in-up transition-colors hover:bg-gray-50/80"
                    style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link href={`/schools/${r.schoolId}`} className="flex items-center gap-2.5">
                        <SchoolLogo name={r.schoolName} website={r.schoolWebsite} size={22} />
                        <span className={link}>{r.schoolName}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.programName}</td>
                    <td className="px-4 py-3 text-gray-600">Round {r.roundNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(r.deadlineDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${APPLICATION_STAGE_CLASSES[r.status]}`}>
                        {APPLICATION_STAGE_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeadlineBadge date={r.deadlineDate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone: "urgent" | "soon" | "open";
  active?: boolean;
  onClick?: () => void;
}) {
  const toneClasses = {
    urgent: "bg-red-50 text-red-700",
    soon: "bg-amber-50 text-amber-800",
    open: "bg-emerald-50 text-emerald-700",
  }[tone];
  const ringClasses = {
    urgent: "ring-red-300",
    soon: "ring-amber-300",
    open: "ring-emerald-300",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-5 py-5 text-left shadow-sm ring-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${toneClasses} ${
        active ? `${ringClasses} ring-2` : "ring-black/5"
      }`}
    >
      <div className="text-4xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
        {label}
        {active && <span className="text-xs font-semibold">· filtering</span>}
      </div>
    </button>
  );
}
