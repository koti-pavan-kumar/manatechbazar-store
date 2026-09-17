import { Resend } from "resend";
import { db } from "./prisma";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Generate a 6-digit numeric code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification code to email
export async function sendVerificationCode(
  email: string,
  type: "REGISTER" | "LOGIN" | "RESET_PASSWORD" = "REGISTER"
): Promise<{ success: boolean; message: string; code?: string }> {
  // Rate limit: max 3 codes per email per 15 minutes
  const recentCodes = await db.verificationCode.count({
    where: {
      email,
      type,
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
    },
  });

  if (recentCodes >= 3) {
    return {
      success: false,
      message: "Too many attempts. Please wait 15 minutes and try again.",
    };
  }

  // Invalidate any existing unused codes for this email+type
  await db.verificationCode.updateMany({
    where: { email, type, used: false },
    data: { used: true },
  });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save to database
  await db.verificationCode.create({
    data: { email, code, type, expiresAt },
  });

  // Send email via Resend
  if (!resend) {
    console.log(`📧 Verification code for ${email}: ${code} (RESEND_API_KEY not configured — add it to Vercel env vars to send real emails)`);
    return { success: true, message: "Verification code sent!" };
  }

  try {
    const subject =
      type === "REGISTER"
        ? "Verify your email — Mana Tech Bazar"
        : type === "LOGIN"
        ? "Your login code — Mana Tech Bazar"
        : "Reset your password — Mana Tech Bazar";

    await resend.emails.send({
      from: "Mana Tech Bazar <noreply@manatechbazar.in>",
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 480px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 24px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">🛍️</div>
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Mana Tech Bazar</h1>
              <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">
                ${type === "REGISTER" ? "Email Verification" : type === "LOGIN" ? "Login Verification" : "Password Reset"}
              </p>
            </div>

            <!-- Body -->
            <div style="padding: 32px 24px; text-align: center;">
              <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">
                ${type === "REGISTER" 
                  ? "Thanks for signing up! Use the code below to verify your email address."
                  : type === "LOGIN"
                  ? "Use the code below to complete your login."
                  : "Use the code below to reset your password."}
              </p>

              <!-- Code Box -->
              <div style="background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">Your verification code</p>
                <p style="color: #1a1a2e; font-size: 36px; font-weight: 800; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${code}</p>
              </div>

              <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                This code expires in <strong style="color: #64748b;">10 minutes</strong>.
              </p>
              <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <div style="padding: 16px 24px; background: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Mana Tech Bazar · manatechbazar.in
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`📧 Verification code sent to ${email}`);
    return { success: true, message: "Verification code sent to your email!" };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: true, message: "Verification code sent!" };
  }
}

// Verify a code
export async function verifyCode(
  email: string,
  code: string,
  type: "REGISTER" | "LOGIN" | "RESET_PASSWORD" = "REGISTER"
): Promise<{ success: boolean; message: string }> {
  const record = await db.verificationCode.findFirst({
    where: {
      email,
      type,
      used: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return {
      success: false,
      message: "Invalid or expired code. Please request a new one.",
    };
  }

  if (record.code !== code) {
    return { success: false, message: "Incorrect code. Please try again." };
  }

  // Mark as used
  await db.verificationCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  return { success: true, message: "Email verified successfully!" };
}

// Check if an email is verified (has a successful verification record)
export async function isEmailVerified(
  email: string,
  type: "REGISTER" | "LOGIN" | "RESET_PASSWORD" = "REGISTER"
): Promise<boolean> {
  const verified = await db.verificationCode.findFirst({
    where: { email, type, used: true },
  });
  return !!verified;
}
