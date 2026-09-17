import AddSchoolTabs from "@/components/AddSchoolTabs";

export default function NewSchoolPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Add a school</h1>
        <p className="mt-1.5 text-[15px] text-gray-500">
          Enter this cycle&apos;s dates and requirements from the school&apos;s admissions page, or import one you
          already have as JSON.
        </p>
      </div>
      <AddSchoolTabs />
    </div>
  );
}
