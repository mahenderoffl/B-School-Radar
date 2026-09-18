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
          cost: {
            create: {
              currency: body.cost.currency || "USD",
              tuitionYear1: body.cost.tuitionYear1 ?? null,
              tuitionYear2: body.cost.tuitionYear2 ?? null,
              livingCostYear1: body.cost.livingCostYear1 ?? null,
              livingCostYear2: body.cost.livingCostYear2 ?? null,
              healthInsurance: body.cost.healthInsurance ?? null,
              applicationFee: body.cost.applicationFee ?? null,
              visaFee: body.cost.visaFee ?? null,
              booksAndSupplies: body.cost.booksAndSupplies ?? null,
              otherFees: body.cost.otherFees ?? null,
              otherFeesNote: body.cost.otherFeesNote || null,
            },
          },
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
