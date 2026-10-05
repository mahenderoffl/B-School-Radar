"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnDanger, btnGhost, btnDangerOutline } from "@/lib/ui";
import Modal from "@/components/Modal";

export default function DeleteScholarshipButton({
  scholarshipId,
  scholarshipName,
}: {
  scholarshipId: string;
  scholarshipName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/scholarships/${scholarshipId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/scholarships");
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
      <Modal open={open} onClose={() => setOpen(false)} title="Delete this scholarship?">
        <p className="text-sm text-gray-600">
          This permanently removes <span className="font-medium text-gray-900">{scholarshipName}</span> along with its
          checklist and notes. This can&apos;t be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className={btnGhost}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} className={`${btnDanger} !px-4 !py-2`}>
            {deleting ? "Deleting…" : "Delete scholarship"}
          </button>
        </div>
      </Modal>
    </>
  );
}
