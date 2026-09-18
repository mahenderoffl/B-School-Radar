/**
 * Derives a logo image URL from a school's website, no manual lookup needed.
 *
 * Uses Google's public favicon service by default — free, no signup, no API
 * key, and has been stable for years (unlike Clearbit's old logo.clearbit.com,
 * which shut down in December 2025). Favicons cap out at fairly low
 * resolution, so this is "good enough to identify a school at a glance," not
 * a crisp brand logo. For sharper logos, set NEXT_PUBLIC_LOGO_DEV_KEY (a free
 * publishable key from logo.dev) and this switches to their higher-res API.
 */
export function getSchoolLogoUrl(website: string | null | undefined, size = 64): string | null {
  const domain = extractDomain(website);
  if (!domain) return null;

  const logoDevKey = process.env.NEXT_PUBLIC_LOGO_DEV_KEY;
  if (logoDevKey) {
    return `https://img.logo.dev/${domain}?token=${logoDevKey}&size=${size}&format=png`;
  }
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

function extractDomain(website: string | null | undefined): string | null {
  if (!website) return null;
  const withProtocol = /^https?:\/\//i.test(website) ? website : `https://${website}`;
  try {
    return new URL(withProtocol).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

const AVATAR_PALETTE = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-800",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
] as const;

export function initialsAvatar(name: string): { initials: string; classes: string } {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).filter(Boolean);
  const initials = (words[0]?.[0] ?? "?") + (words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "");

  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const classes = AVATAR_PALETTE[hash % AVATAR_PALETTE.length];

  return { initials: initials.toUpperCase(), classes };
}
