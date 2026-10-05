import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { savedScholarshipData, type SavedScholarshipPayload } from "@/lib/scholarshipForm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as SavedScholarshipPayload;

  const existing = await prisma.savedScholarship.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });
  }

  await prisma.savedScholarship.update({ where: { id }, data: savedScholarshipData(body) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.savedScholarship.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
