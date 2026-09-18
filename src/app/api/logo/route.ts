import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractDomain } from "@/lib/logo";

/**
 * Resolves a school's actual site icon instead of the low-res favicon.ico
 * most sites serve behind Google's/DuckDuckGo's favicon services — reading
 * <link rel="apple-touch-icon"> / <link rel="icon" sizes="..."> from the
 * site's own <head> gets a real 180-512px asset, which is what "HD" here
 * actually means (there's no way to upscale a 16px favicon into something
 * sharp; you have to find a bigger source image instead).
 *
 * Only resolves domains that belong to a school already stored in this
 * database — otherwise this endpoint would work as an open server-side
 * fetch proxy for arbitrary domains, since it fetches the target site itself.
 */

const FALLBACK_SZ = 256;
const HOMEPAGE_TIMEOUT_MS = 2500;
const ICON_TIMEOUT_MS = 2500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = { url: string | null; expiresAt: number };
const resolvedUrlCache = new Map<string, CacheEntry>();

function googleFallback(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${FALLBACK_SZ}`;
}

async function fetchWithTimeout(url: string, ms: number, init?: RequestInit): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, redirect: "follow" });
    return res.ok ? res : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractAttr(tag: string, name: string): string | null {
  const m = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  if (!m) return null;
  return m[1] ?? m[2] ?? m[3] ?? null;
}

/** Picks the highest-resolution icon declared in a page's <head>. */
function biggestIconHref(html: string, baseUrl: string): string | null {
  // Icons are always declared near the top of <head>; no need to scan the whole page.
  const head = html.slice(0, 100_000);
  let best: { href: string; score: number } | null = null;

  for (const tag of head.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = (extractAttr(tag, "rel") ?? "").toLowerCase();
    if (!rel.includes("icon")) continue;
    const href = extractAttr(tag, "href");
    if (!href) continue;

    const sizesAttr = (extractAttr(tag, "sizes") ?? "").toLowerCase();
    const sizeMatch = /(\d+)x\d+/.exec(sizesAttr);
    let score = sizeMatch ? Number(sizeMatch[1]) : 32;
    if (rel.includes("apple-touch-icon")) score = Math.max(score, 180);
    if (sizesAttr === "any") score = Math.max(score, 64);

    if (!best || score > best.score) {
      try {
        best = { href: new URL(href, baseUrl).toString(), score };
      } catch {
        // malformed href — skip it
      }
    }
  }

  return best?.href ?? null;
}

async function resolveIconUrl(domain: string): Promise<string | null> {
  const pageUrl = `https://${domain}/`;

  const homepage = await fetchWithTimeout(pageUrl, HOMEPAGE_TIMEOUT_MS);
  if (homepage) {
    const html = await homepage.text().catch(() => "");
    const found = biggestIconHref(html, pageUrl);
    if (found) return found;
  }

  const guess = `https://${domain}/apple-touch-icon.png`;
  if (await fetchWithTimeout(guess, 1500, { method: "HEAD" })) return guess;

  return null;
}

async function knownSchoolDomains(): Promise<Set<string>> {
  const schools = await prisma.school.findMany({ select: { website: true } });
  const domains = new Set<string>();
  for (const s of schools) {
    const d = extractDomain(s.website);
    if (d) domains.add(d);
  }
  return domains;
}

export async function GET(req: NextRequest) {
  const domain = (req.nextUrl.searchParams.get("domain") ?? "").toLowerCase().trim();
  if (!domain) {
    return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  }

  const known = await knownSchoolDomains();
  if (!known.has(domain)) {
    return NextResponse.json({ error: "Unknown domain" }, { status: 404 });
  }

  const cached = resolvedUrlCache.get(domain);
  const iconUrl =
    cached && cached.expiresAt > Date.now() ? cached.url : await resolveIconUrl(domain).catch(() => null);
  if (!cached || cached.expiresAt <= Date.now()) {
    resolvedUrlCache.set(domain, { url: iconUrl, expiresAt: Date.now() + CACHE_TTL_MS });
  }

  if (!iconUrl) {
    return NextResponse.redirect(googleFallback(domain), { status: 302 });
  }

  const iconRes = await fetchWithTimeout(iconUrl, ICON_TIMEOUT_MS);
  if (!iconRes || !iconRes.body) {
    return NextResponse.redirect(googleFallback(domain), { status: 302 });
  }

  return new NextResponse(iconRes.body, {
    headers: {
      "Content-Type": iconRes.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
