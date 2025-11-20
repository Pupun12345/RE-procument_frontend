// src/lib/auth.ts

let DEMO_OTP = "000000";

export async function sendOtp(phone: string) {
  DEMO_OTP = Math.floor(100000 + Math.random() * 900000).toString();

  console.log(`📌 DEMO OTP for ${phone}: ${DEMO_OTP}`);

  // 🔥 Dispatch OTP event so UI can auto-read it
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("demo-otp", { detail: DEMO_OTP }));
  }

  return "demo-session";
}

export async function verifyOtp(sessionInfo: string, otp: string) {
  if (otp === DEMO_OTP) {
    return { idToken: "demo-token" };
  }
  return { idToken: null };
}
