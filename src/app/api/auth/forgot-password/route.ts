import { NextResponse } from "next/server";
import { getResetTokenTTLMinutes, issuePasswordResetToken } from "../users-store";
// Note: extensionless import so Next.js/TypeScript can resolve the .ts source.
import { checkRateLimit, enforceAll } from "../rate-limit";
import { sendPasswordResetEmail } from "../mailer";
import { getFirebaseUserByEmail } from "../firebase-auth";
import { adminAuth } from "../../../lib/firebaseAdmin";

// Toggle between Firebase (true) and in-memory (false)
const USE_FIREBASE = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? true : false;

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
  console.log("🔍 [ForgotPassword] USE_FIREBASE:", USE_FIREBASE);
  
  if (USE_FIREBASE) {
    try {
      console.log("🔥 [ForgotPassword] Checking Firebase for user...");
      const firebaseUser = await getFirebaseUserByEmail(email.trim().toLowerCase());
      if (firebaseUser) {
        console.log("✅ [ForgotPassword] User found in Firebase");
        
        // Determine the continue URL (must be valid HTTPS or localhost)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
        let continueUrl = "https://plant-hub-5g3m.vercel.app/login"; // Default fallback
        
        if (appUrl) {
          // Ensure it's a full URL with protocol
          if (appUrl.startsWith("http://") || appUrl.startsWith("https://")) {
            continueUrl = `${appUrl}/login`;
          } else {
            continueUrl = `https://${appUrl}/login`;
          }
        }
        
        console.log("🔗 [ForgotPassword] Continue URL:", continueUrl);
        
        // Use Firebase's built-in password reset
        const resetLink = await adminAuth().generatePasswordResetLink(firebaseUser.email, {
          url: continueUrl,
        });
        
        console.log("✅ [ForgotPassword] Firebase reset link generated");
        
        // Send the reset email with Firebase link
        const emailResult = await sendPasswordResetEmail({
          to: firebaseUser.email,
          token: resetLink, // Pass the full Firebase link as token
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Firebase links expire in 1 hour
        });
        
        console.log("📧 [ForgotPassword] Email result:", { delivered: emailResult.delivered, error: emailResult.error });
        
        return NextResponse.json({
          message: emailResult.message,
          resetUrl: resetLink,
          emailDelivered: emailResult.delivered,
        }, { status: 200 });
      } else {
        console.log("ℹ️ [ForgotPassword] User not found in Firebase");
      }
    } catch (error) {
      const firebaseError = error as {
        code?: string;
        message?: string;
        errorInfo?: {
          code?: string;
          message?: string;
        };
      };

      const errorCode = firebaseError.errorInfo?.code ?? firebaseError.code;
      const errorMessage = firebaseError.errorInfo?.message ?? firebaseError.message;

      const messageIncludesResetLimit = typeof errorMessage === "string" && errorMessage.includes("RESET_PASSWORD_EXCEED_LIMIT");
      const codeIsResetLimit = errorCode === "RESET_PASSWORD_EXCEED_LIMIT";

      if (messageIncludesResetLimit || codeIsResetLimit) {
        console.warn("⚠️ [ForgotPassword] Firebase reset limit reached for", email);
        return NextResponse.json(
          {
            message:
              "คุณขอรีเซ็ตรหัสผ่านบ่อยเกินไป กรุณารอประมาณ 1 ชั่วโมงก่อนลองใหม่อีกครั้ง หรือเช็กอีเมลก่อนหน้า",
            emailDelivered: false,
            reason: "RESET_PASSWORD_EXCEED_LIMIT",
          },
          { status: 200 },
        );
      }

      console.error("❌ [ForgotPassword] Firebase error:", {
        code: errorCode,
        message: errorMessage,
        stack: error instanceof Error ? error.stack : String(error),
      });

      return NextResponse.json(
        {
          message: "ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ในขณะนี้ กรุณาลองใหม่ภายหลัง",
          emailDelivered: false,
          reason: errorCode ?? "FIREBASE_ERROR",
        },
        { status: 500 },
      );
    }
  }
  
  // Fallback to in-memory store
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
