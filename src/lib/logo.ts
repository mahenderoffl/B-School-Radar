/**
 * Derives a logo image URL from a school's website, no manual lookup needed.
 *
 * By default this points at /api/logo, our own resolver that reads the
 * school's own site for its real apple-touch-icon / largest <link rel=icon>
 * (typically 180-512px, so it stays sharp) instead of the low-resolution
 * favicon.ico most sites actually serve — that's what made logos blurry
 * before. If NEXT_PUBLIC_LOGO_DEV_KEY is set (a free publishable key from
 * logo.dev), that higher-res API is used directly instead.
 */
export function getSchoolLogoUrl(website: string | null | undefined, size = 64): string | null {
  const domain = extractDomain(website);
  if (!domain) return null;

  const logoDevKey = process.env.NEXT_PUBLIC_LOGO_DEV_KEY;
  if (logoDevKey) {
    return `https://img.logo.dev/${domain}?token=${logoDevKey}&size=${size}&format=png`;
  }
  return `/api/logo?domain=${encodeURIComponent(domain)}&size=${size}`;
}

export function extractDomain(website: string | null | undefined): string | null {
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
