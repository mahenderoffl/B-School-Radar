"use client";

import { useState } from "react";
import SchoolForm from "@/components/SchoolForm";
import ImportSchoolForm from "@/components/ImportSchoolForm";

export default function AddSchoolTabs() {
  const [mode, setMode] = useState<"manual" | "import">("manual");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-fit gap-1 rounded-full bg-gray-900/5 p-1">
        <TabButton active={mode === "manual"} onClick={() => setMode("manual")}>
          Enter manually
        </TabButton>
        <TabButton active={mode === "import"} onClick={() => setMode("import")}>
          Import from JSON
        </TabButton>
      </div>
      {mode === "manual" ? <SchoolForm mode="create" /> : <ImportSchoolForm />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}
