import { Cashfree } from "cashfree-pg";

const appId = process.env.CASHFREE_APP_ID || "";
const secretKey = process.env.CASHFREE_SECRET_KEY || "";
const isProd = process.env.CASHFREE_ENV === "production";

// v5 SDK uses constructor with environment enum
export const cashfree = new Cashfree(
  isProd ? ("PRODUCTION" as any) : ("SANDBOX" as any),
  appId,
  secretKey
);

export const CASHFREE_API_VERSION = "2023-08-01";
