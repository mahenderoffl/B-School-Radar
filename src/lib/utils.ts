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
