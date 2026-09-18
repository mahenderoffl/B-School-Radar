import ExcelJS from "exceljs";
import { Readable } from "node:stream";
import { REQUIREMENT_TYPES, SCHOLARSHIP_TYPES, normalizeEnumGuess } from "@/lib/enums";

function cellToString(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("result" in value && value.result != null) return String(value.result);
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((t) => t.text).join("");
    }
    return "";
  }
  return String(value);
}

function worksheetToRows(worksheet: ExcelJS.Worksheet): Record<string, string>[] {
  const headers: string[] = [];
  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = cellToString(cell.value).trim();
  });

  const rows: Record<string, string>[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj: Record<string, string> = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (header) obj[header] = cellToString(cell.value);
    });
    if (Object.values(obj).some((v) => v !== "")) rows.push(obj);
  });
  return rows;
}

export async function parseCsvBuffer(buffer: Buffer): Promise<Record<string, string>[]> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = await workbook.csv.read(Readable.from(buffer));
  return worksheetToRows(worksheet);
}

export async function parseXlsxBuffer(buffer: Buffer): Promise<Record<string, string>[]> {
  const workbook = new ExcelJS.Workbook();
  // @ts-expect-error exceljs's bundled types resolve against an older nested
  // @types/node (via fast-csv) whose non-generic Buffer shape conflicts with
  // our top-level one; both describe the same real Node Buffer at runtime.
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("That workbook has no sheets.");
  return worksheetToRows(worksheet);
}

// --- Flat rows (one row per round) -> nested school/program/intake/round shape ---

const HEADER_ALIASES = {
  school_name: ["school_name", "school", "name"],
  country: ["country"],
  city: ["city"],
  global_ranking: ["global_ranking", "ranking"],
  website: ["website", "url"],
  program_name: ["program_name", "program"],
  program_format: ["program_format", "format"],
  duration_months: ["duration_months", "duration"],
  currency: ["currency"],
  tuition_year1: ["tuition_year1", "tuition_year_1", "tuition"],
  tuition_year2: ["tuition_year2", "tuition_year_2"],
  living_cost_year1: ["living_cost_year1", "living_cost_year_1", "living_cost"],
  living_cost_year2: ["living_cost_year2", "living_cost_year_2"],
  health_insurance: ["health_insurance", "insurance"],
  application_fee: ["application_fee"],
  visa_fee: ["visa_fee", "visa_immigration_fee"],
  books_and_supplies: ["books_and_supplies", "books_supplies", "books"],
  other_fees: ["other_fees"],
  other_fees_note: ["other_fees_note", "other_fees_description"],
  intake_month: ["intake_month", "start_month"],
  intake_year: ["intake_year", "start_year"],
  round_number: ["round_number", "round"],
  deadline_date: ["deadline_date", "deadline"],
  decision_date: ["decision_date", "decision"],
  round_notes: ["round_notes", "notes"],
  requirements: ["requirements", "requirement", "tests"],
  scholarships: ["scholarships", "scholarship"],
} as const;

type Field = keyof typeof HEADER_ALIASES;

function normalizeKey(k: string): string {
  return k
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function field(row: Record<string, string>, name: Field): string {
  for (const alias of HEADER_ALIASES[name]) {
    const v = row[alias];
    if (v !== undefined && v.trim() !== "") return v.trim();
  }
  return "";
}

type RoundRow = { roundNumber: number; deadlineDate: string; decisionDate?: string; notes?: string };
type IntakeGroup = { startMonth: number; startYear: number; rounds: RoundRow[] };
type RequirementRow = { type: string; mandatory: boolean; minScore?: number; waiverCondition?: string };
type ScholarshipRow = { name: string; type: string; amountPct?: number; deadlineDate?: string; requiresSeparateForm: boolean };
type CostGroup = {
  currency: string;
  tuitionYear1?: number;
  tuitionYear2?: number;
  livingCostYear1?: number;
  livingCostYear2?: number;
  healthInsurance?: number;
  applicationFee?: number;
  visaFee?: number;
  booksAndSupplies?: number;
  otherFees?: number;
  otherFeesNote?: string;
};
type ProgramGroup = {
  name: string;
  format: string;
  durationMonths?: number;
  cost: CostGroup;
  intakes: Map<string, IntakeGroup>;
  requirements: Map<string, RequirementRow>;
  scholarships: Map<string, ScholarshipRow>;
};

// requirements cell: "TYPE|MANDATORY(Y/N)|MIN_SCORE|WAIVER_NOTE" entries, ';'-separated.
// Free-text notes can contain a stray ';' of their own (e.g. "GMAT or GRE
// accepted; no minimum score"), which would otherwise split into a second,
// bogus entry with no real TYPE and no '|' at all. A chunk with no '|' can
// never be a genuine entry (a bare word essentially never matches a test
// type), so fold it back into the previous entry's waiver note. A chunk
// that does have the TYPE|... shape but an unrecognized type is kept as
// OTHER instead, preserving the original label rather than discarding it.
function parseRequirementsCell(raw: string): RequirementRow[] {
  if (!raw.trim()) return [];
  const result: RequirementRow[] = [];
  for (const entry of raw.split(";").map((e) => e.trim()).filter(Boolean)) {
    const hasStructure = entry.includes("|");
    const [typeRaw, mandatoryFlag, minScore, waiverCondition] = entry.split("|").map((s) => s.trim());
    const type = typeRaw ? normalizeEnumGuess(typeRaw) : "";
    const mandatory = mandatoryFlag ? mandatoryFlag.toUpperCase() === "Y" : true;
    const scoreValue = minScore ? Number(minScore) : undefined;

    if ((REQUIREMENT_TYPES as readonly string[]).includes(type)) {
      result.push({ type, mandatory, minScore: scoreValue, waiverCondition: waiverCondition || undefined });
    } else if (hasStructure) {
      result.push({
        type: "OTHER",
        mandatory,
        minScore: scoreValue,
        waiverCondition: [typeRaw, waiverCondition].filter(Boolean).join(" — ") || undefined,
      });
    } else if (result.length > 0) {
      const prev = result[result.length - 1];
      prev.waiverCondition = prev.waiverCondition ? `${prev.waiverCondition}; ${entry}` : entry;
    } else {
      result.push({ type: "OTHER", mandatory: true, waiverCondition: entry });
    }
  }
  return result;
}

// scholarships cell: "NAME|TYPE|AMOUNT_PCT|DEADLINE|SEPARATE_FORM(Y/N)" entries, ';'-separated.
// Unlike requirements, a bare fragment can't reliably be told apart from a
// legitimate name-only scholarship, so entries are always kept — an
// unrecognized TYPE just falls back to OTHER instead of throwing.
function parseScholarshipsCell(raw: string): ScholarshipRow[] {
  if (!raw.trim()) return [];
  return raw
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, typeRaw, amountPct, deadlineDate, separateForm] = entry.split("|").map((s) => s.trim());
      const type = typeRaw ? normalizeEnumGuess(typeRaw) : "";
      return {
        name: name || "Scholarship",
        type: (SCHOLARSHIP_TYPES as readonly string[]).includes(type) ? type : "OTHER",
        amountPct: amountPct ? Number(amountPct) : undefined,
        deadlineDate: deadlineDate || undefined,
        requiresSeparateForm: separateForm ? separateForm.toUpperCase() === "Y" : false,
      };
    });
}
type SchoolGroup = {
  name: string;
  country: string;
  city: string;
  globalRanking?: number;
  website?: string;
  programs: Map<string, ProgramGroup>;
};

