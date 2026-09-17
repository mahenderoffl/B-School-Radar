import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_CHECKLIST_ITEMS } from "@/lib/utils";
import type { SchoolFormPayload } from "@/lib/schoolForm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.school.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as SchoolFormPayload;

  const existing = await prisma.school.findUnique({
    where: { id },
    include: { programs: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }
  const program = existing.programs[0];

  await prisma.school.update({
    where: { id },
    data: {
      name: body.name,
      country: body.country,
      city: body.city,
      globalRanking: body.globalRanking ?? null,
      website: body.website || null,
    },
  });

  if (program) {
    await prisma.program.update({
      where: { id: program.id },
      data: {
        name: body.programName,
        format: body.programFormat,
        durationMonths: body.durationMonths ?? null,
        tuition: body.tuition ?? null,
        currency: body.currency || "USD",
      },
    });

    // Replace requirements and scholarships wholesale — simplest way to keep the form in sync.
    await prisma.requirement.deleteMany({ where: { programId: program.id } });
    await prisma.requirement.createMany({
      data: body.requirements.map((r) => ({
        programId: program.id,
        type: r.type,
        mandatory: r.mandatory,
        waiverCondition: r.waiverCondition || null,
        minScore: r.minScore ?? null,
      })),
    });

    await prisma.scholarship.deleteMany({ where: { programId: program.id } });
    await prisma.scholarship.createMany({
      data: body.scholarships.map((s) => ({
        programId: program.id,
        name: s.name,
        type: s.type,
        amountPct: s.amountPct ?? null,
        deadlineDate: s.deadlineDate ? new Date(s.deadlineDate) : null,
        requiresSeparateForm: s.requiresSeparateForm,
      })),
    });

    const intake = await prisma.intake.findFirst({ where: { programId: program.id } });
    if (intake) {
      await prisma.intake.update({
        where: { id: intake.id },
        data: { startMonth: body.startMonth, startYear: body.startYear },
      });

      // Rounds keep their application status where the round number matches; new
      // rounds get a fresh checklist, removed rounds are dropped via cascade.
      const existingRounds = await prisma.round.findMany({ where: { intakeId: intake.id } });
      const keptNumbers = new Set(body.rounds.map((r) => r.roundNumber));
      const toDelete = existingRounds.filter((r) => !keptNumbers.has(r.roundNumber));
      if (toDelete.length) {
        await prisma.round.deleteMany({ where: { id: { in: toDelete.map((r) => r.id) } } });
      }

      for (const r of body.rounds) {
        const match = existingRounds.find((er) => er.roundNumber === r.roundNumber);
        if (match) {
          await prisma.round.update({
            where: { id: match.id },
            data: {
              deadlineDate: new Date(r.deadlineDate),
              decisionDate: r.decisionDate ? new Date(r.decisionDate) : null,
              notes: r.notes || null,
            },
          });
        } else {
          await prisma.round.create({
            data: {
              intakeId: intake.id,
              roundNumber: r.roundNumber,
              deadlineDate: new Date(r.deadlineDate),
              decisionDate: r.decisionDate ? new Date(r.decisionDate) : null,
              notes: r.notes || null,
              applicationStatus: {
                create: {
                  status: "NOT_STARTED",
                  taskChecklist: JSON.stringify(
                    DEFAULT_CHECKLIST_ITEMS.map((label, i) => ({ id: `new-${i}`, label, done: false }))
                  ),
                },
              },
            },
          });
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
