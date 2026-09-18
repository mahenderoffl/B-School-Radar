const CSV_HEADERS =
  "school_name,country,city,global_ranking,website,program_name,program_format,duration_months,tuition,currency,intake_month,intake_year,round_number,deadline_date,decision_date,round_notes,requirements,scholarships";

/**
 * A prompt matching our CSV import format exactly (headers, encoding rules,
 * enum values) so an LLM's raw output can be pasted straight into the
 * importer without editing. Ask any LLM, paste its answer into the CSV
 * paste box, done.
 */
export function buildResearchPrompt(schoolName?: string): string {
  const target = schoolName?.trim() || "[SCHOOL NAME AND PROGRAM]";
  return `You are helping me collect MBA/graduate program admissions data in a specific CSV format. Research ${target} and output ONLY a CSV table (no explanations, no markdown code fences, no commentary before or after) with exactly these headers, in this exact order:

${CSV_HEADERS}

Rules:
- One row per application round for the current or next upcoming admissions cycle. Repeat the school/program-level columns (school_name through currency) identically across every row for that program.
- program_format must be exactly one of: FULL_TIME, PART_TIME, EXECUTIVE, ONLINE
- All dates must be YYYY-MM-DD. If a date isn't confirmed for the upcoming cycle, leave that cell blank rather than guessing or using a past cycle's date.
- If a field's value contains a comma (e.g. a city like "Boston, MA"), wrap that field in double quotes.
- requirements column: one or more entries separated by ';', each entry formatted TYPE|MANDATORY|MIN_SCORE|WAIVER_NOTE
  - TYPE is one of: GMAT, GRE, IELTS, TOEFL, IEGAT, OTHER
  - MANDATORY is Y or N (N means it can be waived or an alternative is accepted)
  - MIN_SCORE is a number, or leave blank if there's no published minimum
  - WAIVER_NOTE is a short free-text note, or blank (don't use ';' or '|' inside it)
  - Example cell: GMAT|N||GMAT or GRE accepted;TOEFL|N||Waived for native English speakers
- scholarships column: one or more entries separated by ';', each entry formatted NAME|TYPE|AMOUNT_PCT|DEADLINE|SEPARATE_FORM
  - TYPE is one of: MERIT, NEED, DIVERSITY, OTHER
  - AMOUNT_PCT is the percent of tuition covered as a number, or blank if not published as a percentage
  - DEADLINE is YYYY-MM-DD, or blank if unknown
  - SEPARATE_FORM is Y or N (Y if it needs its own application/form beyond the main admissions application)
  - Example cell: Dean's Fellowship|MERIT|25|2027-01-15|Y
- Use only official, current-cycle information (the school's own admissions/financial-aid pages). If you're not confident about a specific value, leave that cell blank instead of guessing — a blank cell is safer than a wrong one.
- Output the CSV only: the header row above, followed by one row per round. Nothing else.`;
}
