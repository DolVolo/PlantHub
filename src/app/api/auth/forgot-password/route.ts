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
  const { email } = (await request.json()) as { email?: string };

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  if (!email) {
    return NextResponse.json({ message: "กรุณาระบุอีเมล" }, { status: 400 });
  }

  // Rate limit by IP and email (best-effort; replace with durable store later)
  const limits = [
    checkRateLimit({ key: `fp:ip:${ip}`, limit: 20, windowMs: 10 * 60 * 1000 }), // 20 per 10 min per IP
    checkRateLimit({ key: `fp:email:${email.toLowerCase()}`, limit: 5, windowMs: 15 * 60 * 1000 }), // 5 per 15 min per email
  ];
  const blocked = enforceAll(limits);
  if (blocked) {
    return NextResponse.json(
      {
        message:
          "เราได้รับคำขอจำนวนมาก กรุณารอสักครู่ก่อนลองอีกครั้ง (จำกัดความพยายามเพื่อความปลอดภัย)",
      },
      { status: 429, headers: blocked.retryAfterSeconds ? { "Retry-After": String(blocked.retryAfterSeconds) } : undefined },
    );
  }

  const result = issuePasswordResetToken(email.trim().toLowerCase());
  const ttlMinutes = getResetTokenTTLMinutes();

  const response: ForgotPasswordResponse = {
    message: `หากอีเมลอยู่ในระบบ เราได้สร้างลิงก์รีเซ็ตรหัสผ่านให้แล้ว (มีอายุ ${ttlMinutes} นาที)`,
  };

  if (result) {
    response.token = result.token;
    response.expiresAt = new Date(result.expiresAt).toISOString();

    const emailResult = await sendPasswordResetEmail({
      to: result.user.email,
      token: result.token,
      expiresAt: new Date(result.expiresAt),
    });

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
  }

  return NextResponse.json(response, { status: 200 });
}
