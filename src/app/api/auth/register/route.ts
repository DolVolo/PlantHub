import { NextResponse } from "next/server";
import { createFirebaseUser } from "../firebase-auth";

// Toggle between Firebase (true) and in-memory (false)
const USE_FIREBASE = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? true : false;

export async function POST(request: Request) {
  const { name, email, password, role } = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || !email || !password) {
    return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
  }

  try {
    let user;
    if (USE_FIREBASE) {
      // Firebase Auth + Firestore
      user = await createFirebaseUser({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        role: role === "seller" ? "seller" : "buyer",
      });
      console.info("[Register] Firebase user created:", user.id);
    } else {
      // Fallback: in-memory (for local dev without Firebase)
      const { createUser, emailExists } = await import("../users-store");
      if (emailExists(email)) {
        return NextResponse.json({ message: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
      }
      user = createUser({ name, email, password, role: role === "seller" ? "seller" : "buyer" });
      console.info("[Register] In-memory user created:", user.id);
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ไม่สามารถสร้างบัญชีได้";
    console.error("[Register] Error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
