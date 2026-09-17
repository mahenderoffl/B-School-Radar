"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { APPLICATION_STAGE_LABELS, parseChecklist } from "@/lib/utils";
import { card, inputClass } from "@/lib/ui";
import Checkbox from "@/components/Checkbox";

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
  const [showSaved, setShowSaved] = useState(false);

  const doneCount = checklist.filter((i) => i.done).length;
  const progress = useMemo(
    () => (checklist.length === 0 ? 0 : Math.round((doneCount / checklist.length) * 100)),
    [doneCount, checklist.length]
  );

  useEffect(() => {
    if (!showSaved) return;
    const t = setTimeout(() => setShowSaved(false), 1600);
    return () => clearTimeout(t);
  }, [showSaved]);

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
      if (res.ok) setShowSaved(true);
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
    <div className={`${card} p-4 transition-shadow duration-200 hover:shadow-md`}>
      <div className="mb-3 flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</label>
        <span className="relative h-4 text-xs font-medium">
          <span className={`absolute right-0 text-gray-400 transition-opacity duration-200 ${isPending ? "opacity-100" : "opacity-0"}`}>
            Saving…
          </span>
          <span
            className={`absolute right-0 flex items-center gap-1 text-emerald-600 transition-all duration-300 ${
              showSaved && !isPending ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
            }`}
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path d="M2.5 8.5L6 12L13.5 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Saved
          </span>
        </span>
      </div>
      <select value={status} onChange={(e) => changeStatus(e.target.value)} className={`${inputClass} mb-4`}>
        {Object.entries(APPLICATION_STAGE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Checklist</span>
        <span className="text-xs font-medium text-gray-400">
          {doneCount}/{checklist.length}
        </span>
      </div>
      {checklist.length > 0 && (
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <ul className="mb-4 flex flex-col gap-2">
        {checklist.map((item) => (
          <li key={item.id}>
            <Checkbox
              checked={item.done}
              onChange={() => toggleItem(item.id)}
              label={
                <span className={`text-sm transition-colors duration-150 ${item.done ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  {item.label}
                </span>
              }
            />
          </li>
        ))}
      </ul>

      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Notes</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => save({ notes })}
        rows={2}
        className={inputClass}
        placeholder="Any notes for this round…"
      />
    </div>
  );
}
