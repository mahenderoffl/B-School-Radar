// Shared style tokens — pill-shaped buttons, soft-shadow cards, and a single
// blue accent (in the spirit of Apple's restrained, one-accent-color system)
// instead of borders-everywhere. Kept as plain class strings rather than a
// component library since these are single-file Tailwind utility compositions,
// reused as-is across server and client components.

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

export const btnPrimary =
  `inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

export const btnSecondary =
  `inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50 ${focusRing}`;

export const btnGhost =
  `inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-900/5 hover:text-gray-900 ${focusRing}`;

export const btnDanger =
  `inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 ${focusRing.replace("blue-500", "red-500")}`;

export const btnDangerOutline =
  `inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 active:scale-[0.98] ${focusRing.replace("blue-500", "red-500")}`;

export const card = "rounded-2xl bg-white shadow-sm ring-1 ring-black/5";

export const tableCard = "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5";

export const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-colors duration-150 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";

export const checkbox =
  "h-4 w-4 rounded border-gray-300 text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-0";

export const link = `text-blue-600 transition-colors hover:text-blue-700 ${focusRing} rounded-sm`;
