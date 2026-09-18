import { PrismaClient, ProgramFormat, RequirementType, ScholarshipType } from "@prisma/client";

const prisma = new PrismaClient();

// Seed data reflects publicly-known MBA cycle patterns as of the 2026-2027
// application cycle. Deadlines shift slightly every year — treat these as a
// starting point and verify/update each school's dates against its official
// admissions page each cycle (edit via the "Edit school" screen, no code
// changes needed).

type RoundSeed = { roundNumber: number; deadline: string; decision?: string; notes?: string };
type RequirementSeed = { type: RequirementType; mandatory: boolean; waiverCondition?: string; minScore?: number };
type ScholarshipSeed = { name: string; type: ScholarshipType; amountPct?: number; deadline?: string; requiresSeparateForm?: boolean };

type SchoolSeed = {
  name: string;
  country: string;
  city: string;
  globalRanking?: number;
  website: string;
  program: {
    name: string;
    format: ProgramFormat;
    durationMonths?: number;
    // Tuition only — carried over from the total published figure, split
    // across years for 2-year programs. Living costs, health insurance,
    // and other fees are intentionally left blank here rather than
    // guessed: use the research prompt + CSV import (or Edit school) to
    // fill those in from each school's actual cost-of-attendance page.
    tuition?: number;
    currency?: string;
    startMonth: number;
    startYear: number;
    rounds: RoundSeed[];
    requirements: RequirementSeed[];
    scholarships: ScholarshipSeed[];
  };
};

