export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatMonthYear(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1] ?? "?"} ${year}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function daysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target.getTime() - startOfToday.getTime()) / msPerDay);
}

export type Urgency = "closed" | "urgent" | "soon" | "open" | "faraway";

export function getUrgency(deadlineDate: Date | string): {
  urgency: Urgency;
  daysRemaining: number;
  label: string;
  badgeClasses: string;
} {
  const daysRemaining = daysUntil(deadlineDate);

  if (daysRemaining < 0) {
    return {
      urgency: "closed",
      daysRemaining,
      label: "Closed",
      badgeClasses: "bg-gray-100 text-gray-500",
    };
  }
  if (daysRemaining <= 7) {
    return {
      urgency: "urgent",
      daysRemaining,
      label: daysRemaining === 0 ? "Due today" : `${daysRemaining}d left`,
      badgeClasses: "bg-red-100 text-red-700",
    };
  }
  if (daysRemaining <= 30) {
    return {
      urgency: "soon",
      daysRemaining,
      label: `${daysRemaining}d left`,
      badgeClasses: "bg-amber-100 text-amber-800",
    };
  }
  if (daysRemaining <= 90) {
    return {
      urgency: "open",
      daysRemaining,
      label: `${daysRemaining}d left`,
      badgeClasses: "bg-emerald-100 text-emerald-700",
    };
  }
  return {
    urgency: "faraway",
    daysRemaining,
    label: `${daysRemaining}d left`,
    badgeClasses: "bg-blue-100 text-blue-700",
  };
}

export const REQUIREMENT_LABELS: Record<string, string> = {
  GMAT: "GMAT",
  GRE: "GRE",
  IELTS: "IELTS",
  TOEFL: "TOEFL",
  IEGAT: "ieGAT",
  OTHER: "Other",
};

export const SCHOLARSHIP_TYPE_LABELS: Record<string, string> = {
  MERIT: "Merit-based",
  NEED: "Need-based",
  DIVERSITY: "Diversity",
  OTHER: "Other",
};

export const APPLICATION_STAGE_LABELS: Record<string, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  WAITLISTED: "Waitlisted",
  ADMITTED: "Admitted",
  REJECTED: "Rejected",
};

export const APPLICATION_STAGE_CLASSES: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  SUBMITTED: "bg-violet-100 text-violet-700",
  WAITLISTED: "bg-amber-100 text-amber-700",
  ADMITTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export const PROGRAM_FORMAT_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  EXECUTIVE: "Executive",
  ONLINE: "Online",
};

export type ProgramCostFields = {
  currency: string;
  tuitionYear1: number | null;
  tuitionYear2: number | null;
  livingCostYear1: number | null;
  livingCostYear2: number | null;
  healthInsurance: number | null;
  applicationFee: number | null;
  visaFee: number | null;
  booksAndSupplies: number | null;
  otherFees: number | null;
  otherFeesNote?: string | null;
};

export const COST_LINE_LABELS: Record<
  keyof Omit<ProgramCostFields, "currency" | "otherFeesNote">,
  string
> = {
  tuitionYear1: "Tuition — Year 1",
  tuitionYear2: "Tuition — Year 2",
  livingCostYear1: "Living costs — Year 1 (est.)",
  livingCostYear2: "Living costs — Year 2 (est.)",
  healthInsurance: "Health insurance",
  applicationFee: "Application fee",
  visaFee: "Visa / immigration fee",
  booksAndSupplies: "Books & supplies",
  otherFees: "Other fees",
};

export function formatMoney(amount: number | null | undefined, currency: string): string {
  if (amount == null) return "—";
  return `${amount.toLocaleString()} ${currency}`;
}

/** Sums every cost line that's actually been entered — an honest estimate, not a guess at what's missing. */
export function totalProgramCost(cost: ProgramCostFields | null | undefined): number | null {
  if (!cost) return null;
  const fields: (keyof typeof COST_LINE_LABELS)[] = [
    "tuitionYear1",
    "tuitionYear2",
    "livingCostYear1",
    "livingCostYear2",
    "healthInsurance",
    "applicationFee",
    "visaFee",
    "booksAndSupplies",
    "otherFees",
  ];
  const values = fields.map((f) => cost[f]).filter((v): v is number => v != null);
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) : null;
}

export function parseChecklist(json: string): { id: string; label: string; done: boolean }[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const DEFAULT_CHECKLIST_ITEMS = [
  "Test scores submitted",
  "Essays drafted",
  "Letters of recommendation",
  "Transcripts uploaded",
  "Application fee paid",
  "Scholarship form (if applicable)",
];