/**
 * Rows are one-round-per-row; school/program-level fields (including the
 * requirements/scholarships cells) repeat across a school's rows and get
 * grouped back together, deduped by content.
 */
export function rowsToSchools(rawRows: Record<string, string>[]) {
  const rows = rawRows.map((r) => {
    const normalized: Record<string, string> = {};
    for (const [k, v] of Object.entries(r)) normalized[normalizeKey(k)] = v;
    return normalized;
  });

  const schools = new Map<string, SchoolGroup>();

  for (const row of rows) {
    const schoolName = field(row, "school_name");
    if (!schoolName) continue;

    let school = schools.get(schoolName);
    if (!school) {
      school = {
        name: schoolName,
        country: field(row, "country"),
        city: field(row, "city"),
        globalRanking: field(row, "global_ranking") ? Number(field(row, "global_ranking")) : undefined,
        website: field(row, "website") || undefined,
        programs: new Map(),
      };
      schools.set(schoolName, school);
    }

    const programName = field(row, "program_name") || "MBA";
    let program = school.programs.get(programName);
    if (!program) {
      const num = (name: Field) => (field(row, name) ? Number(field(row, name)) : undefined);
      program = {
        name: programName,
        format: field(row, "program_format").toUpperCase().replace(/[\s-]+/g, "_") || "FULL_TIME",
        durationMonths: num("duration_months"),
        cost: {
          currency: field(row, "currency") || "USD",
          tuitionYear1: num("tuition_year1"),
          tuitionYear2: num("tuition_year2"),
          livingCostYear1: num("living_cost_year1"),
          livingCostYear2: num("living_cost_year2"),
          healthInsurance: num("health_insurance"),
          applicationFee: num("application_fee"),
          visaFee: num("visa_fee"),
          booksAndSupplies: num("books_and_supplies"),
          otherFees: num("other_fees"),
          otherFeesNote: field(row, "other_fees_note") || undefined,
        },
        intakes: new Map(),
        requirements: new Map(),
        scholarships: new Map(),
      };
      school.programs.set(programName, program);
    }

    // Same requirements/scholarships text typically repeats across a
    // school's rows (one per round); dedupe by content so it's only added once.
    for (const req of parseRequirementsCell(field(row, "requirements"))) {
      program.requirements.set(JSON.stringify(req), req);
    }
    for (const sch of parseScholarshipsCell(field(row, "scholarships"))) {
      program.scholarships.set(JSON.stringify(sch), sch);
    }

    const intakeMonth = Number(field(row, "intake_month"));
    const intakeYear = Number(field(row, "intake_year"));
    const deadlineDate = field(row, "deadline_date");
    const roundNumber = Number(field(row, "round_number"));
    if (!intakeMonth || !intakeYear || !deadlineDate || !roundNumber) continue;

    const intakeKey = `${intakeMonth}-${intakeYear}`;
    let intake = program.intakes.get(intakeKey);
    if (!intake) {
      intake = { startMonth: intakeMonth, startYear: intakeYear, rounds: [] };
      program.intakes.set(intakeKey, intake);
    }

    intake.rounds.push({
      roundNumber,
      deadlineDate,
      decisionDate: field(row, "decision_date") || undefined,
      notes: field(row, "round_notes") || undefined,
    });
  }

  return Array.from(schools.values()).map((s) => ({
    name: s.name,
    country: s.country,
    city: s.city,
    globalRanking: s.globalRanking,
    website: s.website,
    programs: Array.from(s.programs.values()).map((p) => ({
      name: p.name,
      format: p.format,
      durationMonths: p.durationMonths,
      cost: p.cost,
      intakes: Array.from(p.intakes.values()),
      requirements: Array.from(p.requirements.values()),
      scholarships: Array.from(p.scholarships.values()),
    })),
  }));
}
