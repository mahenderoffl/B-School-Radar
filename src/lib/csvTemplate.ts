// Plain constants only — no server-only imports — so client components can
// use these without pulling exceljs (from lib/importFile.ts) into the bundle.

export const CSV_TEMPLATE = `school_name,country,city,global_ranking,website,program_name,program_format,duration_months,tuition,currency,intake_month,intake_year,round_number,deadline_date,decision_date,round_notes,requirements,scholarships
Stanford GSB,United States,"Stanford, CA",2,https://www.gsb.stanford.edu/programs/mba,MBA,FULL_TIME,21,84000,USD,9,2027,1,2026-09-15,2026-12-11,,"GMAT|N||GMAT or GRE accepted;TOEFL|N||Waived for native speakers","Fellowship|MERIT||2027-01-08|N"
Stanford GSB,United States,"Stanford, CA",2,https://www.gsb.stanford.edu/programs/mba,MBA,FULL_TIME,21,84000,USD,9,2027,2,2027-01-06,2027-03-24,,"GMAT|N||GMAT or GRE accepted;TOEFL|N||Waived for native speakers","Fellowship|MERIT||2027-01-08|N"
`;

/**
 * requirements column: one or more "TYPE|MANDATORY(Y/N)|MIN_SCORE|WAIVER_NOTE"
 * entries separated by ';'. TYPE is GMAT, GRE, IELTS, TOEFL, IEGAT, or OTHER.
 *
 * scholarships column: one or more "NAME|TYPE|AMOUNT_PCT|DEADLINE|SEPARATE_FORM(Y/N)"
 * entries separated by ';'. TYPE is MERIT, NEED, DIVERSITY, or OTHER; DEADLINE is YYYY-MM-DD.
 *
 * Both columns repeat identically across a school's round rows, same as the
 * other school/program-level columns — only the round-specific columns
 * change row to row.
 */
export const CSV_COLUMN_HELP = {
  requirements: "TYPE|MANDATORY(Y/N)|MIN_SCORE|WAIVER_NOTE entries separated by ';'. TYPE: GMAT, GRE, IELTS, TOEFL, IEGAT, OTHER.",
  scholarships:
    "NAME|TYPE|AMOUNT_PCT|DEADLINE(YYYY-MM-DD)|SEPARATE_FORM(Y/N) entries separated by ';'. TYPE: MERIT, NEED, DIVERSITY, OTHER.",
} as const;
