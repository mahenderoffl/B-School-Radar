import Link from "next/link";
import { getRoundFeed, getScholarshipFeed, getSavedScholarships } from "@/lib/queries";
import { daysUntil, formatDate } from "@/lib/utils";
import { tableCard, link } from "@/lib/ui";
import DeadlineBadge from "@/components/DeadlineBadge";
import DashboardRoundsBoard, { type RoundRow } from "@/components/DashboardRoundsBoard";
import EmptyState from "@/components/EmptyState";
import SchoolLogo from "@/components/SchoolLogo";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [rounds, scholarships, savedScholarships] = await Promise.all([
    getRoundFeed(),
    getScholarshipFeed(),
    getSavedScholarships(),
  ]);

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

  // School-listed scholarships and ones saved from elsewhere share one deadline table.
  // Saved ones drop off once they're applied for or decided, like submitted rounds do.
  const openScholarships = [
    ...scholarships.map((s) => ({
      id: s.id,
      school: s.program.school,
      name: s.name,
      href: null as string | null,
      deadlineDate: s.deadlineDate,
    })),
    ...savedScholarships
      .filter((s) => s.status === "INTERESTED" || s.status === "PREPARING")
      .map((s) => ({
        id: s.id,
        school: s.school,
        name: s.name,
        href: `/scholarships/${s.id}`,
        deadlineDate: s.deadlineDate,
      })),
  ]
    .filter((s): s is typeof s & { deadlineDate: Date } => s.deadlineDate != null && daysUntil(s.deadlineDate) >= 0)
    .sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime());

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
                      {s.school ? (
                        <Link href={`/schools/${s.school.id}`} className="flex items-center gap-2.5">
                          <SchoolLogo name={s.school.name} website={s.school.website} size={22} />
                          <span className={link}>{s.school.name}</span>
                        </Link>
                      ) : (
                        <span className="font-normal text-gray-500">Any school</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {s.href ? (
                        <Link href={s.href} className={link}>
                          {s.name}
                        </Link>
                      ) : (
                        s.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(s.deadlineDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <DeadlineBadge date={s.deadlineDate} />
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
