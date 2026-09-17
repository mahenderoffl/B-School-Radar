"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { REQUIREMENT_LABELS, SCHOLARSHIP_TYPE_LABELS, PROGRAM_FORMAT_LABELS, MONTH_NAMES } from "@/lib/utils";
import type { SchoolFormPayload, RequirementInput, ScholarshipInput, RoundInput } from "@/lib/schoolForm";
import { btnPrimary, btnSecondary, btnGhost, btnDangerOutline, card, inputClass } from "@/lib/ui";

const REQUIREMENT_TYPES = Object.keys(REQUIREMENT_LABELS);
const SCHOLARSHIP_TYPES = Object.keys(SCHOLARSHIP_TYPE_LABELS);
const PROGRAM_FORMATS = Object.keys(PROGRAM_FORMAT_LABELS);

function toDateInput(d?: string | Date | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export type SchoolFormInitial = {
  name: string;
  country: string;
  city: string;
  globalRanking?: number | null;
  website?: string | null;
  programName: string;
  programFormat: string;
  durationMonths?: number | null;
  tuition?: number | null;
  currency?: string | null;
  startMonth: number;
  startYear: number;
  rounds: (RoundInput & { deadlineDate: string; decisionDate?: string })[];
  requirements: RequirementInput[];
  scholarships: (ScholarshipInput & { deadlineDate?: string })[];
};

const emptyRound = (n: number): RoundInput => ({ roundNumber: n, deadlineDate: "", decisionDate: "", notes: "" });
const emptyRequirement = (): RequirementInput => ({ type: "GMAT" as RequirementInput["type"], mandatory: true, waiverCondition: "", minScore: undefined });
const emptyScholarship = (): ScholarshipInput => ({ name: "", type: "MERIT" as ScholarshipInput["type"], amountPct: undefined, deadlineDate: "", requiresSeparateForm: false });

export default function SchoolForm({
  mode,
  schoolId,
  initial,
}: {
  mode: "create" | "edit";
  schoolId?: string;
  initial?: SchoolFormInitial;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [globalRanking, setGlobalRanking] = useState(initial?.globalRanking?.toString() ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");

  const [programName, setProgramName] = useState(initial?.programName ?? "MBA");
  const [programFormat, setProgramFormat] = useState(initial?.programFormat ?? "FULL_TIME");
  const [durationMonths, setDurationMonths] = useState(initial?.durationMonths?.toString() ?? "");
  const [tuition, setTuition] = useState(initial?.tuition?.toString() ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "USD");
  const [startMonth, setStartMonth] = useState(initial?.startMonth ?? 9);
  const [startYear, setStartYear] = useState(initial?.startYear ?? new Date().getFullYear() + 1);

  const [rounds, setRounds] = useState<RoundInput[]>(
    initial?.rounds.map((r) => ({ ...r, deadlineDate: toDateInput(r.deadlineDate), decisionDate: toDateInput(r.decisionDate) })) ?? [emptyRound(1)]
  );
  const [requirements, setRequirements] = useState<RequirementInput[]>(initial?.requirements ?? [emptyRequirement()]);
  const [scholarships, setScholarships] = useState<ScholarshipInput[]>(
    initial?.scholarships.map((s) => ({ ...s, deadlineDate: toDateInput(s.deadlineDate) })) ?? []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: SchoolFormPayload = {
      name,
      country,
      city,
      globalRanking: globalRanking ? Number(globalRanking) : null,
      website: website || undefined,
      programName,
      programFormat: programFormat as SchoolFormPayload["programFormat"],
      durationMonths: durationMonths ? Number(durationMonths) : null,
      tuition: tuition ? Number(tuition) : null,
      currency,
      startMonth: Number(startMonth),
      startYear: Number(startYear),
      rounds: rounds
        .filter((r) => r.deadlineDate)
        .map((r) => ({ ...r, roundNumber: Number(r.roundNumber) })),
      requirements,
      scholarships: scholarships.filter((s) => s.name),
    };

    try {
      const res = await fetch(mode === "create" ? "/api/schools" : `/api/schools/${schoolId}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      const result = mode === "create" ? await res.json() : null;
      router.push(`/schools/${mode === "create" ? result.id : schoolId}`);
      router.refresh();
    } catch {
      setError("Something went wrong saving this school. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <section className={`${card} p-5`}>
        <h2 className="mb-4 text-base font-semibold tracking-tight text-gray-900">School</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Website">
            <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://…" />
          </Field>
          <Field label="Country" required>
            <input required value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
          </Field>
          <Field label="City" required>
            <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Global ranking">
            <input type="number" value={globalRanking} onChange={(e) => setGlobalRanking(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className={`${card} p-5`}>
        <h2 className="mb-4 text-base font-semibold tracking-tight text-gray-900">Program</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Program name" required>
            <input required value={programName} onChange={(e) => setProgramName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Format">
            <select value={programFormat} onChange={(e) => setProgramFormat(e.target.value)} className={inputClass}>
              {PROGRAM_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {PROGRAM_FORMAT_LABELS[f]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Duration (months)">
            <input type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Tuition">
            <input type="number" value={tuition} onChange={(e) => setTuition(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Currency">
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Intake start month">
            <select value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))} className={inputClass}>
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Intake start year">
            <input type="number" value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className={`${card} p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-gray-900">Rounds</h2>
          <button type="button" onClick={() => setRounds([...rounds, emptyRound(rounds.length + 1)])} className={btnGhost}>
            + Add round
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {rounds.map((r, i) => (
            <div key={i} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-5">
              <Field label="Round #">
                <input
                  type="number"
                  value={r.roundNumber}
                  onChange={(e) => setRounds(rounds.map((x, j) => (j === i ? { ...x, roundNumber: Number(e.target.value) } : x)))}
                  className={inputClass}
                />
              </Field>
              <Field label="Deadline">
                <input
                  type="date"
                  value={r.deadlineDate}
                  onChange={(e) => setRounds(rounds.map((x, j) => (j === i ? { ...x, deadlineDate: e.target.value } : x)))}
                  className={inputClass}
                />
              </Field>
              <Field label="Decision date">
                <input
                  type="date"
                  value={r.decisionDate ?? ""}
                  onChange={(e) => setRounds(rounds.map((x, j) => (j === i ? { ...x, decisionDate: e.target.value } : x)))}
                  className={inputClass}
                />
              </Field>
              <Field label="Notes">
                <input
                  value={r.notes ?? ""}
                  onChange={(e) => setRounds(rounds.map((x, j) => (j === i ? { ...x, notes: e.target.value } : x)))}
                  className={inputClass}
                />
              </Field>
              <button type="button" onClick={() => setRounds(rounds.filter((_, j) => j !== i))} className={btnDangerOutline}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={`${card} p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-gray-900">Test requirements</h2>
          <button type="button" onClick={() => setRequirements([...requirements, emptyRequirement()])} className={btnGhost}>
            + Add requirement
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {requirements.map((r, i) => (
            <div key={i} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-5">
              <Field label="Type">
                <select
                  value={r.type}
                  onChange={(e) => setRequirements(requirements.map((x, j) => (j === i ? { ...x, type: e.target.value as RequirementInput["type"] } : x)))}
                  className={inputClass}
                >
                  {REQUIREMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {REQUIREMENT_LABELS[t]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mandatory">
                <select
                  value={r.mandatory ? "yes" : "no"}
                  onChange={(e) => setRequirements(requirements.map((x, j) => (j === i ? { ...x, mandatory: e.target.value === "yes" } : x)))}
                  className={inputClass}
                >
                  <option value="yes">Mandatory</option>
                  <option value="no">Waivable</option>
                </select>
              </Field>
              <Field label="Min score">
                <input
                  type="number"
                  value={r.minScore ?? ""}
                  onChange={(e) => setRequirements(requirements.map((x, j) => (j === i ? { ...x, minScore: e.target.value ? Number(e.target.value) : undefined } : x)))}
                  className={inputClass}
                />
              </Field>
              <Field label="Waiver condition / notes">
                <input
                  value={r.waiverCondition ?? ""}
                  onChange={(e) => setRequirements(requirements.map((x, j) => (j === i ? { ...x, waiverCondition: e.target.value } : x)))}
                  className={inputClass}
                />
              </Field>
              <button
                type="button"
                onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}
                className={btnDangerOutline}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={`${card} p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-gray-900">Scholarships</h2>
          <button type="button" onClick={() => setScholarships([...scholarships, emptyScholarship()])} className={btnGhost}>
            + Add scholarship
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {scholarships.map((s, i) => (
            <div key={i} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-6">
              <Field label="Name">
                <input
                  value={s.name}
                  onChange={(e) => setScholarships(scholarships.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  className={inputClass}
                />
              </Field>
              <Field label="Type">
                <select
                  value={s.type}
                  onChange={(e) => setScholarships(scholarships.map((x, j) => (j === i ? { ...x, type: e.target.value as ScholarshipInput["type"] } : x)))}
                  className={inputClass}
                >
                  {SCHOLARSHIP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {SCHOLARSHIP_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Amount %">
                <input
                  type="number"
                  value={s.amountPct ?? ""}
                  onChange={(e) => setScholarships(scholarships.map((x, j) => (j === i ? { ...x, amountPct: e.target.value ? Number(e.target.value) : undefined } : x)))}
                  className={inputClass}
                />
              </Field>
              <Field label="Deadline">
                <input
                  type="date"
                  value={s.deadlineDate ?? ""}
                  onChange={(e) => setScholarships(scholarships.map((x, j) => (j === i ? { ...x, deadlineDate: e.target.value } : x)))}
                  className={inputClass}
                />
              </Field>
              <Field label="Separate form?">
                <select
                  value={s.requiresSeparateForm ? "yes" : "no"}
                  onChange={(e) => setScholarships(scholarships.map((x, j) => (j === i ? { ...x, requiresSeparateForm: e.target.value === "yes" } : x)))}
                  className={inputClass}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </Field>
              <button
                type="button"
                onClick={() => setScholarships(scholarships.filter((_, j) => j !== i))}
                className={btnDangerOutline}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting ? "Saving…" : mode === "create" ? "Add school" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
