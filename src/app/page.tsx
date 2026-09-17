import Link from "next/link";
import { getRoundFeed, getScholarshipFeed } from "@/lib/queries";
import { daysUntil, formatDate, getUrgency, APPLICATION_STAGE_LABELS, APPLICATION_STAGE_CLASSES } from "@/lib/utils";
import { tableCard, link } from "@/lib/ui";
import DeadlineBadge from "@/components/DeadlineBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [rounds, scholarships] = await Promise.all([getRoundFeed(), getScholarshipFeed()]);

  const openRounds = rounds
    .filter((r) => daysUntil(r.deadlineDate) >= 0)
    .filter((r) => r.applicationStatus?.status !== "SUBMITTED" && r.applicationStatus?.status !== "REJECTED");

  const urgent = openRounds.filter((r) => getUrgency(r.deadlineDate).urgency === "urgent");
  const soon = openRounds.filter((r) => getUrgency(r.deadlineDate).urgency === "soon");

  const openScholarships = scholarships.filter((s) => s.deadlineDate && daysUntil(s.deadlineDate) >= 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-1.5 text-[15px] text-gray-500">Every open application round, sorted by how soon it closes.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Due within 7 days" value={urgent.length} tone="urgent" />
        <StatCard label="Due within 30 days" value={soon.length} tone="soon" />
        <StatCard label="Scholarship deadlines open" value={openScholarships.length} tone="open" />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-gray-900">Application rounds</h2>
        {openRounds.length === 0 ? (
          <EmptyState text="No open rounds. Add a school to get started." />
        ) : (
          <div className={tableCard}>
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Round</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {openRounds.map((r) => {
                  const school = r.intake.program.school;
                  const status = r.applicationStatus?.status ?? "NOT_STARTED";
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Link href={`/schools/${school.id}`} className={link}>
                          {school.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.intake.program.name}</td>
                      <td className="px-4 py-3 text-gray-600">Round {r.roundNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(r.deadlineDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${APPLICATION_STAGE_CLASSES[status]}`}>
                          {APPLICATION_STAGE_LABELS[status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeadlineBadge date={r.deadlineDate} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
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
                      <Link href={`/schools/${s.program.school.id}`} className={link}>
                        {s.program.school.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(s.deadlineDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <DeadlineBadge date={s.deadlineDate!} />
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

function StatCard({ label, value, tone }: { label: string; value: number; tone: "urgent" | "soon" | "open" }) {
  const toneClasses = {
    urgent: "bg-red-50 text-red-700",
    soon: "bg-amber-50 text-amber-800",
    open: "bg-emerald-50 text-emerald-700",
  }[tone];
  return (
    <div className={`rounded-2xl px-5 py-5 shadow-sm ring-1 ring-black/5 transition-shadow duration-200 hover:shadow-md ${toneClasses}`}>
      <div className="text-4xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 px-4 py-10 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}
