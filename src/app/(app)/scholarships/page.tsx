import Link from "next/link";
import { getSavedScholarships } from "@/lib/queries";
import { parseChecklist } from "@/lib/utils";
import { btnPrimary } from "@/lib/ui";
import ScholarshipsBoard, { type ScholarshipRow } from "@/components/ScholarshipsBoard";

export const dynamic = "force-dynamic";

export default async function ScholarshipsPage() {
  const scholarships = await getSavedScholarships();

  const rows: ScholarshipRow[] = scholarships.map((s) => {
    const checklist = parseChecklist(s.taskChecklist);
    return {
      id: s.id,
      name: s.name,
      provider: s.provider,
      amount: s.amount,
      currency: s.currency,
      coverage: s.coverage,
      deadlineDate: s.deadlineDate ? s.deadlineDate.toISOString() : null,
      schoolId: s.school?.id ?? null,
      schoolName: s.school?.name ?? null,
      status: s.status,
      done: checklist.filter((i) => i.done).length,
      total: checklist.length,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Scholarships</h1>
          <p className="mt-1.5 text-[15px] text-gray-500">
            Scholarships you&apos;ve come across, and your plan for each one.
          </p>
        </div>
        <Link href="/scholarships/new" className={btnPrimary}>
          + Save scholarship
        </Link>
      </div>

      <ScholarshipsBoard scholarships={rows} />
    </div>
  );
}
