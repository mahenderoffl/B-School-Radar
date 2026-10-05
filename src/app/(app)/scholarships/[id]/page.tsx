import Link from "next/link";
import { notFound } from "next/navigation";
import { getSavedScholarshipById } from "@/lib/queries";
import { formatDate, formatMoney } from "@/lib/utils";
import { btnSecondary, card, link } from "@/lib/ui";
import DeadlineBadge from "@/components/DeadlineBadge";
import ScholarshipPlanPanel from "@/components/ScholarshipPlanPanel";
import DeleteScholarshipButton from "@/components/DeleteScholarshipButton";
import SchoolLogo from "@/components/SchoolLogo";

export default async function ScholarshipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scholarship = await getSavedScholarshipById(id);
  if (!scholarship) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/scholarships" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
            ← All scholarships
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{scholarship.name}</h1>
          <p className="mt-1.5 text-[15px] text-gray-500">
            {scholarship.provider ?? "Provider not noted"}
            {scholarship.url && (
              <>
                {" · "}
                <a href={scholarship.url} target="_blank" rel="noreferrer" className={link}>
                  Official page ↗
                </a>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/scholarships/${scholarship.id}/edit`} className={`${btnSecondary} !px-4 !py-2`}>
            Edit
          </Link>
          <DeleteScholarshipButton scholarshipId={scholarship.id} scholarshipName={scholarship.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className={`${card} p-5 lg:col-span-3 lg:self-start`}>
          <h2 className="mb-4 text-base font-semibold tracking-tight text-gray-900">Details</h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            <Detail label="Deadline">
              <span className="flex items-center gap-2">
                {formatDate(scholarship.deadlineDate)}
                {scholarship.deadlineDate && <DeadlineBadge date={scholarship.deadlineDate} />}
              </span>
            </Detail>
            <Detail label="Amount">{formatMoney(scholarship.amount, scholarship.currency)}</Detail>
            <Detail label="Coverage">{scholarship.coverage ?? "—"}</Detail>
            <Detail label="For school">
              {scholarship.school ? (
                <Link href={`/schools/${scholarship.school.id}`} className="flex items-center gap-2">
                  <SchoolLogo name={scholarship.school.name} website={scholarship.school.website} size={20} />
                  <span className={link}>{scholarship.school.name}</span>
                </Link>
              ) : (
                "Any / not school-specific"
              )}
            </Detail>
            <div className="sm:col-span-2">
              <Detail label="Eligibility">
                <span className="whitespace-pre-line">{scholarship.eligibility ?? "—"}</span>
              </Detail>
            </div>
          </dl>
        </section>

        <div className="lg:col-span-2">
          <ScholarshipPlanPanel
            scholarshipId={scholarship.id}
            initialStatus={scholarship.status}
            initialChecklist={scholarship.taskChecklist}
            initialNotes={scholarship.notes}
          />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="text-gray-900">{children}</dd>
    </div>
  );
}
