"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary, btnSecondary, card, link, inputClass } from "@/lib/ui";
import Checkbox from "@/components/Checkbox";
import Modal from "@/components/Modal";
import { downloadCsvTemplate } from "@/lib/downloadTemplate";
import { submitImport } from "@/lib/submitImport";
import ResearchPromptHelper from "@/components/ResearchPromptHelper";

type Status = { type: "success" | "error"; message: string } | null;

export default function ImportExportPanel() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [replace, setReplace] = useState(false);
  const [confirmingReplace, setConfirmingReplace] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function runImport() {
    if (!file && !text.trim()) return;
    setImporting(true);
    setStatus(null);

    try {
      const imported = await submitImport({ file, text, replace });
      setStatus({ type: "success", message: `Imported ${imported} school${imported === 1 ? "" : "s"}.` });
      setFile(null);
      setText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Import failed." });
    } finally {
      setImporting(false);
    }
  }

  function handleImportClick() {
    if (replace) {
      setConfirmingReplace(true);
    } else {
      runImport();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className={`${card} p-5`}>
        <h2 className="text-base font-semibold tracking-tight text-gray-900">Export</h2>
        <p className="mt-1 text-sm text-gray-500">
          Download every school, program, round, requirement, scholarship, and checklist entry as one JSON file — a
          full backup, or a way to move your data to another deployment.
        </p>
        <a href="/api/export" download className={`${btnPrimary} mt-4 inline-flex`}>
          Download export (.json)
        </a>
      </section>

      <section className={`${card} p-5`}>
        <h2 className="text-base font-semibold tracking-tight text-gray-900">Import</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload a <code className="text-xs">.json</code> file previously downloaded from Export, or a{" "}
          <code className="text-xs">.csv</code>/<code className="text-xs">.xlsx</code>/<code className="text-xs">.xls</code>{" "}
          spreadsheet of deadlines, test requirements, and scholarships (one row per round) — or paste JSON or CSV
          text directly. Imported schools get new IDs, so this is safe to run more than once.
        </p>
        <button type="button" onClick={downloadCsvTemplate} className={`mt-2 block text-sm font-medium ${link}`}>
          Download CSV template
        </button>
        <div className="mt-2">
          <ResearchPromptHelper />
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.xlsx,.xls,application/json,text/csv"
              onChange={(e) => {
                setStatus(null);
                setFile(e.target.files?.[0] ?? null);
                setText("");
              }}
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gray-900/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-900/10"
            />
            {file && <p className="mt-1.5 text-xs text-gray-500">Selected: {file.name}</p>}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">or paste JSON or CSV</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <textarea
            value={text}
            onChange={(e) => {
              setStatus(null);
              setText(e.target.value);
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            rows={6}
            placeholder="Paste export JSON or CSV rows here…"
            className={`${inputClass} font-mono text-xs`}
          />

          <Checkbox
            checked={replace}
            onChange={() => setReplace((v) => !v)}
            label={
              <span className="text-sm text-gray-700">
                Replace all existing data <span className="text-gray-400">(instead of adding alongside it)</span>
              </span>
            }
          />

          {status && (
            <p className={`text-sm font-medium ${status.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
              {status.message}
            </p>
          )}

          <div>
            <button onClick={handleImportClick} disabled={(!file && !text.trim()) || importing} className={btnPrimary}>
              {importing ? "Importing…" : "Import"}
            </button>
          </div>
        </div>
      </section>

      <Modal open={confirmingReplace} onClose={() => setConfirmingReplace(false)} title="Replace all existing data?">
        <p className="text-sm text-gray-600">
          This deletes every school currently tracked before importing. There&apos;s no undo — export a backup first
          if you&apos;re not sure.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setConfirmingReplace(false)} className={btnSecondary}>
            Cancel
          </button>
          <button
            onClick={() => {
              setConfirmingReplace(false);
              runImport();
            }}
            className={btnPrimary}
          >
            Replace and import
          </button>
        </div>
      </Modal>
    </div>
  );
}
