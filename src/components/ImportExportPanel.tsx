"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary, btnSecondary, card } from "@/lib/ui";
import Checkbox from "@/components/Checkbox";
import Modal from "@/components/Modal";

type Status = { type: "success" | "error"; message: string } | null;

export default function ImportExportPanel() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<string | null>(null);
  const [replace, setReplace] = useState(false);
  const [confirmingReplace, setConfirmingReplace] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  function handleFile(file: File) {
    setStatus(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFileContents(reader.result as string);
    reader.readAsText(file);
  }

  async function runImport() {
    if (!fileContents) return;
    setImporting(true);
    setStatus(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(fileContents);
    } catch {
      setStatus({ type: "error", message: "That file isn't valid JSON." });
      setImporting(false);
      return;
    }

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsed, replace }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Import failed.");
      setStatus({ type: "success", message: `Imported ${body.imported} school${body.imported === 1 ? "" : "s"}.` });
      setFileName(null);
      setFileContents(null);
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
          Upload a file previously downloaded from Export. Imported schools get new IDs, so this is safe to run more
          than once.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gray-900/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-900/10"
            />
            {fileName && <p className="mt-1.5 text-xs text-gray-500">Selected: {fileName}</p>}
          </div>

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
            <button onClick={handleImportClick} disabled={!fileContents || importing} className={btnPrimary}>
              {importing ? "Importing…" : "Import"}
            </button>
          </div>
        </div>
      </section>

      <Modal open={confirmingReplace} onClose={() => setConfirmingReplace(false)} title="Replace all existing data?">
        <p className="text-sm text-gray-600">
          This deletes every school currently tracked before importing the file. There&apos;s no undo — export a
          backup first if you&apos;re not sure.
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
