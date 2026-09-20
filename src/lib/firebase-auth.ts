/**
 * Firebase Phone Auth via Identity Platform REST API
 * No Firebase SDK needed on the client — pure server-side OTP
 */

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const IDENTITY_URL = "https://identitytoolkit.googleapis.com/v1/accounts";

// Send OTP to phone number
export async function sendFirebaseOTP(phone: string): Promise<{ success: boolean; sessionInfo?: string; error?: string }> {
  if (!FIREBASE_API_KEY) {
    console.error("FIREBASE_API_KEY not set");
    return { success: false, error: "Firebase not configured" };
  }

  // Normalize to +91 format
  let normalizedPhone = phone.replace(/[\s\-]/g, "");
  if (!normalizedPhone.startsWith("+91")) {
    if (normalizedPhone.startsWith("91") && normalizedPhone.length === 12) {
      normalizedPhone = "+91" + normalizedPhone.slice(2);
    } else {
      normalizedPhone = "+91" + normalizedPhone;
    }
  }

  try {
    const response = await fetch(
      `${IDENTITY_URL}:sendVerificationCode?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: normalizedPhone,
          recaptchaToken: "", // For server-side, we use a bypass or reCAPTCHA Enterprise
        }),
      }
    );

    const data = await response.json();

    if (data.sessionInfo) {
      return { success: true, sessionInfo: data.sessionInfo };
    } else {
      console.error("Firebase send OTP error:", data);
      return { success: false, error: data.error?.message || "Failed to send OTP" };
    }
  } catch (error) {
    console.error("Firebase send OTP error:", error);
    return { success: false, error: "Failed to send OTP" };
  }
}

// Verify OTP code
export async function verifyFirebaseOTP(sessionInfo: string, code: string): Promise<{ success: boolean; error?: string }> {
  if (!FIREBASE_API_KEY) {
    return { success: false, error: "Firebase not configured" };
  }

  try {
    const response = await fetch(
      `${IDENTITY_URL}:verifyPhoneNumber?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionInfo,
          code,
        }),
      }
    );

    const data = await response.json();

    if (data.idToken) {
      return { success: true };
    } else {
      console.error("Firebase verify OTP error:", data);
      return { success: false, error: data.error?.message || "Invalid OTP" };
    }
  } catch (error) {
    console.error("Firebase verify OTP error:", error);
    return { success: false, error: "Failed to verify OTP" };
  }
}
