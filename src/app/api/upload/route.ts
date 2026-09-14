import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// Allowed MIME types
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// File extension → MIME type mapping for validation
const EXTENSION_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Magic bytes for image validation
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/gif": [0x47, 0x49, 0x46, 0x38],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF (WebP starts with RIFF)
};

function validateMagicBytes(buffer: Buffer, expectedType: string): boolean {
  const magic = MAGIC_BYTES[expectedType];
  if (!magic) return true; // No magic bytes to check
  for (let i = 0; i < magic.length; i++) {
    if (buffer[i] !== magic[i]) return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 20 uploads per user per hour
  const userId = (session.user as any).id;
  const rl = rateLimit(userId, {
    key: "upload",
    maxRequests: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ─── Validation 1: File extension ──────────────────────
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !EXTENSION_MAP[extension]) {
      return NextResponse.json(
        {
          error: `Invalid file type ".${extension}". Allowed: JPG, PNG, WebP, GIF`,
        },
        { status: 400 }
      );
    }

    // ─── Validation 2: MIME type ───────────────────────────
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file format "${file.type}". Only images are allowed.`,
        },
        { status: 400 }
      );
    }

    // ─── Validation 3: File size ───────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          error: `File too large (${sizeMB}MB). Maximum size is 5MB.`,
        },
        { status: 400 }
      );
    }

    // ─── Validation 4: Empty file check ────────────────────
    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 }
      );
    }

    // ─── Validation 5: Magic bytes check ───────────────────
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const expectedMime = EXTENSION_MAP[extension];

    if (!validateMagicBytes(buffer, expectedMime)) {
      return NextResponse.json(
        {
          error: "File content doesn't match its extension. Possible disguised file.",
        },
        { status: 400 }
      );
    }

    // ─── Upload to Cloudinary ──────────────────────────────
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const timestamp = Math.round(Date.now() / 1000);
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

      const crypto = await import("crypto");
      const signature = crypto.default
        .createHash("sha1")
        .update(`timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
        .digest("hex");

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("upload_preset", "unsigned_mohan");
      uploadFormData.append("timestamp", String(timestamp));
      uploadFormData.append("api_key", process.env.CLOUDINARY_API_KEY);
      uploadFormData.append("signature", signature);

      // Request auto-optimization
      uploadFormData.append("quality", "auto");
      uploadFormData.append("fetch_format", "auto");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: uploadFormData }
      );
      const data = await res.json();
      if (data.url) {
        return NextResponse.json({
          url: data.url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
        });
      }
    }

    // ─── Fallback: Save locally (dev only) ─────────────────
    const ext = extension || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { writeFileSync, mkdirSync } = await import("fs");
    const { join } = await import("path");
    const uploadDir = join(process.cwd(), "public/uploads");
    mkdirSync(uploadDir, { recursive: true });
    writeFileSync(join(uploadDir, filename), buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      width: 0,
      height: 0,
      format: ext,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
