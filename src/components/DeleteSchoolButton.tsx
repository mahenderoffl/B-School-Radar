"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnDanger, btnDangerOutline, btnGhost } from "@/lib/ui";

export default function DeleteSchoolButton({ schoolId }: { schoolId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className={`${btnDangerOutline} !px-4 !py-2`}>
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Delete this school?</span>
      <button
        disabled={deleting}
        onClick={async () => {
          setDeleting(true);
          const res = await fetch(`/api/schools/${schoolId}`, { method: "DELETE" });
          if (res.ok) {
            router.push("/schools");
            router.refresh();
          } else {
            setDeleting(false);
          }
        }}
        className={`${btnDanger} !px-4 !py-2`}
      >
        {deleting ? "Deleting…" : "Confirm"}
      </button>
      <button onClick={() => setConfirming(false)} className={btnGhost}>
        Cancel
      </button>
    </div>
  );
}
