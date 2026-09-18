import { prisma } from "@/lib/db";
import {
  PROGRAM_FORMATS,
  INTAKE_STATUSES,
  REQUIREMENT_TYPES,
  SCHOLARSHIP_TYPES,
  APPLICATION_STAGES,
  normalizeEnumGuess,
} from "@/lib/enums";

export const EXPORT_VERSION = 1;

const schoolInclude = {
  programs: {
    include: {
      cost: true,
      intakes: { include: { rounds: { include: { applicationStatus: true } } } },
      requirements: true,
      scholarships: true,
    },
  },
} as const;

export async function exportAllData() {
  const schools = await prisma.school.findMany({
    include: schoolInclude,
    orderBy: { name: "asc" as const },
  });

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    schools,
  };
}

export async function exportSchoolById(id: string) {
  const school = await prisma.school.findUnique({
    where: { id },
    include: schoolInclude,
  });

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    schools: school ? [school] : [],
  };
}

class ImportValidationError extends Error {}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ImportValidationError(`Missing or invalid "${field}"`);
  }
  return value;
}

function requireNumber(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new ImportValidationError(`Missing or invalid "${field}"`);
  }
  return n;
}

function requireEnum<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  if (value == null || value === "") {
    throw new ImportValidationError(`Missing "${field}" — must be one of ${allowed.join(", ")}`);
  }
  const normalized = typeof value === "string" ? normalizeEnumGuess(value) : String(value);
  if (!allowed.includes(normalized as T)) {
    throw new ImportValidationError(
      `Invalid "${field}": "${String(value)}" — must be one of ${allowed.join(", ")}`
    );
  }
  return normalized as T;
}

function optionalEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
  fallback: T
): T {
  if (value == null || value === "") return fallback;
  return requireEnum(value, allowed, field);
}

function requireDate(value: unknown, field: string): Date {
  const str = requireString(value, field);
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) {
    throw new ImportValidationError(`Invalid "${field}": "${str}" is not a valid date (use YYYY-MM-DD)`);
  }
  return date;
}

function optionalDate(value: unknown, field: string): Date | null {
  if (value == null || value === "") return null;
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) {
    throw new ImportValidationError(`Invalid "${field}": "${String(value)}" is not a valid date (use YYYY-MM-DD)`);
  }
  return date;
}

/** Cost fields are optional estimates — a stray non-numeric value becomes null rather than failing the import. */
function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export { ImportValidationError };

/**
 * Accepts anything reasonable: a full export ({ schools: [...] }), a bare
 * array of schools, or a single school object — so a school pasted by hand
 * doesn't need to be wrapped just to satisfy the format.
 */
function normalizeSchoolsPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.schools)) return obj.schools;
    if (typeof obj.name === "string") return [obj];
  }
  throw new ImportValidationError(
    'Expected a school object, a list of schools, or an export file (an object with a "schools" array).'
  );
}

/**
 * Recreates schools from an export payload. IDs from the export are ignored —
 * every record gets a fresh id — so importing is always additive at the
 * database level; `replace` just clears existing data first.
 */
export async function importData(payload: unknown, { replace }: { replace: boolean }) {
  const schools = normalizeSchoolsPayload(payload);

  if (replace) {
    await prisma.school.deleteMany();
  }

  let imported = 0;
  for (const raw of schools) {
    const s = raw as Record<string, unknown>;
    const programs = Array.isArray(s.programs) ? (s.programs as Record<string, unknown>[]) : [];

    await prisma.school.create({
      data: {
        name: requireString(s.name, "school.name"),
        country: requireString(s.country, "school.country"),
        city: requireString(s.city, "school.city"),
        globalRanking: s.globalRanking != null ? Number(s.globalRanking) : null,
        website: typeof s.website === "string" ? s.website : null,
        programs: {
          create: programs.map((p) => {
            const requirements = Array.isArray(p.requirements) ? (p.requirements as Record<string, unknown>[]) : [];
            const scholarships = Array.isArray(p.scholarships) ? (p.scholarships as Record<string, unknown>[]) : [];
            const intakes = Array.isArray(p.intakes) ? (p.intakes as Record<string, unknown>[]) : [];
            const cost = (p.cost as Record<string, unknown> | null | undefined) ?? undefined;

            return {
              name: requireString(p.name, "program.name"),
              format: optionalEnum(p.format, PROGRAM_FORMATS, "program.format", "FULL_TIME"),
              durationMonths: p.durationMonths != null ? Number(p.durationMonths) : null,
              cost: cost
                ? {
                    create: {
                      currency: typeof cost.currency === "string" ? cost.currency : "USD",
                      tuitionYear1: numOrNull(cost.tuitionYear1),
                      tuitionYear2: numOrNull(cost.tuitionYear2),
                      livingCostYear1: numOrNull(cost.livingCostYear1),
                      livingCostYear2: numOrNull(cost.livingCostYear2),
                      healthInsurance: numOrNull(cost.healthInsurance),
                      applicationFee: numOrNull(cost.applicationFee),
                      visaFee: numOrNull(cost.visaFee),
                      booksAndSupplies: numOrNull(cost.booksAndSupplies),
                      otherFees: numOrNull(cost.otherFees),
                      otherFeesNote: typeof cost.otherFeesNote === "string" ? cost.otherFeesNote : null,
                    },
                  }
                : undefined,
              requirements: {
                create: requirements.map((r) => ({
                  type: requireEnum(r.type, REQUIREMENT_TYPES, "requirement.type"),
                  mandatory: r.mandatory !== false,
                  waiverCondition: typeof r.waiverCondition === "string" ? r.waiverCondition : null,
                  minScore: r.minScore != null ? Number(r.minScore) : null,
                })),
              },
              scholarships: {
                create: scholarships.map((sc) => ({
                  name: requireString(sc.name, "scholarship.name"),
                  type: optionalEnum(sc.type, SCHOLARSHIP_TYPES, "scholarship.type", "MERIT"),
                  amountPct: sc.amountPct != null ? Number(sc.amountPct) : null,
                  deadlineDate: optionalDate(sc.deadlineDate, "scholarship.deadlineDate"),
                  requiresSeparateForm: sc.requiresSeparateForm === true,
                })),
              },
              intakes: {
                create: intakes.map((i) => {
                  const rounds = Array.isArray(i.rounds) ? (i.rounds as Record<string, unknown>[]) : [];
                  return {
                    startMonth: requireNumber(i.startMonth, "intake.startMonth"),
                    startYear: requireNumber(i.startYear, "intake.startYear"),
                    status: optionalEnum(i.status, INTAKE_STATUSES, "intake.status", "OPEN"),
                    rounds: {
                      create: rounds.map((r) => {
                        const status = r.applicationStatus as Record<string, unknown> | null | undefined;
                        return {
                          roundNumber: requireNumber(r.roundNumber, "round.roundNumber"),
                          deadlineDate: requireDate(r.deadlineDate, "round.deadlineDate"),
                          decisionDate: optionalDate(r.decisionDate, "round.decisionDate"),
                          notes: typeof r.notes === "string" ? r.notes : null,
                          applicationStatus: {
                            create: {
                              status: optionalEnum(
                                status?.status,
                                APPLICATION_STAGES,
                                "applicationStatus.status",
                                "NOT_STARTED"
                              ),
                              taskChecklist: typeof status?.taskChecklist === "string" ? status.taskChecklist : "[]",
                              notes: typeof status?.notes === "string" ? status.notes : null,
                            },
                          },
                        };
                      }),
                    },
                  };
                }),
              },
            };
          }),
        },
      },
    });
    imported++;
  }

  return imported;
}
