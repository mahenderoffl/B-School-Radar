export default function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
      <circle cx="18" cy="22" r="11" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
      <circle cx="18" cy="22" r="6.2" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
      <circle cx="18" cy="22" r="1.8" fill="white" />
      <circle cx="27" cy="11" r="2.4" fill="white" />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
