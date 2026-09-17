import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const { status, taskChecklist, notes } = body as {
    status?: string;
    taskChecklist?: string;
    notes?: string;
  };

  const updated = await prisma.applicationStatus.upsert({
    where: { roundId: id },
    create: {
      roundId: id,
      status: (status as never) ?? "NOT_STARTED",
      taskChecklist: taskChecklist ?? "[]",
      notes,
    },
    update: {
      ...(status ? { status: status as never } : {}),
      ...(taskChecklist ? { taskChecklist } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  return NextResponse.json(updated);
}
