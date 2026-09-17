import { NextRequest, NextResponse } from "next/server";
import { exportSchoolById } from "@/lib/importExport";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await exportSchoolById(id);

  if (data.schools.length === 0) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const slug =
    data.schools[0].name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "school";

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${slug}.json"`,
    },
  });
}
