"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary, card, inputClass, link } from "@/lib/ui";
import { downloadCsvTemplate } from "@/lib/downloadTemplate";

const EXAMPLE = `{
  "name": "Stanford GSB",
  "country": "United States",
  "city": "Stanford, CA",
  "globalRanking": 2,
  "website": "https://www.gsb.stanford.edu/programs/mba",
  "programs": [
    {
      "name": "MBA",
      "format": "FULL_TIME",
      "durationMonths": 21,
      "tuition": 84000,
      "currency": "USD",
      "requirements": [
        { "type": "GMAT", "mandatory": false, "waiverCondition": "GMAT or GRE accepted" }
      ],
      "scholarships": [
        { "name": "Fellowship", "type": "MERIT", "deadlineDate": "2027-01-08" }
      ],
      "intakes": [
        {
          "startMonth": 9,
          "startYear": 2027,
          "rounds": [
            { "roundNumber": 1, "deadlineDate": "2026-09-15", "decisionDate": "2026-12-11" }
          ]
        }
      ]
    }
  ]
}`;

export default function ImportSchoolForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showExample, setShowExample] = useState(false);

  async function runImport() {
    setStatus(null);
    if (!file && !text.trim()) {
      setStatus({ type: "error", message: "Paste JSON or choose a file first." });
      return;
    }

    setImporting(true);
    try {
      let res: Response;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        form.append("replace", "false");
        res = await fetch("/api/import", { method: "POST", body: form });
      } else {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error("That isn't valid JSON.");
        }
        res = await fetch("/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: parsed, replace: false }),
        });
      }
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Import failed.");
      router.push("/schools");
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Import failed." });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className={`${card} flex flex-col gap-4 p-5`}>
      <div>
        <h2 className="text-base font-semibold tracking-tight text-gray-900">Import a school</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload a <code className="text-xs">.json</code>, <code className="text-xs">.csv</code>,{" "}
          <code className="text-xs">.xlsx</code>, or <code className="text-xs">.xls</code> file — or paste JSON for
          one school or a list of schools below.
        </p>
      </div>

      <input
        type="file"
        accept=".json,.csv,.xlsx,.xls,application/json,text/csv"
        onChange={(e) => {
          setStatus(null);
          setFile(e.target.files?.[0] ?? null);
          setText("");
        }}
        className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gray-900/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-900/10"
      />
      {file && <p className="text-xs text-gray-500">Selected: {file.name}</p>}

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400">or paste JSON</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setFile(null);
        }}
        rows={8}
        placeholder="Paste school JSON here…"
        className={`${inputClass} font-mono text-xs`}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setShowExample((v) => !v)}
          className="self-start text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          {showExample ? "Hide JSON example" : "See a JSON example"}
        </button>
        <button type="button" onClick={downloadCsvTemplate} className={`self-start text-xs font-medium ${link}`}>
          Download CSV template
        </button>
      </div>
      {showExample && (
        <pre className="overflow-x-auto rounded-xl bg-gray-900/5 p-3 text-xs text-gray-700">
          <code>{EXAMPLE}</code>
        </pre>
      )}

      {status && (
        <p className={`text-sm font-medium ${status.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
          {status.message}
        </p>
      )}

      <div>
        <button type="button" onClick={runImport} disabled={importing} className={btnPrimary}>
          {importing ? "Importing…" : "Import"}
        </button>
      </div>
    </div>
  );
}
