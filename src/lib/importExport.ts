import { prisma } from "@/lib/db";

export const EXPORT_VERSION = 1;

const schoolInclude = {
  programs: {
    include: {
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

            return {
              name: requireString(p.name, "program.name"),
              format: (p.format as never) ?? "FULL_TIME",
              durationMonths: p.durationMonths != null ? Number(p.durationMonths) : null,
              tuition: p.tuition != null ? Number(p.tuition) : null,
              currency: typeof p.currency === "string" ? p.currency : "USD",
              requirements: {
                create: requirements.map((r) => ({
                  type: r.type as never,
                  mandatory: r.mandatory !== false,
                  waiverCondition: typeof r.waiverCondition === "string" ? r.waiverCondition : null,
                  minScore: r.minScore != null ? Number(r.minScore) : null,
                })),
              },
              scholarships: {
                create: scholarships.map((sc) => ({
                  name: requireString(sc.name, "scholarship.name"),
                  type: (sc.type as never) ?? "MERIT",
                  amountPct: sc.amountPct != null ? Number(sc.amountPct) : null,
                  deadlineDate: sc.deadlineDate ? new Date(sc.deadlineDate as string) : null,
                  requiresSeparateForm: sc.requiresSeparateForm === true,
                })),
              },
              intakes: {
                create: intakes.map((i) => {
                  const rounds = Array.isArray(i.rounds) ? (i.rounds as Record<string, unknown>[]) : [];
                  return {
                    startMonth: requireNumber(i.startMonth, "intake.startMonth"),
                    startYear: requireNumber(i.startYear, "intake.startYear"),
                    status: (i.status as never) ?? "OPEN",
                    rounds: {
                      create: rounds.map((r) => {
                        const status = r.applicationStatus as Record<string, unknown> | null | undefined;
                        return {
                          roundNumber: requireNumber(r.roundNumber, "round.roundNumber"),
                          deadlineDate: new Date(requireString(r.deadlineDate as string, "round.deadlineDate")),
                          decisionDate: r.decisionDate ? new Date(r.decisionDate as string) : null,
                          notes: typeof r.notes === "string" ? r.notes : null,
                          applicationStatus: {
                            create: {
                              status: (status?.status as never) ?? "NOT_STARTED",
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
