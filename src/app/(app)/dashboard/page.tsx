import Link from "next/link";
import { getRoundFeed, getScholarshipFeed } from "@/lib/queries";
import { daysUntil, formatDate } from "@/lib/utils";
import { tableCard, link } from "@/lib/ui";
import DeadlineBadge from "@/components/DeadlineBadge";
import DashboardRoundsBoard, { type RoundRow } from "@/components/DashboardRoundsBoard";
import EmptyState from "@/components/EmptyState";
import SchoolLogo from "@/components/SchoolLogo";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [rounds, scholarships] = await Promise.all([getRoundFeed(), getScholarshipFeed()]);

  const openRounds = rounds
    .filter((r) => daysUntil(r.deadlineDate) >= 0)
    .filter((r) => r.applicationStatus?.status !== "SUBMITTED" && r.applicationStatus?.status !== "REJECTED");

  const roundRows: RoundRow[] = openRounds.map((r) => ({
    id: r.id,
    schoolId: r.intake.program.school.id,
    schoolName: r.intake.program.school.name,
    schoolWebsite: r.intake.program.school.website,
    programName: r.intake.program.name,
    roundNumber: r.roundNumber,
    intakeMonth: r.intake.startMonth,
    intakeYear: r.intake.startYear,
    deadlineDate: r.deadlineDate.toISOString(),
    decisionDate: r.decisionDate ? r.decisionDate.toISOString() : null,
    status: r.applicationStatus?.status ?? "NOT_STARTED",
  }));

  const openScholarships = scholarships.filter((s) => s.deadlineDate && daysUntil(s.deadlineDate) >= 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-1.5 text-[15px] text-gray-500">Every open application round, sorted by how soon it closes.</p>
      </div>

      <DashboardRoundsBoard rounds={roundRows} scholarshipCount={openScholarships.length} />

      <section id="scholarships" className="scroll-mt-20">
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-gray-900">Scholarship deadlines</h2>
        {openScholarships.length === 0 ? (
          <EmptyState text="No open scholarship deadlines." />
        ) : (
          <div className={tableCard}>
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Scholarship</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {openScholarships.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link href={`/schools/${s.program.school.id}`} className="flex items-center gap-2.5">
                        <SchoolLogo name={s.program.school.name} website={s.program.school.website} size={22} />
                        <span className={link}>{s.program.school.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(s.deadlineDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <DeadlineBadge date={s.deadlineDate!} />
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
