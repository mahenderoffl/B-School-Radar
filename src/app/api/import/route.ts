import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { importData, ImportValidationError } from "@/lib/importExport";
import { parseCsvBuffer, parseXlsxBuffer, rowsToSchools } from "@/lib/importFile";

async function payloadFromFile(file: File): Promise<unknown> {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".json")) {
    try {
      return JSON.parse(buffer.toString("utf-8"));
    } catch {
      throw new ImportValidationError("That JSON file couldn't be parsed.");
    }
  }
  if (name.endsWith(".csv")) {
    return { schools: rowsToSchools(await parseCsvBuffer(buffer)) };
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return { schools: rowsToSchools(await parseXlsxBuffer(buffer)) };
  }
  throw new ImportValidationError("Unsupported file type — use .json, .csv, .xlsx, or .xls.");
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  let payload: unknown;
  let replace = false;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    replace = form.get("replace") === "true";
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    try {
      payload = await payloadFromFile(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't read that file.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } else {
    let body: { data?: unknown; replace?: boolean };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
    }
    payload = body.data;
    replace = body.replace === true;
  }

  try {
    const imported = await importData(payload, { replace });
    return NextResponse.json({ imported });
  } catch (err) {
    if (err instanceof ImportValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Import failed:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "Import failed — that record already exists (a duplicate value hit a unique constraint)." },
        { status: 400 }
      );
    }
    if (
      err instanceof Prisma.PrismaClientValidationError ||
      err instanceof Prisma.PrismaClientKnownRequestError
    ) {
      return NextResponse.json(
        {
          error:
            "Import failed — the database rejected one of the values (an unexpected field or a value the schema doesn't accept). Check the CSV template's column names and value formats and try again.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Import failed — check that the file matches the expected format and try again." },
      { status: 400 }
    );
  }
}
