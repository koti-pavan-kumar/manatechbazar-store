#!/usr/bin/env node
/**
 * sync-reels.mjs — refresh src/data/reels.json with the 5 newest Instagram reels.
 *
 * Flow (runs in GitHub Actions every 6h, or locally with `node scripts/sync-reels.mjs`):
 *   1. Read a long-lived Instagram access token (env or .sync-cache.json).
 *   2. Auto-refresh the token via the Meta app id/secret (keeps it alive forever).
 *   3. Resolve the Instagram user id (env IG_USER_ID, cache, or /me/accounts).
 *   4. GET /{ig-user-id}/media — newest first — keep reels only, take 5.
 *   5. For each reel: upload its video to Cloudinary (idempotent by shortcode).
 *   6. Write src/data/reels.json (newest first) — commit triggers a Vercel deploy.
 *
 * Required env: INSTAGRAM_ACCESS_TOKEN, CLOUDINARY_CLOUD_NAME,
 *               CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * Optional env: META_APP_ID, META_APP_SECRET (enables auto token refresh),
 *               IG_USER_ID, GRAPH_API_VERSION
 * Token state is persisted in .sync-cache.json between runs.
 *
 * No database involvement — this only writes one JSON file. Safe by design.
 */

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_FILE = path.join(ROOT, ".sync-cache.json");
const REELS_FILE = path.join(ROOT, "src", "data", "reels.json");
const GRAPH =
  process.env.GRAPH_API_BASE ||
  `https://graph.facebook.com/${process.env.GRAPH_API_VERSION || "v23.0"}`;
const CLOUD_API = process.env.CLOUDINARY_API_BASE || "https://api.cloudinary.com";
const MAX_REELS = 5;
const FOLDER = "manatechbazar/reels";

// ── tiny helpers ────────────────────────────────────────────────────────────
const log = (...a) => console.log("[sync-reels]", ...a);
const fail = (msg) => {
  console.error("[sync-reels] ERROR:", msg);
  process.exit(1);
};

