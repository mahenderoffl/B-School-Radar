import { prisma } from "@/lib/db";

export async function getRoundFeed() {
  const rounds = await prisma.round.findMany({
    include: {
      intake: { include: { program: { include: { school: true } } } },
      applicationStatus: true,
    },
    orderBy: { deadlineDate: "asc" },
  });
  return rounds;
}

export type RoundFeedItem = Awaited<ReturnType<typeof getRoundFeed>>[number];

export async function getScholarshipFeed() {
  const scholarships = await prisma.scholarship.findMany({
    where: { deadlineDate: { not: null } },
    include: { program: { include: { school: true } } },
    orderBy: { deadlineDate: "asc" },
  });
  return scholarships;
}

export type ScholarshipFeedItem = Awaited<ReturnType<typeof getScholarshipFeed>>[number];

export async function getSchoolsOverview() {
  const schools = await prisma.school.findMany({
    include: {
      programs: {
        include: {
          cost: true,
          intakes: {
            include: { rounds: { include: { applicationStatus: true }, orderBy: { deadlineDate: "asc" } } },
          },
          requirements: true,
          scholarships: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
  return schools;
}

export type SchoolOverview = Awaited<ReturnType<typeof getSchoolsOverview>>[number];

export async function getSchoolById(id: string) {
  return prisma.school.findUnique({
    where: { id },
    include: {
      programs: {
        include: {
          cost: true,
          intakes: {
            include: { rounds: { include: { applicationStatus: true }, orderBy: { deadlineDate: "asc" } } },
          },
          requirements: true,
          scholarships: true,
        },
      },
    },
  });
}

export function getSchoolCount() {
  return prisma.school.count();
}

export function nextOpenRound(rounds: { deadlineDate: Date }[]) {
  const now = new Date();
  const upcoming = rounds
    .filter((r) => new Date(r.deadlineDate).getTime() >= now.setHours(0, 0, 0, 0))
    .sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime());
  return upcoming[0] ?? null;
}
