"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { RoundInfo } from "@/lib/checklist";
import { card } from "@/lib/ui";
import Checkbox from "@/components/Checkbox";
import SchoolLogo from "@/components/SchoolLogo";

export default function ChecklistBoard({ rounds }: { rounds: RoundInfo[] }) {
  const [data, setData] = useState(rounds);

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { roundId: string; schoolId: string; schoolName: string; schoolWebsite: string | null; programName: string; roundNumber: number; itemId: string; done: boolean }[]
    >();
    for (const round of data) {
      for (const item of round.checklist) {
        const list = map.get(item.label) ?? [];
        list.push({
          roundId: round.roundId,
          schoolId: round.schoolId,
          schoolName: round.schoolName,
          schoolWebsite: round.schoolWebsite,
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
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 px-4 py-10 text-center text-sm text-gray-500">
        Nothing to track — every round is either submitted or not yet added.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {grouped.map(([label, items]) => {
        const doneCount = items.filter((i) => i.done).length;
        const progress = Math.round((doneCount / items.length) * 100);
        return (
          <section key={label} className={`${card} overflow-hidden`}>
            <div className="px-4 pt-3.5 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight text-gray-900">{label}</h3>
                <span className="text-xs font-medium text-gray-500">
                  {doneCount}/{items.length} done
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <ul className="divide-y divide-gray-100 border-t border-gray-100">
              {items.map((item) => (
                <li key={`${item.roundId}-${item.itemId}`} className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50/60">
                  <Checkbox checked={item.done} onChange={() => toggle(item.roundId, item.itemId)} />
                  <Link
                    href={`/schools/${item.schoolId}`}
                    className={`flex flex-1 items-center gap-2.5 transition-colors ${item.done ? "text-gray-400 line-through" : "text-gray-800 hover:text-blue-600"}`}
                  >
                    <SchoolLogo name={item.schoolName} website={item.schoolWebsite} size={20} />
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