const schools: SchoolSeed[] = [
  {
    name: "INSEAD",
    country: "France",
    city: "Fontainebleau",
    globalRanking: 1,
    website: "https://www.insead.edu/master-programmes/mba",
    program: {
      name: "MBA",
      format: ProgramFormat.FULL_TIME,
      durationMonths: 10,
      tuition: 105000,
      currency: "EUR",
      startMonth: 1,
      startYear: 2027,
      rounds: [
        { roundNumber: 1, deadline: "2026-09-02", decision: "2026-10-21", notes: "Round 1 for Jan 2027 intake" },
        { roundNumber: 2, deadline: "2026-10-07", decision: "2026-11-25" },
        { roundNumber: 3, deadline: "2026-11-11", decision: "2027-01-06" },
        { roundNumber: 4, deadline: "2027-01-06", decision: "2027-02-24" },
        { roundNumber: 5, deadline: "2027-02-17", decision: "2027-04-07" },
      ],
      requirements: [
        { type: RequirementType.GMAT, mandatory: false, waiverCondition: "GMAT, GRE, or Executive Assessment accepted" },
        { type: RequirementType.GRE, mandatory: false },
        { type: RequirementType.TOEFL, mandatory: false, waiverCondition: "Waived for native/fluent English speakers or prior study in English" },
      ],
      scholarships: [
        { name: "INSEAD Merit Scholarship", type: ScholarshipType.MERIT, amountPct: 20, deadline: "2026-11-11", requiresSeparateForm: true },
        { name: "Forte Fellowship", type: ScholarshipType.DIVERSITY, deadline: "2026-11-11", requiresSeparateForm: true },
      ],
    },
  },
  {
    name: "HEC Paris",
    country: "France",
    city: "Jouy-en-Josas",
    globalRanking: 4,
    website: "https://www.hec.edu/en/mba-programs/mba",
    program: {
      name: "MBA",
      format: ProgramFormat.FULL_TIME,
      durationMonths: 16,
      tuition: 85000,
      currency: "EUR",
      startMonth: 8,
      startYear: 2027,
      rounds: [
        { roundNumber: 1, deadline: "2026-10-14", decision: "2026-12-09" },
        { roundNumber: 2, deadline: "2026-12-09", decision: "2027-02-03" },
        { roundNumber: 3, deadline: "2027-02-03", decision: "2027-03-31" },
        { roundNumber: 4, deadline: "2027-03-31", decision: "2027-05-19" },
      ],
      requirements: [
        { type: RequirementType.GMAT, mandatory: false, minScore: 600 },
        { type: RequirementType.GRE, mandatory: false },
        { type: RequirementType.IELTS, mandatory: false, waiverCondition: "Waived for native speakers" },
      ],
      scholarships: [
        { name: "HEC Foundation Scholarship", type: ScholarshipType.MERIT, amountPct: 25, deadline: "2026-12-09", requiresSeparateForm: true },
        { name: "Women's Excellence Scholarship", type: ScholarshipType.DIVERSITY, deadline: "2026-12-09", requiresSeparateForm: true },
      ],
    },
  },
  {
    name: "IE Business School",
    country: "Spain",
    city: "Madrid",
    globalRanking: 8,
    website: "https://www.ie.edu/business-school/programs/mba/international-mba/",
    program: {
      name: "International MBA",
      format: ProgramFormat.FULL_TIME,
      durationMonths: 11,
      tuition: 61200,
      currency: "EUR",
      startMonth: 10,
      startYear: 2027,
      rounds: [
        { roundNumber: 1, deadline: "2026-11-15", decision: "2026-12-15" },
        { roundNumber: 2, deadline: "2027-01-15", decision: "2027-02-15" },
        { roundNumber: 3, deadline: "2027-03-15", decision: "2027-04-15" },
        { roundNumber: 4, deadline: "2027-05-15", decision: "2027-06-15" },
      ],
      requirements: [
        { type: RequirementType.GMAT, mandatory: false, waiverCondition: "IE own admissions test also accepted" },
        { type: RequirementType.GRE, mandatory: false },
        { type: RequirementType.TOEFL, mandatory: false, waiverCondition: "Waived for native English speakers" },
      ],
      scholarships: [
        { name: "Talent & Diversity Scholarship", type: ScholarshipType.DIVERSITY, amountPct: 30, deadline: "2027-01-15", requiresSeparateForm: true },
      ],
    },
  },
  {
    name: "IMD",
    country: "Switzerland",
    city: "Lausanne",
    globalRanking: 6,
    website: "https://www.imd.org/mba/mba/",
    program: {
      name: "MBA",
      format: ProgramFormat.FULL_TIME,
      durationMonths: 11,
      tuition: 108000,
      currency: "CHF",
      startMonth: 1,
      startYear: 2027,
      rounds: [
        { roundNumber: 1, deadline: "2026-10-15", decision: "2026-11-15" },
        { roundNumber: 2, deadline: "2026-12-15", decision: "2027-01-15" },
        { roundNumber: 3, deadline: "2027-02-15", decision: "2027-03-15" },
        { roundNumber: 4, deadline: "2027-04-15", decision: "2027-05-15" },
      ],
      requirements: [
        { type: RequirementType.GMAT, mandatory: true, minScore: 600 },
        { type: RequirementType.TOEFL, mandatory: false, waiverCondition: "Waived for native speakers" },
      ],
      scholarships: [
        { name: "IMD MBA Scholarship", type: ScholarshipType.MERIT, deadline: "2026-12-15", requiresSeparateForm: true },
      ],
    },
  },
  {
    name: "Indian School of Business (ISB)",
    country: "India",
    city: "Hyderabad",
    globalRanking: 22,
    website: "https://www.isb.edu/en/study-isb/pgp.html",
    program: {
      name: "PGP",
      format: ProgramFormat.FULL_TIME,
      durationMonths: 12,
      tuition: 4500000,
      currency: "INR",
      startMonth: 4,
      startYear: 2027,
      rounds: [
        { roundNumber: 1, deadline: "2026-10-01", decision: "2026-12-01" },
        { roundNumber: 2, deadline: "2026-12-01", decision: "2027-02-01" },
        { roundNumber: 3, deadline: "2027-02-01", decision: "2027-03-15" },
      ],
      requirements: [
        { type: RequirementType.GMAT, mandatory: false, waiverCondition: "GMAT, GRE, or ISB own test accepted" },
        { type: RequirementType.GRE, mandatory: false },
        { type: RequirementType.IEGAT, mandatory: false, waiverCondition: "ISB's own admission test, alternative to GMAT/GRE" },
      ],
      scholarships: [
        { name: "ISB Merit Scholarship", type: ScholarshipType.MERIT, amountPct: 50, deadline: "2026-12-01", requiresSeparateForm: true },
        { name: "Need-based Financial Aid", type: ScholarshipType.NEED, deadline: "2027-01-15", requiresSeparateForm: true },
      ],
    },
  },
  {
    name: "London Business School",
    country: "United Kingdom",
    city: "London",
    globalRanking: 3,
    website: "https://www.london.edu/masters-degrees/mba",
    program: {
      name: "MBA",
      format: ProgramFormat.FULL_TIME,
      durationMonths: 15,
      tuition: 84000,
      currency: "GBP",
      startMonth: 8,
      startYear: 2027,
      rounds: [
        { roundNumber: 1, deadline: "2026-09-08", decision: "2026-11-19" },
        { roundNumber: 2, deadline: "2026-10-27", decision: "2027-01-14" },
        { roundNumber: 3, deadline: "2027-01-05", decision: "2027-03-11" },
        { roundNumber: 4, deadline: "2027-03-09", decision: "2027-05-06" },
        { roundNumber: 5, deadline: "2027-04-27", decision: "2027-06-10" },
      ],
      requirements: [
        { type: RequirementType.GMAT, mandatory: false, waiverCondition: "GMAT, GRE, or Executive Assessment accepted" },
        { type: RequirementType.GRE, mandatory: false },
        { type: RequirementType.IELTS, mandatory: false, waiverCondition: "Waived for native speakers/prior English-medium study" },
      ],
      scholarships: [
        { name: "LBS Forté Fellowship", type: ScholarshipType.DIVERSITY, deadline: "2026-10-27", requiresSeparateForm: true },
        { name: "LBS Merit Award", type: ScholarshipType.MERIT, amountPct: 25, deadline: "2026-10-27", requiresSeparateForm: true },
      ],
    },
  },
  {
    name: "University of Cambridge — Judge Business School",
    country: "United Kingdom",
    city: "Cambridge",
    globalRanking: 15,
    website: "https://www.jbs.cam.ac.uk/programmes/mba/",
    program: {
      name: "MBA",
      format: ProgramFormat.FULL_TIME,
      durationMonths: 12,
      tuition: 68000,
      currency: "GBP",
      startMonth: 9,
      startYear: 2027,
      rounds: [
        { roundNumber: 1, deadline: "2026-09-02", decision: "2026-11-05" },
        { roundNumber: 2, deadline: "2026-11-04", decision: "2027-01-14" },
        { roundNumber: 3, deadline: "2027-01-06", decision: "2027-03-11" },
        { roundNumber: 4, deadline: "2027-03-03", decision: "2027-05-06" },
        { roundNumber: 5, deadline: "2027-05-05", decision: "2027-06-24" },
      ],
      requirements: [
        { type: RequirementType.GMAT, mandatory: false, waiverCondition: "GMAT, GRE, or Executive Assessment accepted" },
        { type: RequirementType.GRE, mandatory: false },
        { type: RequirementType.IELTS, mandatory: false },
      ],
      scholarships: [
        { name: "Cambridge Trust Scholarship", type: ScholarshipType.NEED, deadline: "2026-11-04", requiresSeparateForm: true },
      ],
    },
  },
  {
    name: "University of Oxford — Saïd Business School",
    country: "United Kingdom",
    city: "Oxford",
    globalRanking: 12,
    website: "https://www.sbs.ox.ac.uk/programmes/mbas/mba",
    program: {
      name: "MBA",
      format: ProgramFormat.FULL_TIME,
      durationMonths: 12,
      tuition: 79940,
      currency: "GBP",
      startMonth: 9,
      startYear: 2027,
      rounds: [
        { roundNumber: 1, deadline: "2026-09-09", decision: "2026-11-12" },
        { roundNumber: 2, deadline: "2026-10-28", decision: "2027-01-14" },
        { roundNumber: 3, deadline: "2027-01-06", decision: "2027-03-11" },
        { roundNumber: 4, deadline: "2027-03-10", decision: "2027-05-06" },
        { roundNumber: 5, deadline: "2027-05-05", decision: "2027-06-17" },
      ],
      requirements: [
        { type: RequirementType.GMAT, mandatory: false, waiverCondition: "GMAT, GRE, or Executive Assessment accepted" },
        { type: RequirementType.GRE, mandatory: false },
        { type: RequirementType.TOEFL, mandatory: false },
      ],
      scholarships: [
        { name: "Skoll Scholarship (Social Entrepreneurship)", type: ScholarshipType.MERIT, deadline: "2026-10-28", requiresSeparateForm: true },
        { name: "Oxford-Saïd Merit Award", type: ScholarshipType.MERIT, amountPct: 20, deadline: "2027-01-06", requiresSeparateForm: false },
      ],
    },
  },
  {
    name: "MIT Sloan School of Management",
    country: "United States",
    city: "Cambridge, MA",
    globalRanking: 5,
    website: "https://mitsloan.mit.edu/mba",
    program: {
      name: "MBA",
      format: ProgramFormat.FULL_TIME,
      durationMonths: 24,
      tuition: 168000,
      currency: "USD",
      startMonth: 9,
      startYear: 2027,
      rounds: [
        { roundNumber: 1, deadline: "2026-09-16", decision: "2026-12-16" },
        { roundNumber: 2, deadline: "2027-01-06", decision: "2027-03-24" },
      ],
      requirements: [
        { type: RequirementType.GMAT, mandatory: false, waiverCondition: "GMAT, GRE, or Executive Assessment accepted" },
        { type: RequirementType.GRE, mandatory: false },
        { type: RequirementType.TOEFL, mandatory: false, waiverCondition: "Waived for native speakers" },
      ],
      scholarships: [
        { name: "MIT Sloan Fellowship", type: ScholarshipType.MERIT, deadline: "2027-01-06", requiresSeparateForm: false },
      ],
    },
  },
  {
    name: "Kellogg School of Management",
    country: "United States",
    city: "Evanston, IL",
    globalRanking: 10,
    website: "https://www.kellogg.northwestern.edu/programs/full-time-mba.aspx",
    program: {
      name: "Full-Time MBA",
      format: ProgramFormat.FULL_TIME,
      durationMonths: 24,
      tuition: 160000,
      currency: "USD",
      startMonth: 9,
      startYear: 2027,
      rounds: [
        { roundNumber: 1, deadline: "2026-09-16", decision: "2026-12-17" },
        { roundNumber: 2, deadline: "2027-01-06", decision: "2027-03-18" },
        { roundNumber: 3, deadline: "2027-04-08", decision: "2027-05-13" },
      ],
      requirements: [
        { type: RequirementType.GMAT, mandatory: false, waiverCondition: "GMAT, GRE, or Executive Assessment accepted" },
        { type: RequirementType.GRE, mandatory: false },
        { type: RequirementType.IELTS, mandatory: false, waiverCondition: "Waived for native speakers" },
      ],
      scholarships: [
        { name: "Kellogg Merit Fellowship", type: ScholarshipType.MERIT, deadline: "2026-09-16", requiresSeparateForm: false },
        { name: "Forté Fellowship", type: ScholarshipType.DIVERSITY, deadline: "2026-09-16", requiresSeparateForm: true },
      ],
    },
  },
];

