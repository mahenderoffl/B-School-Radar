import type { ProgramFormat, RequirementType, ScholarshipType } from "@prisma/client";

export type RequirementInput = {
  type: RequirementType;
  mandatory: boolean;
  waiverCondition?: string;
  minScore?: number | null;
};

export type ScholarshipInput = {
  name: string;
  type: ScholarshipType;
  amountPct?: number | null;
  deadlineDate?: string;
  requiresSeparateForm: boolean;
};

export type RoundInput = {
  roundNumber: number;
  deadlineDate: string;
  decisionDate?: string;
  notes?: string;
};

export type SchoolFormPayload = {
  name: string;
  country: string;
  city: string;
  globalRanking?: number | null;
  website?: string;
  programName: string;
  programFormat: ProgramFormat;
  durationMonths?: number | null;
  tuition?: number | null;
  currency?: string;
  startMonth: number;
  startYear: number;
  rounds: RoundInput[];
  requirements: RequirementInput[];
  scholarships: ScholarshipInput[];
};
