export function downloadCsvTemplate() {
  const a = document.createElement("a");
  a.href = "/api/import/template";
  a.download = "b-school-radar-import-template.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
