import { NextResponse } from "next/server";
import { getResetTokenTTLMinutes, issuePasswordResetToken } from "../users-store";
// Note: extensionless import so Next.js/TypeScript can resolve the .ts source.
import { checkRateLimit, enforceAll } from "../rate-limit";
import { sendPasswordResetEmail } from "../mailer";

interface ForgotPasswordResponse {
  message: string;
  token?: string;
  expiresAt?: string;
  resetUrl?: string;
  emailDelivered?: boolean;
}

export async function POST(request: Request) {
  console.log("🔍 [ForgotPassword] Route invoked");
  const { email } = (await request.json()) as { email?: string };

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  console.log("🔍 [ForgotPassword] Email:", email?.substring(0, 5) + "***", "IP:", ip);

  if (!email) {
    console.log("❌ [ForgotPassword] No email provided");
    return NextResponse.json({ message: "กรุณาระบุอีเมล" }, { status: 400 });
  }

  // Rate limit by IP and email (best-effort; replace with durable store later)
  const limits = [
    checkRateLimit({ key: `fp:ip:${ip}`, limit: 20, windowMs: 10 * 60 * 1000 }), // 20 per 10 min per IP
    checkRateLimit({ key: `fp:email:${email.toLowerCase()}`, limit: 5, windowMs: 15 * 60 * 1000 }), // 5 per 15 min per email
  ];
  const blocked = enforceAll(limits);
  if (blocked) {
    console.log("⚠️ [ForgotPassword] Rate limit hit for", email);
    return NextResponse.json(
      {
        message:
          "เราได้รับคำขอจำนวนมาก กรุณารอสักครู่ก่อนลองอีกครั้ง (จำกัดความพยายามเพื่อความปลอดภัย)",
      },
      { status: 429, headers: blocked.retryAfterSeconds ? { "Retry-After": String(blocked.retryAfterSeconds) } : undefined },
    );
  }

  console.log("🔍 [ForgotPassword] Issuing token...");
  const result = issuePasswordResetToken(email.trim().toLowerCase());
  const ttlMinutes = getResetTokenTTLMinutes();

  const response: ForgotPasswordResponse = {
    message: `หากอีเมลอยู่ในระบบ เราได้สร้างลิงก์รีเซ็ตรหัสผ่านให้แล้ว (มีอายุ ${ttlMinutes} นาที)`,
  };

  if (result) {
    console.log("✅ [ForgotPassword] Token issued:", result.token?.substring(0, 8) + "***");
    response.token = result.token;
    response.expiresAt = new Date(result.expiresAt).toISOString();

    console.log("📧 [ForgotPassword] Attempting to send email...");
    const emailResult = await sendPasswordResetEmail({
      to: result.user.email,
      token: result.token,
      expiresAt: new Date(result.expiresAt),
    });

    console.log("📧 [ForgotPassword] Email result:", { delivered: emailResult.delivered, error: emailResult.error });
    response.resetUrl = emailResult.resetUrl;
    response.emailDelivered = emailResult.delivered;

    console.info(
      "[PlantHub] Password reset token generated",
      JSON.stringify(
        {
          email: result.user.email,
          token: response.token,
          expiresAt: response.expiresAt,
          emailDelivered: emailResult.delivered,
        },
        null,
        2,
      ),
    );

    response.message = emailResult.message;
  } else {
    console.log("ℹ️ [ForgotPassword] Email not found in users store");
  }

  console.log("✅ [ForgotPassword] Returning response");
  return NextResponse.json(response, { status: 200 });
}
