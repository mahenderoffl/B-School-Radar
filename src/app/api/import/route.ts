import { NextRequest, NextResponse } from "next/server";
import { importData, ImportValidationError } from "@/lib/importExport";

export async function POST(req: NextRequest) {
  let body: { data?: unknown; replace?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  try {
    const imported = await importData(body.data, { replace: body.replace === true });
    return NextResponse.json({ imported });
  } catch (err) {
    if (err instanceof ImportValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Import failed:", err);
    return NextResponse.json(
      { error: "Import failed — check that the file matches the export format and try again." },
      { status: 400 }
    );
  }
}
