"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteSchoolButton({ schoolId }: { schoolId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
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
        className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
      >
        {deleting ? "Deleting…" : "Confirm"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  );
}
