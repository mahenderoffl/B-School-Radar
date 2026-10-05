import { getSchoolOptions } from "@/lib/queries";
import ScholarshipForm from "@/components/ScholarshipForm";

export const dynamic = "force-dynamic";

export default async function NewScholarshipPage() {
  const schools = await getSchoolOptions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Save a scholarship</h1>
        <p className="mt-1.5 text-[15px] text-gray-500">
          Note down the details now — you&apos;ll get a checklist and notes to plan your application on the next page.
        </p>
      </div>
      <ScholarshipForm mode="create" schools={schools} />
    </div>
  );
}
