"use client";

import { useState } from "react";
import { inputClass, btnSecondary, link } from "@/lib/ui";
import { buildResearchPrompt } from "@/lib/researchPrompt";

export default function ResearchPromptHelper() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(buildResearchPrompt(name));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} className={`text-sm font-medium ${link}`}>
        {open ? "Hide research prompt" : "Get a research prompt for an LLM"}
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3 rounded-xl bg-gray-900/5 p-4">
          <p className="text-sm text-gray-600">
            No automatic data source exists for admissions deadlines or scholarships, but any LLM you already use can
            research a school for you. Copy this prompt, paste it into ChatGPT, Claude, or similar, then paste{" "}
            <em>its</em> CSV output into the box below.
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={'School name and program (optional, e.g. "Wharton MBA")'}
            className={inputClass}
          />
          <button type="button" onClick={copyPrompt} className={`${btnSecondary} self-start`}>
            {copied ? "Copied!" : "Copy prompt"}
          </button>
          <p className="text-xs text-gray-500">
            Always spot-check the result against the school&apos;s own admissions page before relying on it — LLMs
            can get dates wrong, especially for cycles that haven&apos;t been announced yet.
          </p>
        </div>
      )}
    </div>
  );
}
