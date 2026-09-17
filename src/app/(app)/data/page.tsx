import { getSchoolCount } from "@/lib/queries";
import ImportExportPanel from "@/components/ImportExportPanel";

export const dynamic = "force-dynamic";

export default async function DataPage() {
  const count = await getSchoolCount();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Data</h1>
        <p className="mt-1.5 text-[15px] text-gray-500">
          {count} school{count === 1 ? "" : "s"} currently tracked. Back up your data or move it between deployments.
        </p>
      </div>
      <ImportExportPanel />
    </div>
  );
}
