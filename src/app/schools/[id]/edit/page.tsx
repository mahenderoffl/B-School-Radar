import { notFound } from "next/navigation";
import { getSchoolById } from "@/lib/queries";
import SchoolForm, { type SchoolFormInitial } from "@/components/SchoolForm";

export default async function EditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const school = await getSchoolById(id);
  if (!school) notFound();

  const program = school.programs[0];
  const intake = program?.intakes[0];

  const initial: SchoolFormInitial = {
    name: school.name,
    country: school.country,
    city: school.city,
    globalRanking: school.globalRanking,
    website: school.website,
    programName: program?.name ?? "MBA",
    programFormat: program?.format ?? "FULL_TIME",
    durationMonths: program?.durationMonths,
    tuition: program?.tuition,
    currency: program?.currency,
    startMonth: intake?.startMonth ?? 9,
    startYear: intake?.startYear ?? new Date().getFullYear() + 1,
    rounds: (intake?.rounds ?? []).map((r) => ({
      roundNumber: r.roundNumber,
      deadlineDate: r.deadlineDate.toISOString(),
      decisionDate: r.decisionDate?.toISOString(),
      notes: r.notes ?? "",
    })),
    requirements: (program?.requirements ?? []).map((r) => ({
      type: r.type,
      mandatory: r.mandatory,
      waiverCondition: r.waiverCondition ?? "",
      minScore: r.minScore,
    })),
    scholarships: (program?.scholarships ?? []).map((s) => ({
      name: s.name,
      type: s.type,
      amountPct: s.amountPct,
      deadlineDate: s.deadlineDate?.toISOString(),
      requiresSeparateForm: s.requiresSeparateForm,
    })),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Edit {school.name}</h1>
        <p className="mt-1.5 text-[15px] text-gray-500">Update dates and requirements after checking the school&apos;s official page.</p>
      </div>
      <SchoolForm mode="edit" schoolId={school.id} initial={initial} />
    </div>
  );
}
