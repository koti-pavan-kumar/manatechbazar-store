import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Privacy-friendly analytics collector.
 * - No cookies, no PII: sessionId is a random client-generated UUID.
 * - Source is derived server-side from referrer + UTM params.
 * - Rate limited so bots can't flood the table.
 */

const SESSION_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PATH = 300;
const MAX_REFERRER = 300;

const KNOWN_SOURCES: Record<string, string[]> = {
  instagram: ["instagram.com", "instagr.am"],
  google: ["google.", "google.com"],
  facebook: ["facebook.com", "fb.com", "m.facebook.com"],
  youtube: ["youtube.com", "youtu.be"],
  twitter: ["twitter.com", "x.com"],
  telegram: ["t.me", "telegram.org"],
  whatsapp: ["whatsapp.com", "wa.me"],
  bing: ["bing.com"],
  duckduckgo: ["duckduckgo.com"],
  reddit: ["reddit.com"],
  pinterest: ["pinterest."],
  linkedin: ["linkedin.com"],
};

function classifySource(referrer: string | null, utmSource: string | null): string {
  if (utmSource) {
    const u = utmSource.toLowerCase();
    for (const [name, domains] of Object.entries(KNOWN_SOURCES)) {
      if (domains.some((d) => u.includes(d) || u === name)) return name;
    }
    return u.slice(0, 40);
  }
  if (!referrer) return "direct";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "direct";
  }
  for (const [name, domains] of Object.entries(KNOWN_SOURCES)) {
    if (domains.some((d) => host === d || host.endsWith(d) || host.includes(d))) return name;
  }
  if (host.includes("l.instagram.com") || host.includes("ig.me")) return "instagram";
  if (host.includes("google") ) return "google";
  return host.slice(0, 40); // store unknown hosts so owner can see them
}

function classifyDevice(userAgent: string | null): string {
  if (!userAgent) return "desktop";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return "tablet";
  if (/mobi|iphone|android.*mobile|windows phone/.test(ua)) return "mobile";
  if (/android/.test(ua)) return "tablet";
  return "desktop";
}

export async function POST(req: NextRequest) {
  // Rate limit: 60 pageviews / minute / IP is far above any human,
  // but stops bots from flooding the analytics table.
  const ip = getClientIp(req);
  const rl = rateLimit(ip, { key: "track", maxRequests: 60, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await req.json();
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
    const path = typeof body?.path === "string" ? body.path : "";
    const referrer = typeof body?.referrer === "string" ? body.referrer : null;
    const utmSource = typeof body?.utmSource === "string" ? body.utmSource.slice(0, 100) : null;
    const utmMedium = typeof body?.utmMedium === "string" ? body.utmMedium.slice(0, 100) : null;

    // Validate: reject garbage before it touches the DB
    if (!SESSION_RE.test(sessionId) || !path.startsWith("/") || path.startsWith("//")) {
      return NextResponse.json({ ok: true }); // silently ignore malformed hits
    }

    const country = req.headers.get("x-vercel-ip-country") || null;
    const device = classifyDevice(req.headers.get("user-agent"));
    const source = classifySource(referrer, utmSource);

    await db.pageView.create({
      data: {
        sessionId,
        path: path.slice(0, MAX_PATH),
        referrer: referrer ? referrer.slice(0, MAX_REFERRER) : null,
        source,
        utmSource,
        utmMedium,
        country,
        device,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never let analytics break the page
    return NextResponse.json({ ok: true });
  }
}
