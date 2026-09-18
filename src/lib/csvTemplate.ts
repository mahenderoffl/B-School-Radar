// Plain constants only — no server-only imports — so client components can
// use these without pulling exceljs (from lib/importFile.ts) into the bundle.

export const CSV_TEMPLATE = `school_name,country,city,global_ranking,website,program_name,program_format,duration_months,currency,tuition_year1,tuition_year2,living_cost_year1,living_cost_year2,health_insurance,application_fee,visa_fee,books_and_supplies,other_fees,other_fees_note,intake_month,intake_year,round_number,deadline_date,decision_date,round_notes,requirements,scholarships
Stanford GSB,United States,"Stanford, CA",2,https://www.gsb.stanford.edu/programs/mba,MBA,FULL_TIME,21,USD,84000,,32000,,4500,275,0,1500,800,Student activity fee,9,2027,1,2026-09-15,2026-12-11,,"GMAT|N||GMAT or GRE accepted;TOEFL|N||Waived for native speakers","Fellowship|MERIT||2027-01-08|N"
Stanford GSB,United States,"Stanford, CA",2,https://www.gsb.stanford.edu/programs/mba,MBA,FULL_TIME,21,USD,84000,,32000,,4500,275,0,1500,800,Student activity fee,9,2027,2,2027-01-06,2027-03-24,,"GMAT|N||GMAT or GRE accepted;TOEFL|N||Waived for native speakers","Fellowship|MERIT||2027-01-08|N"
`;

/**
 * requirements column: one or more "TYPE|MANDATORY(Y/N)|MIN_SCORE|WAIVER_NOTE"
 * entries separated by ';'. TYPE is GMAT, GRE, IELTS, TOEFL, IEGAT, or OTHER.
 *
 * scholarships column: one or more "NAME|TYPE|AMOUNT_PCT|DEADLINE|SEPARATE_FORM(Y/N)"
 * entries separated by ';'. TYPE is MERIT, NEED, DIVERSITY, or OTHER; DEADLINE is YYYY-MM-DD.
 *
 * Cost columns (tuition_year1 through other_fees_note) are all optional —
 * leave a cell blank if a program doesn't publish that line item, or if it's
 * a 1-year program, leave every *_year2 column blank. All cost amounts share
 * the one `currency` column.
 *
 * All of these repeat identically across a school's round rows, same as the
 * other school/program-level columns — only the round-specific columns
 * change row to row.
 */
export const CSV_COLUMN_HELP = {
  currency: "3-letter currency code (e.g. USD, EUR, GBP, INR) applied to every cost column below.",
  tuition_year1: "Tuition for year 1 of the program, as a plain number.",
  tuition_year2: "Tuition for year 2, or blank for a 1-year program.",
  living_cost_year1: "Estimated living costs (housing, food, transport) for year 1, as published by the school.",
  living_cost_year2: "Estimated living costs for year 2, or blank for a 1-year program.",
  health_insurance: "Mandatory student health insurance cost for the program, if published.",
  application_fee: "One-time application/admissions fee.",
  visa_fee: "Visa or immigration processing fee estimate, if relevant.",
  books_and_supplies: "Estimated cost of books, course materials, and supplies.",
  other_fees: "Any other fee not covered above (activity fee, orientation fee, technology fee, etc.).",
  other_fees_note: "Short free-text description of what other_fees covers.",
  requirements: "TYPE|MANDATORY(Y/N)|MIN_SCORE|WAIVER_NOTE entries separated by ';'. TYPE: GMAT, GRE, IELTS, TOEFL, IEGAT, OTHER.",
  scholarships:
    "NAME|TYPE|AMOUNT_PCT|DEADLINE(YYYY-MM-DD)|SEPARATE_FORM(Y/N) entries separated by ';'. TYPE: MERIT, NEED, DIVERSITY, OTHER.",
} as const;
