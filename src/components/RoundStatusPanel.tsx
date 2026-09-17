"use client";

import { useState, useTransition } from "react";
import { APPLICATION_STAGE_LABELS, parseChecklist } from "@/lib/utils";

type ChecklistItem = { id: string; label: string; done: boolean };

export default function RoundStatusPanel({
  roundId,
  initialStatus,
  initialChecklist,
  initialNotes,
}: {
  roundId: string;
  initialStatus: string;
  initialChecklist: string;
  initialNotes: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(parseChecklist(initialChecklist));
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function save(next: { status?: string; checklist?: ChecklistItem[]; notes?: string }) {
    startTransition(async () => {
      const res = await fetch(`/api/rounds/${roundId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: next.status ?? status,
          taskChecklist: JSON.stringify(next.checklist ?? checklist),
          notes: next.notes ?? notes,
        }),
      });
      if (res.ok) setSavedAt(Date.now());
    });
  }

  function toggleItem(id: string) {
    const updated = checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
    setChecklist(updated);
    save({ checklist: updated });
  }

  function changeStatus(next: string) {
    setStatus(next);
    save({ status: next });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</label>
        {isPending && <span className="text-xs text-gray-400">Saving…</span>}
        {!isPending && savedAt && <span className="text-xs text-emerald-600">Saved</span>}
      </div>
      <select
        value={status}
        onChange={(e) => changeStatus(e.target.value)}
        className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        {Object.entries(APPLICATION_STAGE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Checklist</div>
      <ul className="mb-4 flex flex-col gap-1.5">
        {checklist.map((item) => (
          <li key={item.id}>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem(item.id)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className={item.done ? "text-gray-400 line-through" : ""}>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>

      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Notes</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => save({ notes })}
        rows={2}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        placeholder="Any notes for this round…"
      />
    </div>
  );
}
