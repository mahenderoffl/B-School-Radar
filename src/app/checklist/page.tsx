import { getRoundFeed } from "@/lib/queries";
import { toRoundInfo } from "@/lib/checklist";
import ChecklistBoard from "@/components/ChecklistBoard";

export const dynamic = "force-dynamic";

export default async function ChecklistPage() {
  const rounds = await getRoundFeed();
  const active = rounds.filter((r) => {
    const status = r.applicationStatus?.status ?? "NOT_STARTED";
    return status === "NOT_STARTED" || status === "IN_PROGRESS";
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Checklist</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tasks grouped by type across every school still in progress — check one off here as easily as from the school page.
        </p>
      </div>
      <ChecklistBoard rounds={toRoundInfo(active)} />
    </div>
  );
}
