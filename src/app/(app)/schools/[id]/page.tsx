import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchoolById } from "@/lib/queries";
import {
  formatDate,
  formatMonthYear,
  formatMoney,
  totalProgramCost,
  COST_LINE_LABELS,
  REQUIREMENT_LABELS,
  SCHOLARSHIP_TYPE_LABELS,
  PROGRAM_FORMAT_LABELS,
} from "@/lib/utils";
import DeadlineBadge from "@/components/DeadlineBadge";
import RoundStatusPanel from "@/components/RoundStatusPanel";
import DeleteSchoolButton from "@/components/DeleteSchoolButton";
import SchoolLogo from "@/components/SchoolLogo";
import { btnSecondary, card, link } from "@/lib/ui";

export default async function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const school = await getSchoolById(id);
  if (!school) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <SchoolLogo name={school.name} website={school.website} size={56} className="mt-1" />
          <div>
            <Link href="/schools" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
              ← All schools
            </Link>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{school.name}</h1>
            <p className="mt-1.5 text-[15px] text-gray-500">
              {school.city}, {school.country}
              {school.globalRanking ? ` · Rank #${school.globalRanking}` : ""}
              {school.website && (
                <>
                  {" · "}
                  <a href={school.website} target="_blank" rel="noreferrer" className={link}>
                    Website ↗
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/api/schools/${school.id}/export`} download className={`${btnSecondary} !px-4 !py-2`}>
            Export
          </a>
          <Link href={`/schools/${school.id}/edit`} className={`${btnSecondary} !px-4 !py-2`}>
            Edit
          </Link>
          <DeleteSchoolButton schoolId={school.id} schoolName={school.name} />
        </div>
      </div>

      {school.programs.map((program) => (
        <div key={program.id} className="flex flex-col gap-6">
          <div className={`${card} p-5`}>
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">{program.name}</h2>
            <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-gray-500">Format</dt>
                <dd className="text-gray-800">{PROGRAM_FORMAT_LABELS[program.format]}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Duration</dt>
                <dd className="text-gray-800">{program.durationMonths ? `${program.durationMonths} months` : "—"}</dd>
              </div>
            </dl>
          </div>

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-base font-semibold tracking-tight text-gray-900">Cost of attendance</h3>
              {(() => {
                const total = totalProgramCost(program.cost);
                return total != null ? (
                  <span className="text-sm text-gray-500">
                    Estimated total: <span className="font-semibold text-gray-800">{formatMoney(total, program.cost!.currency)}</span>
                  </span>
                ) : null;
              })()}
            </div>
            {!program.cost || totalProgramCost(program.cost) == null ? (
              <span className="text-sm text-gray-400">No cost data yet — add it via Edit or import.</span>
            ) : (
              <div className={`${card} overflow-hidden`}>
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {(Object.keys(COST_LINE_LABELS) as (keyof typeof COST_LINE_LABELS)[])
                      .filter((key) => program.cost![key] != null)
                      .map((key) => (
                        <tr key={key}>
                          <td className="px-4 py-2.5 text-gray-600">{COST_LINE_LABELS[key]}</td>
                          <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                            {formatMoney(program.cost![key] as number, program.cost!.currency)}
                          </td>
                        </tr>
                      ))}
                    {program.cost.otherFeesNote && (
                      <tr>
                        <td colSpan={2} className="px-4 py-2 text-xs text-gray-400">
                          Other fees: {program.cost.otherFeesNote}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-400">
              Estimate based on the fields entered — verify against the school&apos;s official cost of attendance page.
            </p>
          </section>

          <section>
            <h3 className="mb-3 text-base font-semibold tracking-tight text-gray-900">Requirements</h3>
            <div className="flex flex-wrap gap-2">
              {program.requirements.length === 0 && <span className="text-sm text-gray-400">No requirements listed.</span>}
              {program.requirements.map((r) => (
                <div key={r.id} className={`${card} px-3.5 py-2.5 text-sm`}>
                  <div className="flex items-center gap-2 font-medium text-gray-800">
                    {REQUIREMENT_LABELS[r.type]}
                    {!r.mandatory && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
                        waivable
                      </span>
                    )}
                  </div>
                  {r.minScore != null && <div className="text-gray-500">Min score: {r.minScore}</div>}
                  {r.waiverCondition && <div className="mt-0.5 text-xs text-gray-500">{r.waiverCondition}</div>}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-base font-semibold tracking-tight text-gray-900">Scholarships</h3>
            <div className="flex flex-col gap-2">
              {program.scholarships.length === 0 && <span className="text-sm text-gray-400">No scholarships listed.</span>}
              {program.scholarships.map((s) => (
                <div key={s.id} className={`${card} flex items-center justify-between px-4 py-3.5 text-sm`}>
                  <div>
                    <div className="font-medium text-gray-800">{s.name}</div>
                    <div className="text-gray-500">
                      {SCHOLARSHIP_TYPE_LABELS[s.type]}
                      {s.amountPct ? ` · up to ${s.amountPct}%` : ""}
                      {s.requiresSeparateForm ? " · separate form required" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{formatDate(s.deadlineDate)}</span>
                    {s.deadlineDate && <DeadlineBadge date={s.deadlineDate} />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-base font-semibold tracking-tight text-gray-900">Intakes & rounds</h3>
            <div className="flex flex-col gap-6">
              {program.intakes.map((intake) => (
                <div key={intake.id}>
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-0.5 text-sm">
                    <span className="font-medium text-gray-700">
                      Intake: <span className="font-semibold text-gray-900">{formatMonthYear(intake.startMonth, intake.startYear)}</span>
                    </span>
                    <span className="text-gray-500">
                      Classes commence: <span className="text-gray-700">{formatMonthYear(intake.startMonth, intake.startYear)}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {intake.rounds.map((round) => (
                      <div key={round.id} className="flex flex-col gap-3">
                        <div className={`${card} p-4`}>
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-800">Round {round.roundNumber}</div>
                            <DeadlineBadge date={round.deadlineDate} />
                          </div>
                          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div>
                              <dt className="text-gray-400">Application deadline</dt>
                              <dd className="font-medium text-gray-700">{formatDate(round.deadlineDate)}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-400">Decision date</dt>
                              <dd className="font-medium text-gray-700">{round.decisionDate ? formatDate(round.decisionDate) : "—"}</dd>
                            </div>
                          </dl>
                          {round.notes && <div className="mt-2 text-xs text-gray-400">{round.notes}</div>}
                        </div>
                        <RoundStatusPanel
                          roundId={round.id}
                          initialStatus={round.applicationStatus?.status ?? "NOT_STARTED"}
                          initialChecklist={round.applicationStatus?.taskChecklist ?? "[]"}
                          initialNotes={round.applicationStatus?.notes ?? null}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ))}
    </div>
  );
}