async function main() {
  console.log("Seeding database...");

  for (const s of schools) {
    const school = await prisma.school.create({
      data: {
        name: s.name,
        country: s.country,
        city: s.city,
        globalRanking: s.globalRanking,
        website: s.website,
      },
    });

    const program = await prisma.program.create({
      data: {
        schoolId: school.id,
        name: s.program.name,
        format: s.program.format,
        durationMonths: s.program.durationMonths,
      },
    });

    if (s.program.tuition != null) {
      // Programs ~24 months split their total tuition evenly across two
      // years; anything shorter is a single-year program.
      const isTwoYear = (s.program.durationMonths ?? 0) >= 20;
      await prisma.programCost.create({
        data: {
          programId: program.id,
          currency: s.program.currency ?? "USD",
          tuitionYear1: isTwoYear ? Math.round(s.program.tuition / 2) : s.program.tuition,
          tuitionYear2: isTwoYear ? Math.round(s.program.tuition / 2) : null,
        },
      });
    }

    const intake = await prisma.intake.create({
      data: {
        programId: program.id,
        startMonth: s.program.startMonth,
        startYear: s.program.startYear,
        status: "OPEN",
      },
    });

    for (const r of s.program.rounds) {
      const round = await prisma.round.create({
        data: {
          intakeId: intake.id,
          roundNumber: r.roundNumber,
          deadlineDate: new Date(r.deadline),
          decisionDate: r.decision ? new Date(r.decision) : null,
          notes: r.notes,
        },
      });
      await prisma.applicationStatus.create({
        data: {
          roundId: round.id,
          status: "NOT_STARTED",
          taskChecklist: JSON.stringify(
            [
              "Test scores submitted",
              "Essays drafted",
              "Letters of recommendation",
              "Transcripts uploaded",
              "Application fee paid",
            ].map((label, i) => ({ id: `${round.id}-${i}`, label, done: false }))
          ),
        },
      });
    }

    for (const req of s.program.requirements) {
      await prisma.requirement.create({
        data: {
          programId: program.id,
          type: req.type,
          mandatory: req.mandatory,
          waiverCondition: req.waiverCondition,
          minScore: req.minScore,
        },
      });
    }

    for (const sch of s.program.scholarships) {
      await prisma.scholarship.create({
        data: {
          programId: program.id,
          name: sch.name,
          type: sch.type,
          amountPct: sch.amountPct,
          deadlineDate: sch.deadline ? new Date(sch.deadline) : null,
          requiresSeparateForm: sch.requiresSeparateForm ?? false,
        },
      });
    }

    console.log(`  seeded ${s.name}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
