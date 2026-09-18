"use client";

import { useEffect, useState } from "react";
import { getSchoolLogoUrl, initialsAvatar } from "@/lib/logo";

export default function SchoolLogo({
  name,
  website,
  size = 32,
  className = "",
}: {
  name: string;
  website?: string | null;
  size?: number;
  className?: string;
}) {
  const url = getSchoolLogoUrl(website, size * 2); // fetch at 2x for sharper display
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(url ? "loading" : "failed");

  useEffect(() => {
    if (!url) return;
    // A clean onError isn't guaranteed — some networks (ad blockers,
    // restrictive proxies) silently hang a blocked request instead of
    // rejecting it, which would otherwise leave the logo stuck loading
    // forever. Our own /api/logo resolver also does its own server-side
    // fetch on a cache miss, so give it a bit more room than a plain image.
    const timeout = setTimeout(() => setStatus((s) => (s === "loading" ? "failed" : s)), 7000);
    return () => clearTimeout(timeout);
  }, [url]);

  if (!url || status === "failed") {
    const { initials, classes } = initialsAvatar(name);
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-lg font-semibold ${classes} ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-hidden="true"
      >
        {initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external, unpredictable-domain favicon URLs aren't a fit for next/image's fixed-domain optimizer
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-lg border border-black/5 bg-white object-contain ${status === "loaded" ? "" : "invisible"} ${className}`}
      style={{ width: size, height: size }}
      onLoad={() => setStatus("loaded")}
      onError={() => setStatus("failed")}
    />
  );
}
