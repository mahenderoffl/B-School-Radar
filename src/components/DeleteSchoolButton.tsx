"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnDanger, btnGhost, btnDangerOutline } from "@/lib/ui";
import Modal from "@/components/Modal";

export default function DeleteSchoolButton({ schoolId, schoolName }: { schoolId: string; schoolName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/schools/${schoolId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/schools");
      router.refresh();
    } else {
      setDeleting(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={`${btnDangerOutline} !px-4 !py-2`}>
        Delete
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Delete this school?">
        <p className="text-sm text-gray-600">
          This permanently removes <span className="font-medium text-gray-900">{schoolName}</span> and every round,
          requirement, scholarship, and checklist entry under it. This can&apos;t be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className={btnGhost}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} className={`${btnDanger} !px-4 !py-2`}>
            {deleting ? "Deleting…" : "Delete school"}
          </button>
        </div>
      </Modal>
    </>
  );
}
