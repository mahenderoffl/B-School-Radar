/**
 * Posts an import to /api/import, whether the input is a real file (any
 * supported extension) or pasted text. Pasted text starting with { or [ is
 * treated as JSON; anything else is treated as CSV and sent through the
 * same file-parsing path as a real upload. Returns the imported count, or
 * throws with a message suitable to show the user.
 */
export async function submitImport(input: { file: File | null; text: string; replace: boolean }): Promise<number> {
  const { file, text, replace } = input;
  let res: Response;

  if (file) {
    const form = new FormData();
    form.append("file", file);
    form.append("replace", String(replace));
    res = await fetch("/api/import", { method: "POST", body: form });
  } else {
    const looksLikeJson = /^\s*[[{]/.test(text);
    if (looksLikeJson) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("That isn't valid JSON.");
      }
      res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsed, replace }),
      });
    } else {
      const form = new FormData();
      form.append("file", new File([text], "pasted.csv", { type: "text/csv" }));
      form.append("replace", String(replace));
      res = await fetch("/api/import", { method: "POST", body: form });
    }
  }

  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Import failed.");
  return body.imported as number;
}
