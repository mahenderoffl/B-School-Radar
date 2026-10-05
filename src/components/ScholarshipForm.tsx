"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SavedScholarshipPayload } from "@/lib/scholarshipForm";
import { btnPrimary, btnSecondary, card, inputClass } from "@/lib/ui";

function toDateInput(d?: string | Date | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export type ScholarshipFormInitial = {
  name: string;
  provider?: string | null;
  url?: string | null;
  amount?: number | null;
  currency: string;
  coverage?: string | null;
  deadlineDate?: string | null;
  eligibility?: string | null;
  schoolId?: string | null;
};

export default function ScholarshipForm({
  mode,
  scholarshipId,
  initial,
  schools,
}: {
  mode: "create" | "edit";
  scholarshipId?: string;
  initial?: ScholarshipFormInitial;
  schools: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [provider, setProvider] = useState(initial?.provider ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "USD");
  const [coverage, setCoverage] = useState(initial?.coverage ?? "");
  const [deadlineDate, setDeadlineDate] = useState(toDateInput(initial?.deadlineDate));
  const [eligibility, setEligibility] = useState(initial?.eligibility ?? "");
  const [schoolId, setSchoolId] = useState(initial?.schoolId ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: SavedScholarshipPayload = {
      name,
      provider,
      url,
      amount: amount ? Number(amount) : null,
      currency,
      coverage,
      deadlineDate: deadlineDate || undefined,
      eligibility,
      schoolId: schoolId || null,
    };

    try {
      const res = await fetch(mode === "create" ? "/api/scholarships" : `/api/scholarships/${scholarshipId}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      const result = mode === "create" ? await res.json() : null;
      router.push(`/scholarships/${mode === "create" ? result.id : scholarshipId}`);
      router.refresh();
    } catch {
      setError("Something went wrong saving this scholarship. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <section className={`${card} p-5`}>
        <h2 className="mb-4 text-base font-semibold tracking-tight text-gray-900">Scholarship</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Tata Scholarship" />
          </Field>
          <Field label="Provider">
            <input value={provider} onChange={(e) => setProvider(e.target.value)} className={inputClass} placeholder="Foundation, employer, government…" />
          </Field>
          <Field label="Link">
            <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} placeholder="https://…" />
          </Field>
          <Field label="Deadline">
            <input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Amount">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Currency">
            <input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} className={inputClass} />
          </Field>
          <Field label="Coverage">
            <input value={coverage} onChange={(e) => setCoverage(e.target.value)} className={inputClass} placeholder="Full tuition, 50% tuition, living stipend…" />
          </Field>
          <Field label="For school">
            <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className={inputClass}>
              <option value="">Any / not school-specific</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Eligibility">
              <textarea
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="Nationality, work experience, income limits, bond / return-to-country conditions…"
              />
            </Field>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting ? "Saving…" : mode === "create" ? "Save scholarship" : "Save changes"}
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
