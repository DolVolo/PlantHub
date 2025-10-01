import { NextResponse } from "next/server";
import { createFirebaseUser } from "../firebase-auth";

// Toggle between Firebase (true) and in-memory (false)
const USE_FIREBASE = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? true : false;

export async function POST(request: Request) {
  console.log("🔍 [Register] Starting registration...");
  console.log("🔍 [Register] USE_FIREBASE:", USE_FIREBASE);
  console.log("🔍 [Register] Has FIREBASE_PROJECT_ID:", !!process.env.FIREBASE_PROJECT_ID);
  console.log("🔍 [Register] Has FIREBASE_CLIENT_EMAIL:", !!process.env.FIREBASE_CLIENT_EMAIL);
  console.log(
    "🔍 [Register] FIREBASE_PRIVATE_KEY length:",
    process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0,
  );
  
  const { name, email, password, role } = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  console.log("🔍 [Register] Input:", { name, email: email?.substring(0, 5) + "***", role });

  if (!name || !email || !password) {
    return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
  }

  try {
    let user;
    if (USE_FIREBASE) {
      console.log("🔥 [Register] Using Firebase...");
      // Firebase Auth + Firestore
      user = await createFirebaseUser({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        role: role === "seller" ? "seller" : "buyer",
      });
      console.info("✅ [Register] Firebase user created:", user.id);
    } else {
      console.log("💾 [Register] Using in-memory...");
      // Fallback: in-memory (for local dev without Firebase)
      const { createUser, emailExists } = await import("../users-store");
      if (emailExists(email)) {
        return NextResponse.json({ message: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
      }
      user = createUser({ name, email, password, role: role === "seller" ? "seller" : "buyer" });
      console.info("✅ [Register] In-memory user created:", user.id);
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ไม่สามารถสร้างบัญชีได้";
    console.error("❌ [Register] Error message:", message);
    if (error instanceof Error) {
      console.error("❌ [Register] Error stack:", error.stack);
      const errorWithCode = error as Error & { code?: unknown };
      if (typeof errorWithCode.code !== "undefined") {
        console.error("❌ [Register] Error code:", errorWithCode.code);
      }
    } else {
      console.error("❌ [Register] Error (non-Error object):", JSON.stringify(error));
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
