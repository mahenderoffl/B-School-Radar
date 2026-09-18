"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { tableCard, inputClass, link } from "@/lib/ui";
import DeadlineBadge from "@/components/DeadlineBadge";
import EmptyState from "@/components/EmptyState";
import SchoolLogo from "@/components/SchoolLogo";

export type SchoolRow = {
  id: string;
  name: string;
  city: string;
  country: string;
  website: string | null;
  nextDeadline: string | null;
  requirements: { id: string; label: string; waivable: boolean; waiverCondition: string | null }[];
  nextScholarshipDeadline: string | null;
};

export default function SchoolsTable({ schools }: { schools: SchoolRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter(
      (s) => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)
    );
  }, [schools, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400"
        >
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth={1.6} />
          <path d="M14 14L18 18" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by school, city, or country…"
          className={`${inputClass} pl-9`}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="No schools match your search." />
      ) : (
        <div className={tableCard}>
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Next deadline</th>
                <th className="px-4 py-3">Test requirements</th>
                <th className="px-4 py-3">Next scholarship deadline</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((school, i) => (
                <tr
                  key={school.id}
                  className="animate-fade-in-up transition-colors hover:bg-gray-50/80"
                  style={{ animationDelay: `${Math.min(i, 8) * 20}ms` }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <SchoolLogo name={school.name} website={school.website} size={28} />
                      <div>
                        <Link href={`/schools/${school.id}`} className="font-medium text-gray-900 transition-colors hover:text-blue-600">
                          {school.name}
                        </Link>
                        <div className="text-xs text-gray-500">
                          {school.city}, {school.country}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {school.nextDeadline ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{formatDate(school.nextDeadline)}</span>
                        <DeadlineBadge date={school.nextDeadline} />
                      </div>
                    ) : (
                      <span className="text-gray-400">No open rounds</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {school.requirements.map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          title={r.waiverCondition ?? undefined}
                        >
                          {r.label}
                          {r.waivable && <span className="ml-1 text-gray-400">(waivable)</span>}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {school.nextScholarshipDeadline ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{formatDate(school.nextScholarshipDeadline)}</span>
                        <DeadlineBadge date={school.nextScholarshipDeadline} />
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/schools/${school.id}`} className={`text-sm ${link}`}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
