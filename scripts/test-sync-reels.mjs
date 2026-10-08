// End-to-end test for scripts/sync-reels.mjs using mocked Graph API + Cloudinary.
// Run: node scripts/.test-sync-reels.mjs
// Backs up src/data/reels.json, runs the real script against the mock, asserts
// the result, then restores the original file. Exits non-zero on any failure.
import { createServer } from "node:http";
import { readFile, writeFile, copyFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REELS_FILE = path.join(ROOT, "src", "data", "reels.json");
const BACKUP = path.join(ROOT, "src", "data", "reels.json.bak-test");

const uploadCalls = [];
let lookupHits = 0;

const MEDIA = [
  // newest first — as the Graph API returns them
  { id: "m5", media_type: "IMAGE", permalink: "https://www.instagram.com/p/IMGPOST0001/", timestamp: "2026-10-08T10:00:00+0000" }, // must be filtered out
  { id: "m4", media_type: "VIDEO", media_product_type: "REELS", media_url: "https://cdn.ig/video5.mp4", permalink: "https://www.instagram.com/reel/NEWREEL01/", timestamp: "2026-10-07T10:00:00+0000" },
  { id: "m3", media_type: "VIDEO", media_product_type: "REELS", media_url: "https://cdn.ig/video4.mp4", permalink: "https://www.instagram.com/reel/REELAAAA2/", timestamp: "2026-10-06T10:00:00+0000" },
  { id: "m2", media_type: "VIDEO", media_url: "https://cdn.ig/video3.mp4", permalink: "https://www.instagram.com/reel/REELBBBB3/", timestamp: "2026-10-05T10:00:00+0000" },
  { id: "m1", media_type: "VIDEO", media_url: "https://cdn.ig/video2.mp4", permalink: "https://www.instagram.com/reel/REELCCCC4/", timestamp: "2026-10-04T10:00:00+0000" },
  { id: "m0", media_type: "VIDEO", media_url: "https://cdn.ig/video1.mp4", permalink: "https://www.instagram.com/reel/REELDDDD5/", timestamp: "2026-10-03T10:00:00+0000" },
  { id: "mx", media_type: "VIDEO", media_url: "https://cdn.ig/video0.mp4", permalink: "https://www.instagram.com/reel/REEL6TH6/", timestamp: "2026-10-02T10:00:00+0000" }, // 6th — must be dropped
];

const EXPECTED_CODES = ["NEWREEL01", "REELAAAA2", "REELBBBB3", "REELCCCC4", "REELDDDD5"];

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const json = (code, body) => {
    res.writeHead(code, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };

  if (url.pathname.endsWith("/oauth/access_token")) {
    return json(200, { access_token: "refreshed-token-abc" });
  }
  if (url.pathname.endsWith("/me/accounts")) {
    return json(200, { data: [{ id: "page1", instagram_business_account: { id: "IGID123" } }] });
  }
  if (url.pathname.endsWith("/IGID123/media")) {
    const fields = url.searchParams.get("fields") || "";
    if (!fields.includes("media_product_type")) {
      return json(400, { error: { message: "fields must include media_product_type (test assertion)" } });
    }
    return json(200, { data: MEDIA });
  }
  if (url.pathname.includes("/resources/video/upload")) {
    lookupHits += 1;
    const publicId = url.searchParams.get("public_id");
    // Pretend REELAAAA2 is already hosted (skip-upload path)
    if (publicId === "manatechbazar/reels/REELAAAA2") return json(200, { public_id: publicId });
    return json(404, { error: { message: "not found" } });
  }
  if (url.pathname.endsWith("/video/upload") && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      uploadCalls.push(body);
      json(200, { public_id: "ok" });
    });
    return;
  }
  json(404, { error: { message: "unmocked: " + url.pathname } });
});

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

await copyFile(REELS_FILE, BACKUP);
try {
  // NOTE: must be async spawn — spawnSync would block this process's event
  // loop and the mock server above could never answer the child.
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(ROOT, "scripts", "sync-reels.mjs")], {
      cwd: ROOT,
      env: {
        ...process.env,
        GRAPH_API_BASE: `${base}/v23.0`,
        CLOUDINARY_API_BASE: base,
        INSTAGRAM_ACCESS_TOKEN: "initial-token",
        META_APP_ID: "app123",
        META_APP_SECRET: "secret123",
        IG_USER_ID: "",
        CLOUDINARY_CLOUD_NAME: "j8ly7tsg",
        CLOUDINARY_API_KEY: "k",
        CLOUDINARY_API_SECRET: "s",
      },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });

  const failures = [];
  const out = `${result.stdout}${result.stderr}`;
  if (result.status !== 0) failures.push(`script exited ${result.status}\n${out}`);

  const written = JSON.parse(await readFile(REELS_FILE, "utf8"));
  const codes = written.map((r) => r.code);
  if (JSON.stringify(codes) !== JSON.stringify(EXPECTED_CODES)) {
    failures.push(`codes mismatch:\n  got      ${JSON.stringify(codes)}\n  expected ${JSON.stringify(EXPECTED_CODES)}`);
  }
  const expectedIds = EXPECTED_CODES.map((c) => `manatechbazar/reels/${c}`);
  const ids = written.map((r) => r.id);
  if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) {
    failures.push(`ids mismatch: ${JSON.stringify(ids)}`);
  }
  // 5 reels total, 1 already hosted → 4 uploads
  if (uploadCalls.length !== 4) failures.push(`expected 4 uploads, got ${uploadCalls.length}`);
  // every upload must carry a signature + public_id
  for (const [i, body] of uploadCalls.entries()) {
    if (!body.includes("name=\"signature\"")) failures.push(`upload ${i} missing signature`);
    if (!body.includes("name=\"public_id\"")) failures.push(`upload ${i} missing public_id`);
  }
  if (lookupHits !== 5) failures.push(`expected 5 existence checks, got ${lookupHits}`);
  if (!out.includes("token refreshed")) failures.push("token refresh did not run");
  if (!out.includes("reels.json updated")) failures.push("script did not report reels.json update");

  if (failures.length) {
    console.error("FAIL:\n- " + failures.join("\n- "));
    process.exitCode = 1;
  } else {
    console.log("PASS: 5 newest reels written newest-first, IMAGE + 6th reel excluded,");
    console.log("      existing asset skipped, 4 signed uploads issued, token refreshed.");
  }
} finally {
  await copyFile(BACKUP, REELS_FILE);
  const { rm } = await import("node:fs/promises");
  await rm(BACKUP, { force: true });
  server.closeAllConnections?.();
  server.close();
  // undici keeps sockets alive; force-exit so the harness can't hang
  setTimeout(() => process.exit(process.exitCode ?? 0), 500).unref();
}
