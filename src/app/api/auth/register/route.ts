import { NextResponse } from "next/server";
import { createUser, emailExists } from "../users-store";

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

  if (emailExists(email)) {
    return NextResponse.json({ message: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
  }

  const user = createUser({ name, email, password, role: role === "seller" ? "seller" : "buyer" });
  return NextResponse.json(user, { status: 201 });
}
