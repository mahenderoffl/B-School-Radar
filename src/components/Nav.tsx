"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { btnPrimary } from "@/lib/ui";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/schools", label: "Schools" },
  { href: "/checklist", label: "Checklist" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-sm font-semibold tracking-tight text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <span aria-hidden className="text-xl">🎯</span>
          B-School Radar
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  active ? "bg-gray-900/5 text-gray-900" : "text-gray-600 hover:bg-gray-900/5 hover:text-gray-900"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href="/schools/new" className={`${btnPrimary} ml-2 !px-4 !py-2`}>
            + Add school
          </Link>
        </nav>
      </div>
    </header>
  );
}
