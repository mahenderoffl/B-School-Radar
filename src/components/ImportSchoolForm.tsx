"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary, card, inputClass } from "@/lib/ui";

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
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showExample, setShowExample] = useState(false);

  function handleFile(file: File) {
    setFileName(file.name);
    setStatus(null);
    const reader = new FileReader();
    reader.onload = () => setText(reader.result as string);
    reader.readAsText(file);
  }

  async function runImport() {
    setStatus(null);
    if (!text.trim()) {
      setStatus({ type: "error", message: "Paste JSON or choose a file first." });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setStatus({ type: "error", message: "That isn't valid JSON." });
      return;
    }

    setImporting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsed, replace: false }),
      });
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
          Paste JSON for one school, a list of schools, or a file from another school&apos;s Export button (or the
          full export from the Data page).
        </p>
      </div>

      <input
        type="file"
        accept="application/json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gray-900/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-900/10"
      />
      {fileName && <p className="text-xs text-gray-500">Selected: {fileName}</p>}

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setFileName(null);
        }}
        rows={8}
        placeholder="Paste school JSON here…"
        className={`${inputClass} font-mono text-xs`}
      />

      <button
        type="button"
        onClick={() => setShowExample((v) => !v)}
        className="self-start text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
      >
        {showExample ? "Hide example" : "See an example"}
      </button>
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
