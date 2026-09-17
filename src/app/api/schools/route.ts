import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_CHECKLIST_ITEMS } from "@/lib/utils";
import type { SchoolFormPayload } from "@/lib/schoolForm";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SchoolFormPayload;

  const school = await prisma.school.create({
    data: {
      name: body.name,
      country: body.country,
      city: body.city,
      globalRanking: body.globalRanking ?? null,
      website: body.website || null,
      programs: {
        create: {
          name: body.programName,
          format: body.programFormat,
          durationMonths: body.durationMonths ?? null,
          tuition: body.tuition ?? null,
          currency: body.currency || "USD",
          requirements: {
            create: body.requirements.map((r) => ({
              type: r.type,
              mandatory: r.mandatory,
              waiverCondition: r.waiverCondition || null,
              minScore: r.minScore ?? null,
            })),
          },
          scholarships: {
            create: body.scholarships.map((s) => ({
              name: s.name,
              type: s.type,
              amountPct: s.amountPct ?? null,
              deadlineDate: s.deadlineDate ? new Date(s.deadlineDate) : null,
              requiresSeparateForm: s.requiresSeparateForm,
            })),
          },
          intakes: {
            create: {
              startMonth: body.startMonth,
              startYear: body.startYear,
              status: "OPEN",
              rounds: {
                create: body.rounds.map((r) => ({
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
                })),
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(school, { status: 201 });
}
