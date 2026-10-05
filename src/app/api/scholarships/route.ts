import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_SCHOLARSHIP_CHECKLIST_ITEMS } from "@/lib/utils";
import { savedScholarshipData, type SavedScholarshipPayload } from "@/lib/scholarshipForm";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SavedScholarshipPayload;

  const scholarship = await prisma.savedScholarship.create({
    data: {
      ...savedScholarshipData(body),
      taskChecklist: JSON.stringify(
        DEFAULT_SCHOLARSHIP_CHECKLIST_ITEMS.map((label, i) => ({ id: `new-${i}`, label, done: false }))
      ),
    },
  });

  return NextResponse.json(scholarship, { status: 201 });
}