async function graph(pathname, params = {}) {
  const qs = new URLSearchParams({ ...params, access_token: params.access_token || token });
  delete params.access_token;
  const res = await fetch(`${GRAPH}${pathname}?${qs}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(`Graph API ${pathname}: ${json.error?.message || res.status}`);
  }
  return json;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

// ── 0. load local .env when running outside CI ──────────────────────────────
if (existsSync(path.join(ROOT, ".env")) && !process.env.INSTAGRAM_ACCESS_TOKEN) {
  for (const line of readFileSync(path.join(ROOT, ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

// ── 1. token (env first, then cached — cache holds the refreshed copy) ─────
const cache = await readJson(CACHE_FILE, {});
let token = process.env.INSTAGRAM_ACCESS_TOKEN || cache.token;
if (!token) {
  fail(
    "No INSTAGRAM_ACCESS_TOKEN. Follow REELS_SYNC_SETUP.md to create the Meta app token " +
      "and add it as a GitHub secret."
  );
}

// ── 2. auto-refresh so the token never expires (60-day clock resets each run)
if (process.env.META_APP_ID && process.env.META_APP_SECRET) {
  try {
    const r = await fetch(
      `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}` +
        `&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${token}`
    );
    const j = await r.json();
    if (j.access_token) {
      if (j.access_token !== token) log("token refreshed (60-day clock reset)");
      token = j.access_token;
    } else {
      log("token refresh failed (continuing with current token):", j.error?.message);
    }
  } catch (e) {
    log("token refresh error (continuing):", e.message);
  }
}

// ── 3. instagram user id ────────────────────────────────────────────────────
let igUserId = process.env.IG_USER_ID || cache.igUserId;
if (!igUserId) {
  const me = await graph("/me/accounts", { fields: "instagram_business_account{id}" });
  const page = me.data?.find((p) => p.instagram_business_account) || me.data?.[0];
  if (!page?.instagram_business_account) {
    fail(
      "No Instagram Professional account linked to your Facebook Page. " +
        "The IG account must be a Business/Creator account connected to a Page you manage."
    );
  }
  igUserId = page.instagram_business_account.id;
  log("resolved IG user id", igUserId);
}

// ── 4. newest media → reels only ────────────────────────────────────────────
const media = await graph(`/${igUserId}/media`, {
  fields: "id,media_type,media_product_type,media_url,permalink,timestamp,thumbnail_url",
  limit: 25,
});
// Reels report as media_product_type REELS; older/edge cases report
// media_type VIDEO/REELS. Feed videos without the product type count too —
// the account only posts reels.
const isReel = (m) =>
  m.media_product_type === "REELS" ||
  m.media_type === "REELS" ||
  m.media_type === "REEL" ||
  m.media_type === "VIDEO";
const reels = (media.data || [])
  .filter(isReel)
  .filter((m) => m.media_url)
  .slice(0, MAX_REELS)
  .map((m) => ({
    code: (m.permalink || "").split("/").filter(Boolean).pop() || null,
    mediaUrl: m.media_url,
    thumbUrl: m.thumbnail_url || null,
    timestamp: m.timestamp,
  }));
if (!reels.length) fail("No video reels returned by the Graph API.");
log(`fetched ${reels.length} newest reel(s):`, reels.map((r) => r.code).join(", "));

// ── 5. host videos on Cloudinary (signed upload, idempotent per shortcode) ──
const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
if (!cloud || !apiKey || !apiSecret) fail("Missing Cloudinary credentials.");

function cloudinarySign(params) {
  const toSign = Object.keys(params)
    .sort()
    .filter((k) => k !== "api_key" && k !== "resource_type")
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

async function alreadyOnCloudinary(publicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const signature = cloudinarySign(params);
  const qs = new URLSearchParams({ ...params, api_key: apiKey, signature });
  const res = await fetch(
    `${CLOUD_API}/v1_1/${cloud}/resources/video/upload?${qs}`
  );
  return res.ok;
}

async function uploadToCloudinary(publicId, remoteUrl) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp, overwrite: "true" };
  const signature = cloudinarySign(params);
  const form = new FormData();
  form.append("file", remoteUrl); // Cloudinary fetches the source video itself
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("public_id", publicId);
  form.append("overwrite", "true");
  form.append("signature", signature);
  const res = await fetch(`${CLOUD_API}/v1_1/${cloud}/video/upload`, {
    method: "POST",
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Cloudinary upload ${publicId}: ${json.error?.message || res.status}`);
  return json;
}

const output = [];
for (const reel of reels) {
  if (!reel.code) {
    log("skipping reel with unparseable permalink:", reel.mediaUrl);
    continue;
  }
  const publicId = `${FOLDER}/${reel.code}`;
  try {
    if (await alreadyOnCloudinary(publicId)) {
      log(`${reel.code} already on Cloudinary — skipping upload`);
    } else {
      await uploadToCloudinary(publicId, reel.mediaUrl);
      log(`${reel.code} uploaded to Cloudinary`);
    }
    output.push({ code: reel.code, id: publicId });
  } catch (e) {
    // Keep the old entry for this reel if we had one; never let one bad reel
    // wipe the section.
    const prev = (await readJson(REELS_FILE, [])).find((r) => r.code === reel.code);
    if (prev) {
      log(`keeping previous entry for ${reel.code}: ${e.message}`);
      output.push(prev);
    } else {
      log(`skipping ${reel.code}: ${e.message}`);
    }
  }
}
if (!output.length) fail("No reels could be prepared — leaving reels.json untouched.");

// ── 6. write the manifest (only if it actually changed) ─────────────────────
const current = await readFile(REELS_FILE, "utf8").catch(() => "[]");
const next = JSON.stringify(output, null, 2) + "\n";
if (current === next) {
  log("reels.json unchanged — nothing to commit");
} else {
  await writeFile(REELS_FILE, next, "utf8");
  log(`reels.json updated (${output.length} reels) — deploy will pick this up`);
}

await writeFile(CACHE_FILE, JSON.stringify({ token, igUserId }), "utf8");
log("done");
