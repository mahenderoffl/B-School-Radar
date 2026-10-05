export type SavedScholarshipPayload = {
  name: string;
  provider?: string;
  url?: string;
  amount?: number | null;
  currency: string;
  coverage?: string;
  deadlineDate?: string;
  eligibility?: string;
  schoolId?: string | null;
};

/** Maps the form payload onto the columns it owns — plan fields (status, checklist, notes) are saved separately. */
export function savedScholarshipData(body: SavedScholarshipPayload) {
  return {
    name: body.name,
    provider: body.provider || null,
    url: body.url || null,
    amount: body.amount ?? null,
    currency: body.currency || "USD",
    coverage: body.coverage || null,
    deadlineDate: body.deadlineDate ? new Date(body.deadlineDate) : null,
    eligibility: body.eligibility || null,
    schoolId: body.schoolId || null,
  };
}
