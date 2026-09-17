import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/schools", label: "Schools" },
  { href: "/checklist", label: "Checklist" },
];

export default function Nav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
          <span aria-hidden className="text-xl">🎯</span>
          B-School Radar
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/schools/new"
            className="ml-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            + Add school
          </Link>
        </nav>
      </div>
    </header>
  );
}
