"use client";

export default function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label?: React.ReactNode;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 select-none">
      <span className="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-colors duration-150 checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group-hover:border-gray-400"
        />
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={`pointer-events-none relative h-2.5 w-2.5 text-white ${checked ? "animate-check-pop" : "hidden"}`}
        >
          <path
            d="M2.5 8.5L6 12L13.5 4"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label}
    </label>
  );
}
