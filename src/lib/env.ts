/**
 * Environment variable validation.
 * Runs on server-side only. Import this in API routes or server components.
 */

const REQUIRED_SERVER_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
] as const;

const RECOMMENDED_VARS = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GROQ_API_KEY",
  "CRON_SECRET",
] as const;

let validated = false;

export function validateEnv() {
  // Only run on server
  if (typeof window !== "undefined") return;

  if (validated) return;
  validated = true;

  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_SERVER_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const key of RECOMMENDED_VARS) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  if (missing.length > 0) {
    console.error("\n❌ CRITICAL: Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\n   Set these in .env.local or your hosting dashboard.\n");
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️  Missing optional environment variables (features will be limited):");
    warnings.forEach((key) => console.warn(`   - ${key}`));
    console.warn("");
  }

  // Validate Razorpay key format
  if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.startsWith("rzp_")) {
    console.warn("⚠️  RAZORPAY_KEY_ID doesn't start with 'rzp_'. Are you using test or live keys?");
  }

  // Validate AUTH_SECRET strength
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length < 32) {
    console.warn("⚠️  AUTH_SECRET should be at least 32 characters for security.");
  }
}

/**
 * Get a required environment variable or throw.
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get an optional environment variable with a default.
 */
export function getOptionalEnv(key: string, defaultValue: string = ""): string {
  return process.env[key] || defaultValue;
}
