import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchoolById } from "@/lib/queries";
import {
  formatDate,
  formatMonthYear,
  REQUIREMENT_LABELS,
  SCHOLARSHIP_TYPE_LABELS,
  PROGRAM_FORMAT_LABELS,
} from "@/lib/utils";
import DeadlineBadge from "@/components/DeadlineBadge";
import RoundStatusPanel from "@/components/RoundStatusPanel";
import DeleteSchoolButton from "@/components/DeleteSchoolButton";

export default async function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const school = await getSchoolById(id);
  if (!school) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/schools" className="text-sm text-gray-500 hover:underline">
            ← All schools
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">{school.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {school.city}, {school.country}
            {school.globalRanking ? ` · Rank #${school.globalRanking}` : ""}
            {school.website && (
              <>
                {" · "}
                <a href={school.website} target="_blank" rel="noreferrer" className="text-gray-600 hover:underline">
                  Website ↗
                </a>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/schools/${school.id}/edit`}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>
          <DeleteSchoolButton schoolId={school.id} />
        </div>
      </div>

      {school.programs.map((program) => (
        <div key={program.id} className="flex flex-col gap-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-lg font-medium text-gray-900">{program.name}</h2>
            <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-gray-500">Format</dt>
                <dd className="text-gray-800">{PROGRAM_FORMAT_LABELS[program.format]}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Duration</dt>
                <dd className="text-gray-800">{program.durationMonths ? `${program.durationMonths} months` : "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Tuition</dt>
                <dd className="text-gray-800">
                  {program.tuition ? `${program.tuition.toLocaleString()} ${program.currency ?? ""}` : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <section>
            <h3 className="mb-3 text-base font-medium text-gray-900">Requirements</h3>
            <div className="flex flex-wrap gap-2">
              {program.requirements.length === 0 && <span className="text-sm text-gray-400">No requirements listed.</span>}
              {program.requirements.map((r) => (
                <div key={r.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
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
            <h3 className="mb-3 text-base font-medium text-gray-900">Scholarships</h3>
            <div className="flex flex-col gap-2">
              {program.scholarships.length === 0 && <span className="text-sm text-gray-400">No scholarships listed.</span>}
              {program.scholarships.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                >
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
            <h3 className="mb-3 text-base font-medium text-gray-900">Intakes & rounds</h3>
            <div className="flex flex-col gap-6">
              {program.intakes.map((intake) => (
                <div key={intake.id}>
                  <div className="mb-2 text-sm font-medium text-gray-600">
                    {formatMonthYear(intake.startMonth, intake.startYear)} intake
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {intake.rounds.map((round) => (
                      <div key={round.id} className="flex flex-col gap-3">
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-800">Round {round.roundNumber}</div>
                            <DeadlineBadge date={round.deadlineDate} />
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            Deadline: {formatDate(round.deadlineDate)}
                            {round.decisionDate && ` · Decision: ${formatDate(round.decisionDate)}`}
                          </div>
                          {round.notes && <div className="mt-1 text-xs text-gray-400">{round.notes}</div>}
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
