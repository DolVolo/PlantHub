import { NextResponse } from "next/server";
import { authenticate } from "../users-store";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ message: "ต้องระบุอีเมลและรหัสผ่าน" }, { status: 400 });
  }

  const user = authenticate(email, password);
  if (!user) {
    return NextResponse.json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  return NextResponse.json(user);
}
