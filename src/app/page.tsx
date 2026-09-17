import Link from "next/link";
import { btnPrimary, btnSecondary, card } from "@/lib/ui";
import Logo from "@/components/Logo";

const features = [
  {
    title: "Deadline tracking",
    body: "Every round across every school, sorted by how soon it closes and color-coded by urgency — nothing buried in a spreadsheet tab.",
  },
  {
    title: "Application checklist",
    body: "Test scores, essays, LORs, transcripts, fees — tracked per round, and grouped across schools so one task's status is visible everywhere it applies.",
  },
  {
    title: "Requirements & scholarships",
    body: "GMAT/GRE/IELTS/TOEFL waivers, minimum scores, and every scholarship deadline and form requirement, per program.",
  },
  {
    title: "Import & export",
    body: "JSON for a full backup, or CSV/Excel for bulk-entering deadlines from a spreadsheet — per school or for everything at once.",
  },
];

const steps = [
  { n: "1", title: "Add your schools", body: "Enter each school's current-cycle rounds, requirements, and scholarships from its admissions page." },
  { n: "2", title: "Watch the dashboard", body: "Everything open, sorted by days remaining, so you always know what needs attention next." },
  { n: "3", title: "Check things off", body: "Mark tasks and statuses as you go — per round, or across every school at once from the checklist view." },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="flex items-center gap-2 font-semibold tracking-tight text-gray-900">
            <Logo size={28} />
            B-School Radar
          </span>
          <Link href="/dashboard" className={`${btnPrimary} !px-4 !py-2`}>
            Open Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h1 className="animate-fade-in-up text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Never miss an MBA application deadline.
          </h1>
          <p
            className="animate-fade-in-up mt-5 text-lg text-gray-500"
            style={{ animationDelay: "80ms" }}
          >
            Every school, every round, every requirement and scholarship — tracked in one place, with a checklist
            that follows you from &quot;not started&quot; to submitted.
          </p>
          <div className="animate-fade-in-up mt-8 flex items-center justify-center gap-3" style={{ animationDelay: "140ms" }}>
            <Link href="/dashboard" className={btnPrimary}>
              Open Dashboard
            </Link>
            <Link href="/schools" className={btnSecondary}>
              View schools
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className={`${card} p-6`}>
                <h2 className="text-base font-semibold tracking-tight text-gray-900">{f.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-black/5 bg-white/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-gray-900">How it works</h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {s.n}
                  </div>
                  <h3 className="mt-3 text-base font-semibold tracking-tight text-gray-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 px-4 py-8 text-center text-sm text-gray-400 sm:px-6">
        Built for tracking your own applications — not a product, just a tool.
      </footer>
    </div>
  );
}
