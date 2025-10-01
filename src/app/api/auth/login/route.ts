import { NextResponse } from "next/server";
import { verifyFirebaseUser } from "../firebase-auth";

// Toggle between Firebase (true) and in-memory (false)
const USE_FIREBASE = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? true : false;

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ message: "ต้องระบุอีเมลและรหัสผ่าน" }, { status: 400 });
  }

  try {
    if (USE_FIREBASE) {
      // Firebase Auth: verify email exists, client will handle actual sign-in
      const user = await verifyFirebaseUser(email.trim().toLowerCase());
      if (!user) {
        return NextResponse.json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
      }
      // Return user profile; client should use Firebase Auth SDK for actual sign-in
      return NextResponse.json({
        ...user,
        _note: "Client should call signInWithEmailAndPassword for auth token",
      });
    } else {
      // Fallback: in-memory
      const { authenticate } = await import("../users-store");
      const user = authenticate(email, password);
      if (!user) {
        return NextResponse.json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
      }
      return NextResponse.json(user);
    }
  } catch (error) {
    console.error("[Login] Error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }, { status: 500 });
  }
}
