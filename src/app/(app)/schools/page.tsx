import Link from "next/link";
import { getSchoolsOverview, nextOpenRound } from "@/lib/queries";
import { REQUIREMENT_LABELS } from "@/lib/utils";
import { btnPrimary } from "@/lib/ui";
import SchoolsTable, { type SchoolRow } from "@/components/SchoolsTable";

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
  const schools = await getSchoolsOverview();

  const rows: SchoolRow[] = schools.map((school) => {
    const program = school.programs[0];
    const allRounds = program?.intakes.flatMap((i) => i.rounds) ?? [];
    const next = nextOpenRound(allRounds);
    const requirements = program?.requirements ?? [];
    const scholarships = program?.scholarships.filter((s) => s.deadlineDate) ?? [];
    const nextScholarship = scholarships.sort(
      (a, b) => new Date(a.deadlineDate!).getTime() - new Date(b.deadlineDate!).getTime()
    )[0];

    return {
      id: school.id,
      name: school.name,
      city: school.city,
      country: school.country,
      nextDeadline: next ? next.deadlineDate.toISOString() : null,
      requirements: requirements.map((r) => ({
        id: r.id,
        label: REQUIREMENT_LABELS[r.type],
        waivable: !r.mandatory,
        waiverCondition: r.waiverCondition,
      })),
      nextScholarshipDeadline: nextScholarship?.deadlineDate ? nextScholarship.deadlineDate.toISOString() : null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Schools</h1>
          <p className="mt-1.5 text-[15px] text-gray-500">{schools.length} schools tracked</p>
        </div>
        <Link href="/schools/new" className={btnPrimary}>
          + Add school
        </Link>
      </div>

      <SchoolsTable schools={rows} />
    </div>
  );
}
