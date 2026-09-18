// Shared with both the strict JSON/import validator (importExport.ts) and the
// tolerant CSV cell parser (importFile.ts) so the two never drift apart.

export const PROGRAM_FORMATS = ["FULL_TIME", "PART_TIME", "EXECUTIVE", "ONLINE"] as const;
export const INTAKE_STATUSES = ["UPCOMING", "OPEN", "CLOSED"] as const;
export const REQUIREMENT_TYPES = ["GMAT", "GRE", "IELTS", "TOEFL", "IEGAT", "OTHER"] as const;
export const SCHOLARSHIP_TYPES = ["MERIT", "NEED", "DIVERSITY", "OTHER"] as const;
export const APPLICATION_STAGES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "SUBMITTED",
  "WAITLISTED",
  "ADMITTED",
  "REJECTED",
] as const;

/** "Full Time" / "full-time" / "FULL_TIME" all normalize to the same enum spelling. */
export function normalizeEnumGuess(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]+/g, "_");
}
