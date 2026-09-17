"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { RoundInfo } from "@/lib/checklist";

export default function ChecklistBoard({ rounds }: { rounds: RoundInfo[] }) {
  const [data, setData] = useState(rounds);

  const grouped = useMemo(() => {
    const map = new Map<string, { roundId: string; schoolId: string; schoolName: string; programName: string; roundNumber: number; itemId: string; done: boolean }[]>();
    for (const round of data) {
      for (const item of round.checklist) {
        const list = map.get(item.label) ?? [];
        list.push({
          roundId: round.roundId,
          schoolId: round.schoolId,
          schoolName: round.schoolName,
          programName: round.programName,
          roundNumber: round.roundNumber,
          itemId: item.id,
          done: item.done,
        });
        map.set(item.label, list);
      }
    }
    return Array.from(map.entries());
  }, [data]);

  async function toggle(roundId: string, itemId: string) {
    const round = data.find((r) => r.roundId === roundId);
    if (!round) return;
    const updatedChecklist = round.checklist.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i));
    setData(data.map((r) => (r.roundId === roundId ? { ...r, checklist: updatedChecklist } : r)));

    await fetch(`/api/rounds/${roundId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskChecklist: JSON.stringify(updatedChecklist) }),
    });
  }

  if (grouped.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
        Nothing to track — every round is either submitted or not yet added.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {grouped.map(([label, items]) => {
        const doneCount = items.filter((i) => i.done).length;
        return (
          <section key={label} className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="font-medium text-gray-900">{label}</h3>
              <span className="text-xs text-gray-500">
                {doneCount}/{items.length} done
              </span>
            </div>
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={`${item.roundId}-${item.itemId}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggle(item.roundId, item.itemId)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Link href={`/schools/${item.schoolId}`} className={`flex-1 ${item.done ? "text-gray-400 line-through" : "text-gray-800"} hover:underline`}>
                    {item.schoolName}
                  </Link>
                  <span className="text-xs text-gray-400">
                    {item.programName} · Round {item.roundNumber}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
