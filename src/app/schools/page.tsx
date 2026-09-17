import Link from "next/link";
import { getSchoolsOverview, nextOpenRound } from "@/lib/queries";

export const dynamic = "force-dynamic";
import { formatDate, REQUIREMENT_LABELS } from "@/lib/utils";
import DeadlineBadge from "@/components/DeadlineBadge";

export default async function SchoolsPage() {
  const schools = await getSchoolsOverview();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Schools</h1>
          <p className="mt-1 text-sm text-gray-500">{schools.length} schools tracked</p>
        </div>
        <Link
          href="/schools/new"
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          + Add school
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Next deadline</th>
              <th className="px-4 py-3">Test requirements</th>
              <th className="px-4 py-3">Next scholarship deadline</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schools.map((school) => {
              const program = school.programs[0];
              const allRounds = program?.intakes.flatMap((i) => i.rounds) ?? [];
              const next = nextOpenRound(allRounds);
              const requirements = program?.requirements ?? [];
              const scholarships = program?.scholarships.filter((s) => s.deadlineDate) ?? [];
              const nextScholarship = scholarships.sort(
                (a, b) => new Date(a.deadlineDate!).getTime() - new Date(b.deadlineDate!).getTime()
              )[0];

              return (
                <tr key={school.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/schools/${school.id}`} className="font-medium text-gray-900 hover:underline">
                      {school.name}
                    </Link>
                    <div className="text-xs text-gray-500">{school.city}, {school.country}</div>
                  </td>
                  <td className="px-4 py-3">
                    {next ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{formatDate(next.deadlineDate)}</span>
                        <DeadlineBadge date={next.deadlineDate} />
                      </div>
                    ) : (
                      <span className="text-gray-400">No open rounds</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {requirements.map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          title={r.waiverCondition ?? undefined}
                        >
                          {REQUIREMENT_LABELS[r.type]}
                          {!r.mandatory && <span className="ml-1 text-gray-400">(waivable)</span>}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {nextScholarship ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{formatDate(nextScholarship.deadlineDate)}</span>
                        <DeadlineBadge date={nextScholarship.deadlineDate!} />
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/schools/${school.id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
