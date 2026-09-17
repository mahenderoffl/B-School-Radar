import { NextResponse } from "next/server";
import { exportAllData } from "@/lib/importExport";

export async function GET() {
  const data = await exportAllData();
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="b-school-radar-export-${date}.json"`,
    },
  });
}
