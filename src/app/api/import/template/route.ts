import { NextResponse } from "next/server";
import { CSV_TEMPLATE } from "@/lib/csvTemplate";

export async function GET() {
  return new NextResponse(CSV_TEMPLATE, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="b-school-radar-import-template.csv"',
    },
  });
}
