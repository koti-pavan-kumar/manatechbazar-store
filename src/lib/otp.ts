import { db } from "./prisma";

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in database
export async function storeOTP(phone: string, code: string, type: string = "REGISTER") {
  // Delete any existing OTPs for this phone/type
  await db.verificationCode.deleteMany({
    where: { email: phone, type },
  });

  // Create new OTP (expires in 10 minutes)
  await db.verificationCode.create({
    data: {
      email: phone, // We reuse the email column for phone
      code,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
}

// Verify OTP
export async function verifyOTP(phone: string, code: string, type: string = "REGISTER"): Promise<boolean> {
  const record = await db.verificationCode.findFirst({
    where: {
      email: phone,
      code,
      type,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) return false;

  // Mark as used
  await db.verificationCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  return true;
}

// Send OTP via Fast2SMS
export async function sendOTPviaSMS(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    // In development, just log the OTP
    console.log(`📱 [DEV] OTP for ${phone}: ${otp}`);
    return { success: true };
  }

  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": apiKey,
        "accept": "*/*",
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        variables_values: otp,
        route: "otp",
        numbers: phone,
      }),
    });

    const data = await response.json();

    if (data.return === true) {
      return { success: true };
    } else {
      console.error("Fast2SMS error:", data);
      return { success: false, error: data.message || "Failed to send OTP" };
    }
  } catch (error) {
    console.error("Fast2SMS error:", error);
    return { success: false, error: "Failed to send OTP" };
  }
}

// Send OTP (generate + store + send)
export async function sendOTP(phone: string, type: string = "REGISTER"): Promise<{ success: boolean; otp?: string; error?: string }> {
  const otp = generateOTP();
  await storeOTP(phone, otp, type);
  const result = await sendOTPviaSMS(phone, otp);

  if (result.success) {
    // In dev mode, return the OTP for testing
    const isDev = !process.env.FAST2SMS_API_KEY;
    return { success: true, otp: isDev ? otp : undefined };
  } else {
    return { success: false, error: result.error };
  }
}
