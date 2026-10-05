import { notFound } from "next/navigation";
import { getSavedScholarshipById, getSchoolOptions } from "@/lib/queries";
import ScholarshipForm from "@/components/ScholarshipForm";

export default async function EditScholarshipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [scholarship, schools] = await Promise.all([getSavedScholarshipById(id), getSchoolOptions()]);
  if (!scholarship) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Edit {scholarship.name}</h1>
        <p className="mt-1.5 text-[15px] text-gray-500">Update the details after checking the scholarship&apos;s official page.</p>
      </div>
      <ScholarshipForm
        mode="edit"
        scholarshipId={scholarship.id}
        schools={schools}
        initial={{
          name: scholarship.name,
          provider: scholarship.provider,
          url: scholarship.url,
          amount: scholarship.amount,
          currency: scholarship.currency,
          coverage: scholarship.coverage,
          deadlineDate: scholarship.deadlineDate?.toISOString(),
          eligibility: scholarship.eligibility,
          schoolId: scholarship.schoolId,
        }}
      />
    </div>
  );
}
